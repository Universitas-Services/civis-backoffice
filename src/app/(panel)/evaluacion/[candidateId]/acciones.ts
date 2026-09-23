"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ErrorApi, llamarApiAccion } from "@/lib/api";
import type { Evaluacion } from "@/contracts";
import { BLOQUE_ELEGIBILIDAD_IDS, CAUSAL_INELEGIBILIDAD_IDS } from "@/lib/elegibilidad";

const puntajeSchema = z.object({
  criterionKey: z.string().min(1),
  value: z.number().nonnegative().max(1000),
  justification: z.string().trim().max(2000).optional(),
  evidenceDocumentId: z.string().uuid().nullable().optional(),
  evidencePage: z.number().int().positive().nullable().optional(),
});

export interface Resultado {
  readonly ok: boolean;
  readonly error?: string;
  readonly evaluacion?: Evaluacion;
}

/**
 * Guarda los valores por criterio.
 *
 * Nótese que NO se envía ningún total: se mandan las cantidades declaradas y
 * la API devuelve el total recalculado. El totalizador de la pantalla muestra
 * lo que responde el servidor, nunca una suma hecha en el navegador.
 */
export async function guardarPuntajes(
  evaluationId: string,
  scores: readonly z.infer<typeof puntajeSchema>[],
  internalNotes?: string,
): Promise<Resultado> {
  const analisis = z.array(puntajeSchema).min(1).safeParse(scores);
  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const evaluacion = await llamarApiAccion<Evaluacion>(
      `/internal/evaluations/${evaluationId}/scores`,
      {
        method: "PUT",
        body: { scores: analisis.data, internalNotes },
      },
    );
    return { ok: true, evaluacion };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo guardar" };
  }
}

export async function enviarEvaluacion(
  evaluationId: string,
  candidateId: string,
): Promise<Resultado> {
  try {
    await llamarApiAccion(`/internal/evaluations/${evaluationId}/submit`, { method: "POST" });
    revalidatePath(`/evaluacion/${candidateId}`);
    revalidatePath(`/baremo/${candidateId}`);
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
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo aprobar" };
  }
}

const checklistSchema = z.record(z.string(), z.boolean());

const declararElegibleSchema = z.object({
  checklist: checklistSchema,
  motivo: z.string().trim().max(8000).optional(),
});

const declararInelegibleSchema = z.object({
  checklist: checklistSchema,
  motivo: z
    .string()
    .trim()
    .min(10, "Motive la inelegibilidad (mínimo 10 caracteres)")
    .max(8000),
  causales: z.array(z.enum(CAUSAL_INELEGIBILIDAD_IDS)).min(1, "Indique al menos una causal"),
});

export type ResultadoElegibilidadAccion = {
  readonly ok: boolean;
  readonly error?: string;
};

/** Registra elegibilidad (Paso 1). Valida payload y revalida rutas. */
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
  revalidatePath("/evaluacion");
  revalidatePath("/baremo");
  revalidatePath(`/evaluacion/${candidateId}`);
  return { ok: true };
}

/** Registra dictamen de inelegibilidad (Paso 1). */
export async function declararInelegible(
  candidateId: string,
  payload: z.infer<typeof declararInelegibleSchema>,
): Promise<ResultadoElegibilidadAccion> {
  const parsed = declararInelegibleSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  revalidatePath("/evaluacion");
  revalidatePath(`/evaluacion/${candidateId}`);
  return { ok: true };
}

/**
 * Genera el informe breve de elegibilidad vía IA.
 * No inventa texto: si la API falla, el front no marca el cupo de sesión.
 */
export async function generarInformeIaElegibilidad(
  candidateId: string,
): Promise<{ readonly ok: boolean; readonly texto?: string; readonly error?: string }> {
  if (!candidateId.trim()) {
    return { ok: false, error: "Expediente inválido" };
  }
  try {
    const respuesta = await llamarApiAccion<{ texto?: string; text?: string; brief?: string }>(
      `/internal/candidates/${candidateId}/eligibility-ai-brief`,
      { method: "POST", timeoutMs: 90_000 },
    );
    const texto =
      (typeof respuesta.texto === "string" && respuesta.texto) ||
      (typeof respuesta.text === "string" && respuesta.text) ||
      (typeof respuesta.brief === "string" && respuesta.brief) ||
      "";
    if (!texto.trim()) {
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
