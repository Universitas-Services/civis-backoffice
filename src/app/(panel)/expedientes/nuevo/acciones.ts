"use server";

import { crearExpedienteSchema, PREFIJOS_TELEFONO } from "@/contracts";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export type ValoresWizard = {
  readonly nationalIdDigits: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly chamber: string;
  readonly publicSummary: string;
  readonly email: string;
  readonly phonePrefix: string;
  readonly phoneDigits: string;
  readonly internalNotes: string;
};

export interface EstadoWizard {
  readonly error?: string;
  readonly campos?: Record<string, string>;
  /** Valores enviados: se rehidratan en el formulario si la validación falla. */
  readonly valores?: ValoresWizard;
  readonly creado?: {
    readonly candidateId: string;
    readonly submissionId: string;
    readonly fileNumber: string;
  };
}

function leerValores(formData: FormData): ValoresWizard {
  return {
    nationalIdDigits: String(formData.get("nationalIdDigits") ?? "").replace(/\D/g, "").slice(0, 8),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    chamber: String(formData.get("chamber") ?? ""),
    publicSummary: String(formData.get("publicSummary") ?? ""),
    email: String(formData.get("email") ?? ""),
    phonePrefix: String(formData.get("phonePrefix") ?? "") || "0412",
    phoneDigits: String(formData.get("phoneDigits") ?? "").replace(/\D/g, "").slice(0, 7),
    internalNotes: String(formData.get("internalNotes") ?? ""),
  };
}

type TelefonoArmado =
  | { readonly ok: true; readonly valor?: string }
  | { readonly ok: false; readonly mensaje: string };

function armarTelefono(prefix: string, digits: string): TelefonoArmado {
  const p = prefix.trim();
  const d = digits.trim();
  // Sin dígitos = teléfono omitido (el prefijo puede venir por defecto en la UI).
  if (!d) return { ok: true, valor: undefined };
  if (!p) return { ok: false, mensaje: "Seleccione el prefijo (0412, 0414…)" };
  if (!(PREFIJOS_TELEFONO as readonly string[]).includes(p)) {
    return { ok: false, mensaje: "Prefijo telefónico no válido" };
  }
  if (!/^\d{7}$/.test(d)) {
    return { ok: false, mensaje: "El número debe tener exactamente 7 dígitos" };
  }
  return { ok: true, valor: `${p} ${d}` };
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
  const valores = leerValores(formData);
  const telefono = armarTelefono(valores.phonePrefix, valores.phoneDigits);

  const camposPrevios: Record<string, string> = {};
  if (!/^\d{6,8}$/.test(valores.nationalIdDigits)) {
    camposPrevios.nationalIdDigits =
      valores.nationalIdDigits.length === 0
        ? "Indique la cédula"
        : "La cédula debe tener entre 6 y 8 dígitos";
  }
  if (!telefono.ok) {
    camposPrevios.phone = telefono.mensaje;
  }

  const bruto = {
    nationalId: `V-${valores.nationalIdDigits}`,
    firstName: valores.firstName,
    lastName: valores.lastName,
    chamber: valores.chamber || undefined,
    publicSummary: valores.publicSummary || undefined,
    email: valores.email || undefined,
    phone: telefono.ok ? telefono.valor : undefined,
    internalNotes: valores.internalNotes || undefined,
  };

  const analisis = crearExpedienteSchema.safeParse(bruto);
  if (!analisis.success || Object.keys(camposPrevios).length > 0) {
    const campos: Record<string, string> = { ...camposPrevios };
    if (!analisis.success) {
      for (const issue of analisis.error.issues) {
        const clave = issue.path.join(".");
        // Mapear errores del campo compuesto a los inputs partidos.
        const claveUi =
          clave === "nationalId"
            ? "nationalIdDigits"
            : clave === "phone"
              ? "phone"
              : clave;
        if (!campos[claveUi]) campos[claveUi] = issue.message;
      }
    }
    return { campos, valores };
  }

  const datos = {
    ...analisis.data,
    email: analisis.data.email || undefined,
    phone: analisis.data.phone || undefined,
  };

  try {
    const creado = await llamarApiAccion<{
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
      return { campos: { nationalIdDigits: error.message }, valores };
    }
    return {
      error: error instanceof ErrorApi ? error.message : "No se pudo crear el expediente",
      valores,
    };
  }
}

/** Paso 3: envía el expediente a revisión documental. */
export async function enviarARevision(
  candidateId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await llamarApiAccion(`/internal/candidates/${candidateId}/transition`, {
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
