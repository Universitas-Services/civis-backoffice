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
