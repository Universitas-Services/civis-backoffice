"use server";

import { revalidatePath } from "next/cache";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface EstadoRanking {
  readonly error?: string;
  readonly exito?: string;
}

/**
 * Publica las fichas indicadas y refresca el ranking público en un solo paso.
 * La API no pide nota: el motivo de la bitácora lo escribe el servidor.
 */
export async function enviarAlRankingPublico(candidateIds: string[]): Promise<EstadoRanking> {
  if (candidateIds.length === 0) {
    return { error: "Seleccione al menos un postulante." };
  }
  try {
    const r = await llamarApiAccion<{ publicados: number; omitidos: number }>(
      "/internal/publications/ranking/enviar",
      { method: "POST", body: { candidateIds }, timeoutMs: 60_000 },
    );
    revalidatePath("/ranking");
    const yaEstaban = r.omitidos > 0 ? ` ${r.omitidos} ya estaban publicados.` : "";
    return { exito: `Enviados al ranking público: ${r.publicados}.${yaEstaban}` };
  } catch (error) {
    return {
      error: error instanceof ErrorApi ? error.message : "No se pudo enviar al ranking público",
    };
  }
}

/**
 * Vuelve a publicar la ficha y el ranking de alguien que ya está en el sitio
 * público, con su nota vigente. Para cuando la landing quedó desfasada.
 */
export async function actualizarEnRankingPublico(candidateId: string): Promise<EstadoRanking> {
  try {
    const r = await llamarApiAccion<{ refrescado: boolean; rankingVersion?: number }>(
      `/internal/publications/candidate/${candidateId}/refrescar`,
      { method: "POST", body: {}, timeoutMs: 60_000 },
    );
    revalidatePath("/ranking");
    if (!r.refrescado) {
      return { error: "Ese postulante ya no está en el ranking público." };
    }
    return { exito: `Ficha y ranking público actualizados (ranking v${r.rankingVersion}).` };
  } catch (error) {
    return {
      error: error instanceof ErrorApi ? error.message : "No se pudo actualizar el ranking público",
    };
  }
}
