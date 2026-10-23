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
