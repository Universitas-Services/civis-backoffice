"use server";

import { revalidatePath } from "next/cache";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface EstadoEnvioConsejo {
  readonly error?: string;
  readonly exito?: string;
  readonly enviada?: boolean;
}

/**
 * Envía la objeción al Consejo. Si no hay descargo, el motivo es obligatorio;
 * la API lo vuelve a exigir y su mensaje se muestra tal cual.
 */
export async function enviarAlConsejo(
  objectionId: string,
  conDescargo: boolean,
  _previo: EstadoEnvioConsejo,
  formData: FormData,
): Promise<EstadoEnvioConsejo> {
  const motivo = String(formData.get("motivo") ?? "").trim();
  if (!conDescargo && motivo.length < 10) {
    return {
      error: "Sin descargo, indique por qué la envía igual (mínimo 10 caracteres).",
    };
  }
  try {
    await llamarApiAccion(`/internal/comite/objeciones/${objectionId}/enviar-consejo`, {
      method: "POST",
      body: motivo ? { motivo } : {},
    });
  } catch (error) {
    return {
      error: error instanceof ErrorApi ? error.message : "No se pudo enviar al Consejo",
    };
  }
  revalidatePath("/comite-objeciones");
  revalidatePath(`/comite-objeciones/${objectionId}`);
  return { exito: "Objeción enviada al Consejo.", enviada: true };
}
