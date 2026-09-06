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
