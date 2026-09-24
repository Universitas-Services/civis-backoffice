"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface Resultado {
  readonly ok: boolean;
  readonly error?: string;
  readonly exito?: string;
}

export async function cambiarLapsoObjeciones(abierto: boolean): Promise<Resultado> {
  try {
    await llamarApiAccion("/internal/portal", {
      method: "PATCH",
      body: { objectionsOpen: abierto },
    });
    revalidatePath("/objeciones");
    return {
      ok: true,
      exito: abierto
        ? "El botón de objetar ya se muestra en el sitio público."
        : "El botón de objetar quedó oculto en el sitio público.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo cambiar el lapso",
    };
  }
}

const motivacionSchema = z
  .string()
  .trim()
  .min(20, "La motivación es obligatoria (mínimo 20 caracteres)")
  .max(3000, "La motivación no puede superar 3000 caracteres");

export async function declararInelegible(evaluationId: string, motivo: string): Promise<Resultado> {
  const analisis = motivacionSchema.safeParse(motivo);
  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await llamarApiAccion(`/internal/evaluations/${evaluationId}/declarar-inelegible`, {
      method: "POST",
      body: { motivation: analisis.data },
    });
    revalidatePath("/objeciones");
    revalidatePath("/ranking");
    return {
      ok: true,
      exito: "Quedó inelegible y ya no aparece en los rankings.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo declarar la inelegibilidad",
    };
  }
}

export async function generarInformeObjeciones(
  candidateId: string,
): Promise<{ ok: boolean; informe?: string; error?: string }> {
  try {
    const r = await llamarApiAccion<{ informe: string }>(
      `/internal/objections/candidate/${candidateId}/ai-summary`,
      { method: "POST", timeoutMs: 180_000 },
    );
    return { ok: true, informe: r.informe };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo generar el informe",
    };
  }
}
