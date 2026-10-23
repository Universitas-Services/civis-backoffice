"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  FORMATO_CODIGO_ACCESO,
  normalizarCodigoAcceso,
  normalizarTelefono,
  type EstadoPostulacion,
} from "@/contracts";
import { ErrorApi } from "@/lib/api";
import { borrarCodigo, guardarCodigo, llamarPostulacion } from "@/lib/postulacion";

export interface ResultadoPostulacion {
  readonly ok: boolean;
  readonly error?: string;
  readonly campos?: Record<string, string>;
}

const mensaje = (error: unknown, porDefecto: string) =>
  error instanceof ErrorApi ? error.message : porDefecto;

/**
 * Paso 1: crea el expediente. Devuelve el número y el código de acceso, que
 * se muestran UNA vez. La cookie se fija después, cuando el postulante
 * confirma que lo guardó (`continuarConCodigo`).
 */
export async function crearPostulacion(datos: {
  readonly firstName: string;
  readonly lastName: string;
  readonly nationalIdPrefix: "V" | "E";
  readonly nationalIdDigits: string;
  readonly chamber: string;
  readonly phone: string;
  readonly website?: string;
}): Promise<ResultadoPostulacion & { fileNumber?: string; accessCode?: string }> {
  try {
    const r = await llamarPostulacion<{ fileNumber: string; accessCode: string }>("", {
      method: "POST",
      codigo: null,
      body: {
        firstName: datos.firstName,
        lastName: datos.lastName,
        nationalId: `${datos.nationalIdPrefix}-${datos.nationalIdDigits}`,
        chamber: datos.chamber,
        phone: normalizarTelefono(datos.phone),
        website: datos.website ?? "",
      },
    });
    return { ok: true, fileNumber: r.fileNumber, accessCode: r.accessCode };
  } catch (error) {
    const campos: Record<string, string> = {};
    if (error instanceof ErrorApi) {
      for (const d of error.detalles ?? []) campos[d.field] = d.message;
    }
    return { ok: false, error: mensaje(error, "No se pudo registrar el expediente"), campos };
  }
}

/** Comprueba el código con la API y sólo entonces lo guarda en la cookie. */
async function validarYGuardar(codigoCrudo: string): Promise<string | null> {
  const codigo = normalizarCodigoAcceso(codigoCrudo);
  if (!FORMATO_CODIGO_ACCESO.test(codigo)) return "El código de acceso no es válido";
  try {
    await llamarPostulacion<EstadoPostulacion>("/actual", { codigo });
  } catch (error) {
    return mensaje(error, "El código de acceso no es válido");
  }
  await guardarCodigo(codigo);
  return null;
}

/** Tras ver el comprobante: guarda el código y lleva a la carga de documentos. */
export async function continuarConCodigo(codigo: string): Promise<ResultadoPostulacion> {
  const error = await validarYGuardar(codigo);
  if (error) return { ok: false, error };
  redirect("/postulacion");
}

/** «Reanudar mi postulación»: con el código, vuelve a su expediente. */
export async function reanudarPostulacion(
  _previo: ResultadoPostulacion,
  formData: FormData,
): Promise<ResultadoPostulacion> {
  const error = await validarYGuardar(String(formData.get("codigo") ?? ""));
  if (error) return { ok: false, error };
  redirect("/postulacion");
}

const correoSchema = z.string().trim().toLowerCase().email("Correo inválido").max(254);

/** Pide el código de 6 dígitos al correo que confirmará el envío. */
export async function pedirCodigoCorreo(email: string): Promise<ResultadoPostulacion> {
  const analisis = correoSchema.safeParse(email);
  if (!analisis.success) return { ok: false, error: analisis.error.issues[0]?.message };
  try {
    await llamarPostulacion("/codigo-correo", {
      method: "POST",
      conCodigo: true,
      body: { email: analisis.data },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mensaje(error, "No se pudo enviar el código") };
  }
}

/** Verifica el código del correo y envía el expediente a revisión. */
export async function enviarPostulacion(
  email: string,
  codigoCorreo: string,
): Promise<ResultadoPostulacion> {
  const analisis = correoSchema.safeParse(email);
  if (!analisis.success) return { ok: false, error: analisis.error.issues[0]?.message };
  if (!/^\d{6}$/.test(codigoCorreo.trim())) {
    return { ok: false, error: "El código de verificación tiene 6 dígitos" };
  }
  try {
    await llamarPostulacion("/enviar", {
      method: "POST",
      conCodigo: true,
      body: { email: analisis.data, codigoCorreo: codigoCorreo.trim() },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mensaje(error, "No se pudo enviar el expediente") };
  }
}

/** Cierra la postulación en este navegador (borra la cookie del código). */
export async function salirPostulacion(): Promise<void> {
  await borrarCodigo();
  redirect("/login");
}
