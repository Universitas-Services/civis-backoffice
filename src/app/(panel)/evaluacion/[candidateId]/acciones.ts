"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ErrorApi, llamarApi } from "@/lib/api";
import type { Evaluacion } from "@/contracts";

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
    const evaluacion = await llamarApi<Evaluacion>(`/internal/evaluations/${evaluationId}/scores`, {
      method: "PUT",
      body: { scores: analisis.data, internalNotes },
    });
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
    await llamarApi(`/internal/evaluations/${evaluationId}/submit`, { method: "POST" });
    revalidatePath(`/evaluacion/${candidateId}`);
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
    await llamarApi(`/internal/evaluations/${evaluationId}/approve`, {
      method: "POST",
      body: { reason },
    });
    revalidatePath(`/evaluacion/${candidateId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo aprobar" };
  }
}
