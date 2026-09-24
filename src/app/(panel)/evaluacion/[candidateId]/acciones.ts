"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ErrorApi, llamarApiAccion } from "@/lib/api";
import { BLOQUE_ELEGIBILIDAD_IDS, CAUSAL_INELEGIBILIDAD_IDS } from "@/lib/elegibilidad";

export interface Resultado {
  readonly ok: boolean;
  readonly error?: string;
}

const lineaBaremoSchema = z.object({
  criterioId: z.string().uuid(),
  rangoId: z.string().uuid(),
  points: z.number().finite().nonnegative().max(1000),
  resultado: z.string().trim().max(2000).nullable(),
});

/**
 * Guarda los rangos marcados del baremo congelado.
 * No envía total: la API suma, valida el tope de cada criterio y devuelve totalPoints.
 */
export async function guardarLineasBaremo(
  evaluationId: string,
  candidateId: string,
  lineas: readonly z.infer<typeof lineaBaremoSchema>[],
): Promise<{
  readonly ok: boolean;
  readonly error?: string;
  readonly totalPoints?: number;
  readonly band?: string;
}> {
  const analisis = z.array(lineaBaremoSchema).min(1).safeParse(lineas);
  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const evaluacion = await llamarApiAccion<{
      totalPoints: string | number;
      band: string;
    }>(`/internal/evaluations/${evaluationId}/scores`, {
      method: "PUT",
      body: { lineas: analisis.data },
    });
    revalidatePath(`/baremo/${candidateId}`);
    revalidatePath("/baremo");
    return {
      ok: true,
      totalPoints: Number(evaluacion.totalPoints),
      band: evaluacion.band,
    };
  } catch (error) {
    return { ok: false, error: mensajeDeApi(error, "No se pudo guardar") };
  }
}

function mensajeDeApi(error: unknown, fallback: string): string {
  if (error instanceof ErrorApi) {
    return error.detalles?.[0]?.message ?? error.message;
  }
  return fallback;
}

export async function enviarEvaluacion(
  evaluationId: string,
  candidateId: string,
): Promise<Resultado> {
  try {
    await llamarApiAccion(`/internal/evaluations/${evaluationId}/submit`, { method: "POST" });
    revalidatePath(`/evaluacion/${candidateId}`);
    revalidatePath(`/baremo/${candidateId}`);
    revalidatePath("/baremo");
    revalidatePath("/ranking");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo enviar" };
  }
}

export async function aprobarEvaluacion(
  evaluationId: string,
  candidateId: string,
  reason: string,
): Promise<Resultado> {
  if (reason.trim().length < 10) {
    return { ok: false, error: "La aprobación debe estar motivada (mínimo 10 caracteres)" };
  }
  try {
    await llamarApiAccion(`/internal/evaluations/${evaluationId}/approve`, {
      method: "POST",
      body: { reason },
    });
    revalidatePath(`/evaluacion/${candidateId}`);
    revalidatePath(`/baremo/${candidateId}`);
    revalidatePath("/baremo");
    revalidatePath("/ranking");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo aprobar" };
  }
}

const checklistSchema = z.record(z.string(), z.boolean());

const motivacionSchema = z
  .string()
  .trim()
  .min(20, "La motivación es obligatoria (mínimo 20 caracteres)")
  .max(3000, "La motivación no puede superar 3000 caracteres");

const declararElegibleSchema = z.object({
  checklist: checklistSchema,
  motivo: motivacionSchema,
});

const declararInelegibleSchema = z.object({
  checklist: checklistSchema,
  motivo: motivacionSchema,
  causales: z.array(z.enum(CAUSAL_INELEGIBILIDAD_IDS)).min(1, "Indique al menos una causal"),
});

export type ResultadoElegibilidadAccion = {
  readonly ok: boolean;
  readonly error?: string;
};

/** Paso 1: declara elegible y deja el expediente en evaluación (baremo). */
export async function declararElegible(
  candidateId: string,
  payload: z.infer<typeof declararElegibleSchema>,
): Promise<ResultadoElegibilidadAccion> {
  const parsed = declararElegibleSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  for (const id of BLOQUE_ELEGIBILIDAD_IDS) {
    if (parsed.data.checklist[id] !== true) {
      return { ok: false, error: "El checklist de elegibilidad debe estar completo" };
    }
  }
  try {
    await llamarApiAccion(`/internal/evaluations/candidate/${candidateId}/eligibility`, {
      method: "POST",
      body: {
        decision: "ELIGIBLE",
        checklist: parsed.data.checklist,
        motivation: parsed.data.motivo,
        causales: [],
      },
    });
    revalidatePath("/evaluacion");
    revalidatePath("/baremo");
    revalidatePath(`/evaluacion/${candidateId}`);
    revalidatePath(`/expedientes/${candidateId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo registrar la elegibilidad",
    };
  }
}

/** Paso 1: declara inelegible. El expediente queda descalificado. */
export async function declararInelegible(
  candidateId: string,
  payload: z.infer<typeof declararInelegibleSchema>,
): Promise<ResultadoElegibilidadAccion> {
  const parsed = declararInelegibleSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await llamarApiAccion(`/internal/evaluations/candidate/${candidateId}/eligibility`, {
      method: "POST",
      body: {
        decision: "INELIGIBLE",
        checklist: parsed.data.checklist,
        motivation: parsed.data.motivo,
        causales: parsed.data.causales,
      },
    });
    revalidatePath("/evaluacion");
    revalidatePath(`/evaluacion/${candidateId}`);
    revalidatePath(`/expedientes/${candidateId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo registrar la inelegibilidad",
    };
  }
}

const RUTA_INFORME_IA = (candidateId: string) =>
  `/internal/evaluations/candidate/${candidateId}/ai-summary`;

type RespuestaInformeIa = {
  readonly informe?: string | null;
};

/**
 * Último informe de elegibilidad, o cadena vacía si todavía no se pidió.
 * No es el dictamen: el evaluador confirma con declararElegible / declararInelegible.
 */
export async function leerInformeIaElegibilidad(
  candidateId: string,
): Promise<{ readonly ok: boolean; readonly texto: string; readonly error?: string }> {
  if (!candidateId.trim()) {
    return { ok: false, texto: "", error: "Expediente inválido" };
  }
  try {
    const respuesta = await llamarApiAccion<RespuestaInformeIa>(RUTA_INFORME_IA(candidateId));
    return {
      ok: true,
      texto: typeof respuesta.informe === "string" ? respuesta.informe : "",
    };
  } catch (error) {
    return {
      ok: false,
      texto: "",
      error: error instanceof ErrorApi ? error.message : "No se pudo cargar el Informe IA.",
    };
  }
}

/**
 * Pide un informe nuevo. La API conserva los anteriores y este pasa a ser el más reciente.
 * Puede tardar: el servicio de IA tiene hasta tres minutos.
 */
export async function generarInformeIaElegibilidad(
  candidateId: string,
): Promise<{ readonly ok: boolean; readonly texto?: string; readonly error?: string }> {
  if (!candidateId.trim()) {
    return { ok: false, error: "Expediente inválido" };
  }
  try {
    const respuesta = await llamarApiAccion<RespuestaInformeIa>(RUTA_INFORME_IA(candidateId), {
      method: "POST",
      timeoutMs: 180_000,
    });
    const texto = typeof respuesta.informe === "string" ? respuesta.informe.trim() : "";
    if (!texto) {
      return { ok: false, error: "La API no devolvió contenido para el informe." };
    }
    return { ok: true, texto };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof ErrorApi
          ? error.message
          : "No se pudo generar el Informe IA. Intente más tarde.",
    };
  }
}
