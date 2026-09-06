"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ErrorApi, llamarApi } from "@/lib/api";

const resolverSchema = z.object({
  resolution: z.enum(["RESOLVED_FOUNDED", "RESOLVED_UNFOUNDED", "REJECTED_INADMISSIBLE"]),
  reason: z
    .string()
    .trim()
    .min(20, "La resolución debe estar motivada (mínimo 20 caracteres)")
    .max(4000),
  criterionKey: z.string().trim().optional(),
  newValue: z.coerce.number().nonnegative().max(1000).optional(),
});

export interface Resultado {
  readonly ok: boolean;
  readonly error?: string;
  readonly exito?: string;
}

export async function asignarObjecion(id: string, evaluatorId: string): Promise<Resultado> {
  try {
    await llamarApi(`/internal/objections/${id}/assign`, { method: "POST", body: { evaluatorId } });
    revalidatePath("/objeciones");
    return { ok: true, exito: "Objeción asignada." };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo asignar" };
  }
}

/**
 * Resuelve la objeción.
 *
 * El ajuste de puntaje viaja como propuesta dentro de la resolución: es la
 * API quien decide si procede (sólo si se declara FUNDADA) y quien lo aplica
 * como ajuste trazable. Aquí no se toca ningún puntaje.
 */
export async function resolverObjecion(
  id: string,
  _previo: Resultado,
  formData: FormData,
): Promise<Resultado> {
  const analisis = resolverSchema.safeParse({
    resolution: formData.get("resolution"),
    reason: formData.get("reason"),
    criterionKey: String(formData.get("criterionKey") ?? "") || undefined,
    newValue: formData.get("newValue") ? formData.get("newValue") : undefined,
  });

  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { resolution, reason, criterionKey, newValue } = analisis.data;
  const proposedAdjustment =
    criterionKey && newValue !== undefined ? { criterionKey, newValue } : null;

  try {
    await llamarApi(`/internal/objections/${id}/resolve`, {
      method: "POST",
      body: { resolution, reason, proposedAdjustment },
    });
    revalidatePath("/objeciones");
    return {
      ok: true,
      exito: proposedAdjustment
        ? "Objeción resuelta y ajuste registrado. El puntaje anterior se conserva en el historial."
        : "Objeción resuelta.",
    };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo resolver" };
  }
}

/**
 * Solicita información adicional al objetante.
 *
 * Deja la objeción en espera sin cerrarla: si faltan pruebas, cerrarla como
 * infundada sería injusto, y dejarla sin tocar la haría envejecer sin que
 * nadie sepa por qué.
 */
export async function solicitarInformacion(
  id: string,
  _previo: Resultado,
  formData: FormData,
): Promise<Resultado> {
  const motivo = String(formData.get("reason") ?? "").trim();
  if (motivo.length < 15) {
    return { ok: false, error: "Indique qué información falta (mínimo 15 caracteres)" };
  }
  try {
    await llamarApi(`/internal/objections/${id}/request-info`, {
      method: "POST",
      body: { reason: motivo },
    });
    revalidatePath("/objeciones");
    return { ok: true, exito: "Solicitud registrada. La objeción queda en espera." };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo solicitar" };
  }
}
