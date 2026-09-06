"use server";

import { crearExpedienteSchema } from "@/contracts";
import { ErrorApi, llamarApi } from "@/lib/api";

export interface EstadoWizard {
  readonly error?: string;
  readonly campos?: Record<string, string>;
  readonly creado?: {
    readonly candidateId: string;
    readonly submissionId: string;
    readonly fileNumber: string;
  };
}

/**
 * Paso 1 del wizard: registra al postulante y abre su expediente.
 *
 * Se hace en el servidor porque la subida de documentos del paso 2 necesita
 * el `submissionId`, y ese identificador no debe fabricarse en el cliente.
 */
export async function crearExpediente(
  _previo: EstadoWizard,
  formData: FormData,
): Promise<EstadoWizard> {
  const bruto = {
    nationalId: String(formData.get("nationalId") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    chamber: formData.get("chamber"),
    publicSummary: String(formData.get("publicSummary") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    internalNotes: String(formData.get("internalNotes") ?? "") || undefined,
  };

  const analisis = crearExpedienteSchema.safeParse(bruto);
  if (!analisis.success) {
    const campos: Record<string, string> = {};
    for (const issue of analisis.error.issues) {
      const clave = issue.path.join(".");
      if (!campos[clave]) campos[clave] = issue.message;
    }
    return { campos };
  }

  // El campo vacío llega como cadena vacía tras el `.or(z.literal(""))`.
  const datos = { ...analisis.data, email: analisis.data.email || undefined };

  try {
    const creado = await llamarApi<{
      id: string;
      submissions: { id: string; fileNumber: string }[];
    }>("/internal/candidates", { method: "POST", body: datos });

    return {
      creado: {
        candidateId: creado.id,
        submissionId: creado.submissions[0]!.id,
        fileNumber: creado.submissions[0]!.fileNumber,
      },
    };
  } catch (error) {
    if (error instanceof ErrorApi && error.status === 409) {
      return { campos: { nationalId: error.message } };
    }
    return { error: error instanceof ErrorApi ? error.message : "No se pudo crear el expediente" };
  }
}

/** Paso 3: envía el expediente a revisión documental. */
export async function enviarARevision(
  candidateId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await llamarApi(`/internal/candidates/${candidateId}/transition`, {
      method: "POST",
      body: {
        target: "DOCUMENT_REVIEW",
        reason: "Expediente digitalizado por secretaría y enviado a revisión documental.",
      },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo enviar" };
  }
}
