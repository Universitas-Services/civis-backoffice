"use server";

import { revalidatePath } from "next/cache";
import { clasificarDocumentoSchema, verificarDocumentoSchema } from "@/contracts";
import { ErrorApi, llamarApi } from "@/lib/api";

export interface EstadoRevision {
  readonly error?: string;
  readonly exito?: string;
}

/** Marca el documento como verificado o rechazado tras leerlo. */
export async function verificarDocumento(
  id: string,
  _previo: EstadoRevision,
  formData: FormData,
): Promise<EstadoRevision> {
  const analisis = verificarDocumentoSchema.safeParse({
    status: formData.get("status"),
    reason: formData.get("reason"),
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await llamarApi(`/internal/documents/${id}/verification`, {
      method: "PATCH",
      body: analisis.data,
    });
    revalidatePath("/revision-documental");
    return {
      exito:
        analisis.data.status === "VERIFIED"
          ? "Documento verificado."
          : "Documento rechazado. Secretaría deberá reemplazarlo.",
    };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo actualizar" };
  }
}

/**
 * Cambia la clasificación de privacidad.
 *
 * Marcar PUBLIC es lo que expone el archivo a la ciudadanía, así que exige
 * motivo y sólo lo puede hacer quien publica. La API además se niega si el
 * documento no pasó limpio el análisis antimalware.
 */
export async function clasificarDocumento(
  id: string,
  _previo: EstadoRevision,
  formData: FormData,
): Promise<EstadoRevision> {
  const analisis = clasificarDocumentoSchema.safeParse({
    classification: formData.get("classification"),
    reason: formData.get("reason"),
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await llamarApi(`/internal/documents/${id}/classification`, {
      method: "PATCH",
      body: analisis.data,
    });
    revalidatePath("/revision-documental");
    const etiqueta = { PUBLIC: "público", REDACTED: "redactado", PRIVATE: "privado" }[
      analisis.data.classification
    ];
    return { exito: `Documento marcado como ${etiqueta}.` };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo reclasificar" };
  }
}
