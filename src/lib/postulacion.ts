import "server-only";
import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "node:crypto";
import { API_INTERNA } from "./config";
import { ErrorApi } from "./api";

/**
 * Autopostulación: el postulante no tiene sesión. Su credencial es el código
 * de acceso (CIVIS-XXXX-XXXX-XXXX), que se guarda CIFRADO en una cookie
 * HttpOnly propia para no tener que escribirlo en cada pantalla.
 *
 * El código nunca va en la URL: viaja a la API en la cabecera
 * `X-Codigo-Postulacion`, siempre desde el servidor de Next.
 */
export const COOKIE_POSTULACION = "cp_postulacion";
const DURACION_S = 7 * 24 * 60 * 60;

function clave(): Uint8Array {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.includes("CHANGE_ME")) {
    throw new Error("SESSION_SECRET no está configurado o sigue con el valor de ejemplo.");
  }
  // Derivada aparte de la de la sesión: una cookie no sirve por la otra.
  return new Uint8Array(createHash("sha256").update(`postulacion:${secreto}`).digest());
}

export const OPCIONES_COOKIE_POSTULACION = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: DURACION_S,
} as const;

export async function cifrarCodigo(codigo: string): Promise<string> {
  return new EncryptJWT({ codigo })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_S}s`)
    .encrypt(clave());
}

export async function guardarCodigo(codigo: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_POSTULACION, await cifrarCodigo(codigo), OPCIONES_COOKIE_POSTULACION);
}

export async function leerCodigo(): Promise<string | null> {
  const store = await cookies();
  const cruda = store.get(COOKIE_POSTULACION)?.value;
  if (!cruda) return null;
  try {
    const { payload } = await jwtDecrypt(cruda, clave());
    return typeof payload.codigo === "string" ? payload.codigo : null;
  } catch {
    return null;
  }
}

export async function borrarCodigo(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_POSTULACION);
}

/**
 * Llama a `/public/postulaciones/*` sin sesión. Con `codigo` adjunta la
 * cabecera; si no se pasa, usa el de la cookie.
 */
export async function llamarPostulacion<T>(
  ruta: string,
  opciones: { method?: string; body?: unknown; codigo?: string | null; conCodigo?: boolean } = {},
): Promise<T> {
  const codigo =
    opciones.codigo !== undefined
      ? opciones.codigo
      : opciones.conCodigo
        ? await leerCodigo()
        : null;
  const respuesta = await fetch(`${API_INTERNA}/public/postulaciones${ruta}`, {
    method: opciones.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(codigo ? { "X-Codigo-Postulacion": codigo } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const datos = (await respuesta.json().catch(() => null)) as
    (T & { message?: string; errors?: { field: string; message: string }[] }) | null;
  if (!respuesta.ok) {
    if (respuesta.status === 429) {
      throw new ErrorApi("Demasiados intentos. Espere unos minutos e intente de nuevo.", 429);
    }
    throw new ErrorApi(
      datos?.errors?.[0]?.message ?? datos?.message ?? "No se pudo completar la solicitud",
      respuesta.status,
      datos?.errors,
    );
  }
  return datos as T;
}
