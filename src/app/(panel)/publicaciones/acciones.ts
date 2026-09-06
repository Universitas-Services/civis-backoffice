"use server";

import { revalidatePath } from "next/cache";
import { aprobarPublicacionSchema } from "@/contracts";
import { ErrorApi, llamarApi } from "@/lib/api";

export interface EstadoPublicacion {
  readonly error?: string;
  readonly exito?: string;
}

/**
 * Aprueba y publica un snapshot.
 *
 * El motivo es obligatorio y la API rechaza que lo apruebe la misma persona
 * que lo preparó. Aquí no se replica esa comprobación: se deja que la API la
 * haga y se muestra su mensaje, para que exista una sola regla.
 */
export async function publicarSnapshot(
  _previo: EstadoPublicacion,
  formData: FormData,
): Promise<EstadoPublicacion> {
  const id = String(formData.get("snapshotId") ?? "");
  const analisis = aprobarPublicacionSchema.safeParse({ reason: formData.get("reason") });

  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Motivo inválido" };
  }

  try {
    await llamarApi(`/internal/publications/${id}/publish`, {
      method: "POST",
      body: analisis.data,
    });
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo publicar" };
  }

  revalidatePath("/publicaciones");
  return { exito: "Snapshot publicado. Ya es visible en el sitio público." };
}

/** Prepara el snapshot del ranking público a partir del estado actual. */
export async function prepararRanking(): Promise<EstadoPublicacion> {
  try {
    await llamarApi("/internal/publications/ranking/prepare", { method: "POST" });
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo preparar" };
  }
  revalidatePath("/publicaciones");
  return { exito: "Ranking preparado. Requiere aprobación de otra persona." };
}

/**
 * Prepara el snapshot de la ficha de un postulante.
 *
 * Antes sólo se podía preparar el ranking, así que un perfil evaluado no
 * tenía forma de llegar al público desde la interfaz.
 */
export async function prepararFicha(
  candidateId: string,
): Promise<EstadoPublicacion & { ok?: boolean }> {
  try {
    await llamarApi(`/internal/publications/candidate/${candidateId}/prepare`, { method: "POST" });
    revalidatePath("/publicaciones");
    return { exito: "Ficha preparada. Requiere aprobación de otra persona." };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo preparar" };
  }
}

/**
 * Retira contenido ya publicado.
 *
 * Exige motivo: retirar algo del sitio público es una decisión con
 * consecuencias, y quien la tome debe dejar dicho por qué.
 */
export async function retirarPublicacion(
  id: string,
  _previo: EstadoPublicacion,
  formData: FormData,
): Promise<EstadoPublicacion> {
  const motivo = String(formData.get("reason") ?? "").trim();
  if (motivo.length < 10) {
    return { error: "El retiro debe estar motivado (mínimo 10 caracteres)" };
  }
  try {
    await llamarApi(`/internal/publications/${id}/withdraw`, {
      method: "POST",
      body: { reason: motivo },
    });
    revalidatePath("/publicaciones");
    return { exito: "Contenido retirado del sitio público." };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo retirar" };
  }
}
