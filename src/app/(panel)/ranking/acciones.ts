"use server";

import { revalidatePath } from "next/cache";
import { objecionVisualizadorSchema, opinionSchema } from "@/contracts";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface EstadoRanking {
  readonly error?: string;
  readonly exito?: string;
}

export interface EstadoObjecion extends EstadoRanking {
  /** Código de seguimiento que devuelve la API al registrar la objeción. */
  readonly trackingCode?: string;
}

function mensajeDe(error: unknown, porDefecto: string): string {
  if (error instanceof ErrorApi) {
    // Mientras la API no tenga estas rutas, no se muestra un 404 crudo.
    if (error.status === 404) return "Esta función todavía no está disponible en el servidor.";
    return error.message;
  }
  return porDefecto;
}

/**
 * Opinión de un visualizador sobre un postulante. Es un comentario: no
 * cambia el puntaje ni abre ningún trámite, y no se puede borrar.
 */
export async function opinar(
  candidateId: string,
  _previo: EstadoRanking,
  formData: FormData,
): Promise<EstadoRanking> {
  const analisis = opinionSchema.safeParse({ body: formData.get("body") });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Opinión inválida" };
  }
  try {
    await llamarApiAccion(`/internal/candidates/${candidateId}/opinions`, {
      method: "POST",
      body: analisis.data,
    });
    revalidatePath(`/ranking/${candidateId}`);
    revalidatePath("/ranking");
    return { exito: "Opinión registrada." };
  } catch (error) {
    return { error: mensajeDe(error, "No se pudo registrar la opinión") };
  }
}

/**
 * Objeción formal de un visualizador autenticado. La identidad la toma la
 * API de la sesión, así que no hay código por correo. Llega a la bandeja de
 * Objeciones; por sí sola no cambia el puntaje.
 */
export async function objetar(
  candidateId: string,
  _previo: EstadoObjecion,
  formData: FormData,
): Promise<EstadoObjecion> {
  const otra = formData.get("otherCause");
  const prefijo = formData.get("cedulaPrefijo") === "E" ? "E" : "V";
  const digitos = String(formData.get("cedulaDigitos") ?? "").replace(/\D/g, "");
  const analisis = objecionVisualizadorSchema.safeParse({
    objectorNationalId: `${prefijo}-${digitos}`,
    causes: formData.getAll("causes").map(String),
    otherCause: typeof otra === "string" && otra.trim() ? otra : undefined,
    description: formData.get("description"),
    evidenceUrl: formData.get("evidenceUrl"),
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Objeción inválida" };
  }
  try {
    const r = await llamarApiAccion<{ trackingCode: string }>(
      `/internal/candidates/${candidateId}/objections`,
      { method: "POST", body: analisis.data },
    );
    revalidatePath(`/ranking/${candidateId}`);
    return {
      exito: `Objeción registrada. Código de seguimiento: ${r.trackingCode}`,
      trackingCode: r.trackingCode,
    };
  } catch (error) {
    return { error: mensajeDe(error, "No se pudo registrar la objeción") };
  }
}

/**
 * Publica las fichas indicadas y refresca el ranking público en un solo paso.
 * Solo SUPER_ADMIN (la API lo exige). El motivo de la bitácora lo escribe el servidor.
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
    return { error: mensajeDe(error, "No se pudo enviar al ranking público") };
  }
}

/**
 * Vuelve a publicar la ficha y el ranking de alguien que ya está en el sitio
 * público, con su nota vigente. Para cuando una re-evaluación cambió la nota
 * interna y la landing quedó con la anterior.
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
    return { error: mensajeDe(error, "No se pudo actualizar el ranking público") };
  }
}

/**
 * Retira del sitio público a los indicados, o a todos si `candidateIds` es
 * null. El ranking interno no cambia: se pueden volver a enviar. Solo
 * SUPER_ADMIN (la API lo exige). El motivo queda en la bitácora.
 */
export async function retirarDelRankingPublico(
  candidateIds: string[] | null,
  motivo: string,
): Promise<EstadoRanking> {
  const reason = motivo.trim();
  if (reason.length < 10) return { error: "Escriba el motivo (al menos 10 caracteres)." };
  try {
    const r = await llamarApiAccion<{ retirados: number }>(
      "/internal/publications/ranking/retirar",
      {
        method: "POST",
        body: candidateIds ? { candidateIds, reason } : { reason },
        timeoutMs: 60_000,
      },
    );
    revalidatePath("/ranking");
    revalidatePath("/configuracion");
    return {
      exito: `Retirados del ranking público: ${r.retirados}. El sitio se actualiza en menos de un minuto.`,
    };
  } catch (error) {
    return { error: mensajeDe(error, "No se pudo retirar del ranking público") };
  }
}

export type AjusteInterruptor =
  | "viewerObjectionsOpen"
  | "objectionsOpen"
  | "publicRefreshEnabled"
  | "applicationsClosed";

const AJUSTES_INTERRUPTOR: readonly AjusteInterruptor[] = [
  "viewerObjectionsOpen",
  "objectionsOpen",
  "publicRefreshEnabled",
  "applicationsClosed",
];

const EXITO_AJUSTE: Record<AjusteInterruptor, [string, string]> = {
  viewerObjectionsOpen: [
    "Los visualizadores ya pueden objetar.",
    "Los visualizadores ya no ven «Objetar».",
  ],
  objectionsOpen: [
    "Objeciones públicas abiertas en la landing.",
    "Objeciones públicas cerradas en la landing.",
  ],
  publicRefreshEnabled: [
    "Admin y evaluadores ya ven «Actualizar en el ranking público».",
    "Solo usted ve «Actualizar en el ranking público».",
  ],
  applicationsClosed: [
    "Postulaciones cerradas. El calendario del proceso ya está calculado.",
    "Postulaciones abiertas de nuevo.",
  ],
};

/** Cambia un interruptor del portal. Quién puede cambiar cada uno lo decide la API. */
export async function cambiarInterruptor(
  ajuste: AjusteInterruptor,
  valor: boolean,
): Promise<EstadoRanking> {
  if (!AJUSTES_INTERRUPTOR.includes(ajuste)) return { error: "Ajuste desconocido" };
  try {
    await llamarApiAccion("/internal/portal", { method: "PATCH", body: { [ajuste]: valor } });
    revalidatePath("/ranking");
    revalidatePath("/configuracion");
    return { exito: EXITO_AJUSTE[ajuste][valor ? 0 : 1] };
  } catch (error) {
    return { error: mensajeDe(error, "No se pudo cambiar el ajuste") };
  }
}
