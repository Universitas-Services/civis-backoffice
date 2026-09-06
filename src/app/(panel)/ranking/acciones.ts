"use server";

import { revalidatePath } from "next/cache";
import type { ResultadoRanking } from "@/contracts";
import { ErrorApi, llamarApi } from "@/lib/api";

export interface EstadoRanking {
  readonly error?: string;
  readonly exito?: string;
  readonly previa?: ResultadoRanking;
}

/**
 * Recalcula el ranking y lo deja anotado en la bitácora.
 *
 * El cálculo es determinístico, así que recalcular no cambia nada por sí
 * solo: sirve para dejar constancia de que alguien lo revisó en una fecha
 * concreta, antes de tomar una decisión de publicación.
 */
export async function recalcularRanking(): Promise<EstadoRanking> {
  try {
    const r = await llamarApi<ResultadoRanking>("/internal/ranking/recalculate", {
      method: "POST",
    });
    revalidatePath("/ranking");
    return {
      exito: `Ranking recalculado: ${r.eligibleCount} en competencia, ${r.ineligibleCount} inhabilitados. Queda registrado en la bitácora.`,
    };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo recalcular" };
  }
}

/**
 * Vista previa del ranking público.
 *
 * Sólo incluye a quienes tienen el perfil publicado: es exactamente lo que
 * verá la ciudadanía si se publica ahora, no el ranking interno completo.
 */
export async function vistaPreviaPublica(): Promise<EstadoRanking> {
  try {
    const previa = await llamarApi<ResultadoRanking>("/internal/ranking/public-preview");
    return { previa };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo cargar la previa" };
  }
}
