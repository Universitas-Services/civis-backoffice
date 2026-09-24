"use server";

import { revalidatePath } from "next/cache";
import { clasificarDocumentoSchema, verificarDocumentoSchema } from "@/contracts";
import { ErrorApi, NoAutorizado, llamarApiAccion } from "@/lib/api";

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
    await llamarApiAccion(`/internal/documents/${id}/verification`, {
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
    await llamarApiAccion(`/internal/documents/${id}/classification`, {
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

/** Extrae campos con IA. No persiste: el humano confirma con guardarRevision. */
export async function extraerConIa(documentId: string): Promise<{
  readonly ok: boolean;
  readonly reviewData?: Record<string, unknown>;
  readonly meta?: Record<string, unknown>;
  readonly error?: string;
}> {
  try {
    const respuesta = await llamarApiAccion<{
      reviewData?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    }>(`/internal/documents/${documentId}/extract`, {
      method: "POST",
      timeoutMs: 90_000,
    });
    return {
      ok: true,
      reviewData: respuesta.reviewData ?? {},
      meta: respuesta.meta,
    };
  } catch (error) {
    if (error instanceof NoAutorizado) {
      return {
        ok: false,
        error: "Sesión expirada durante la extracción. Vuelva a iniciar sesión e intente de nuevo.",
      };
    }
    if (error instanceof ErrorApi) {
      return { ok: false, error: error.message };
    }
    return {
      ok: false,
      error: "No se pudo extraer con IA. Complete el formulario a mano.",
    };
  }
}

/** Persiste los campos del formulario de revisión. */
export async function guardarRevision(
  documentId: string,
  reviewData: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await llamarApiAccion(`/internal/documents/${documentId}/review`, {
      method: "PATCH",
      body: { reviewData },
    });
    revalidatePath("/revision-documental");
    revalidatePath(`/revision-documental`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo guardar la revisión",
    };
  }
}

/** Marca verificado sin FormData (UI maqueta). */
export async function marcarDocumentoVerificado(
  documentId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await llamarApiAccion(`/internal/documents/${documentId}/verification`, {
      method: "PATCH",
      body: {
        status: "VERIFIED",
        reason: "Documento revisado y campos confirmados por el revisor.",
      },
    });
    revalidatePath("/revision-documental");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo verificar",
    };
  }
}

/** Transición DOCUMENT_REVIEW → READY_FOR_EVALUATION. */
export async function enviarAEvaluacion(
  candidateId: string,
): Promise<{ ok: boolean; error?: string; codigo?: number }> {
  try {
    await llamarApiAccion(`/internal/candidates/${candidateId}/transition`, {
      method: "POST",
      body: {
        target: "READY_FOR_EVALUATION",
        reason: "Revisión documental concluida",
      },
    });
    revalidatePath("/revision-documental");
    revalidatePath("/evaluacion");
    return { ok: true };
  } catch (error) {
    if (error instanceof ErrorApi) {
      return { ok: false, error: error.message, codigo: error.status };
    }
    return { ok: false, error: "No se pudo enviar a evaluación" };
  }
}

/** DOCUMENT_REVIEW → DRAFT, con el motivo que verá secretaría. */
export async function devolverASecretaria(
  candidateId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const motivo = reason.trim();
  if (motivo.length < 10) {
    return { ok: false, error: "Indique el motivo (mínimo 10 caracteres)" };
  }
  if (motivo.length > 1000) {
    return { ok: false, error: "El motivo no puede superar 1000 caracteres" };
  }
  try {
    await llamarApiAccion(`/internal/candidates/${candidateId}/transition`, {
      method: "POST",
      body: { target: "DRAFT", reason: motivo },
    });
    revalidatePath("/revision-documental");
    revalidatePath("/expedientes");
    revalidatePath(`/expedientes/${candidateId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo devolver a secretaría",
    };
  }
}
