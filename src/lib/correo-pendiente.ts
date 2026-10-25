import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";

/**
 * Correo de la cuenta que espera el código para restablecer su contraseña.
 * Vive en una cookie HttpOnly de una hora entre «¿Olvidó su contraseña?» y la
 * pantalla del código: así el correo nunca viaja en la URL.
 */
const COOKIE = "cp_bo_correo_recuperacion";
const correoSchema = z.string().trim().toLowerCase().email().max(254);

export async function recordarCorreo(email: string): Promise<void> {
  (await cookies()).set(COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function correoPendiente(): Promise<string | null> {
  const analisis = correoSchema.safeParse((await cookies()).get(COOKIE)?.value);
  return analisis.success ? analisis.data : null;
}

export async function olvidarCorreo(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** ad••••@correo.com: suficiente para reconocerlo sin mostrarlo entero. */
export function enmascararCorreo(email: string): string {
  const [usuario = "", dominio = ""] = email.split("@");
  const visible = usuario.length <= 2 ? (usuario[0] ?? "") : usuario.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(1, usuario.length - visible.length))}@${dominio}`;
}
