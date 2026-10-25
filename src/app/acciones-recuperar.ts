"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { API_INTERNA } from "@/lib/config";
import { correoPendiente, olvidarCorreo, recordarCorreo } from "@/lib/correo-pendiente";

export interface EstadoRecuperar {
  readonly error?: string;
  readonly exito?: string;
  readonly campos?: Record<string, string>;
}

const correoSchema = z.string().trim().toLowerCase().email("Correo inválido").max(254);

/** Espejo de civis-api `restablecerContrasenaSchema` (sin el correo, que va en la cookie). */
const restablecerSchema = z
  .object({
    codigo: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "El código tiene 6 dígitos"),
    password: z
      .string()
      .min(12, "Mínimo 12 caracteres")
      .max(128, "Máximo 128 caracteres")
      .regex(/[a-z]/, "Debe incluir una minúscula")
      .regex(/[A-Z]/, "Debe incluir una mayúscula")
      .regex(/\d/, "Debe incluir un dígito"),
    confirmPassword: z.string().min(1, "Confirme la contraseña"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const SIN_RED = "No se pudo contactar con el servidor. Intente de nuevo en unos minutos.";

async function llamarPublica(ruta: string, body: unknown): Promise<Response | null> {
  return fetch(`${API_INTERNA}${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);
}

async function mensajeDe(respuesta: Response, porDefecto: string): Promise<string> {
  const datos = (await respuesta.json().catch(() => null)) as { message?: unknown } | null;
  return typeof datos?.message === "string" && datos.message.trim() ? datos.message : porDefecto;
}

/** Paso 1: pide el código. La API responde igual exista o no la cuenta. */
export async function pedirCodigoRecuperacion(
  _previo: EstadoRecuperar,
  formData: FormData,
): Promise<EstadoRecuperar> {
  const correo = correoSchema.safeParse(formData.get("email"));
  if (!correo.success) {
    return { campos: { email: correo.error.issues[0]?.message ?? "Correo inválido" } };
  }
  const respuesta = await llamarPublica("/public/cuentas/recuperar", { email: correo.data });
  if (!respuesta) return { error: SIN_RED };
  if (respuesta.status === 429) {
    return { error: "Ya pidió varios códigos. Espere unos minutos antes de volver a probar." };
  }
  if (!respuesta.ok) return { error: await mensajeDe(respuesta, "No se pudo enviar el código.") };
  await recordarCorreo(correo.data);
  redirect("/recuperar/codigo");
}

/** Paso 2: código + contraseña nueva. Cierra todas las sesiones de la cuenta. */
export async function restablecerContrasena(
  _previo: EstadoRecuperar,
  formData: FormData,
): Promise<EstadoRecuperar> {
  const email = await correoPendiente();
  if (!email) return { error: "Vuelva a pedir el código: no sabemos qué cuenta restablecer." };

  const analisis = restablecerSchema.safeParse({
    codigo: formData.get("codigo"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!analisis.success) {
    const campos: Record<string, string> = {};
    for (const issue of analisis.error.issues) {
      const clave = issue.path.map(String).join(".");
      campos[clave] ??= issue.message;
    }
    return { campos };
  }

  const respuesta = await llamarPublica("/public/cuentas/restablecer", {
    email,
    ...analisis.data,
  });
  if (!respuesta) return { error: SIN_RED };
  if (!respuesta.ok) {
    return { campos: { codigo: await mensajeDe(respuesta, "El código no es válido.") } };
  }
  await olvidarCorreo();
  redirect("/login?restablecida=1");
}

export async function reenviarCodigoRecuperacion(): Promise<EstadoRecuperar> {
  const email = await correoPendiente();
  if (!email) return { error: "Vuelva a escribir su correo para recibir un código." };
  const respuesta = await llamarPublica("/public/cuentas/recuperar", { email });
  if (!respuesta) return { error: SIN_RED };
  if (respuesta.status === 429) return { error: "Ya pidió varios códigos. Espere unos minutos." };
  if (!respuesta.ok) return { error: await mensajeDe(respuesta, "No se pudo reenviar el código.") };
  return { exito: "Le enviamos un código nuevo. Revise también el correo no deseado." };
}
