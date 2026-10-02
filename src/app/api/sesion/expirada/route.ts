import { NextResponse } from "next/server";
import { COOKIE_RECIEN_RENOVADA, COOKIE_SESION, origenPanel } from "@/lib/config";
import { OPCIONES_COOKIE } from "@/lib/sesion";

/**
 * Cierre limpio tras un 401 persistente (ya se intentó renovar).
 *
 * Debe vivir en un Route Handler: desde un Server Component no se pueden
 * borrar cookies; hacerlo en `renovarYVolver` provocaba React #441 en prod.
 */
function basePublica(request: Request): string {
  const configurada = process.env.BACKOFFICE_PUBLIC_URL?.replace(/\/$/, "");
  if (configurada) return configurada;
  const host = request.headers.get("host");
  if (host) {
    const esquema = request.headers.get("x-forwarded-proto") ?? "http";
    return `${esquema}://${host}`;
  }
  return origenPanel();
}

export async function GET(request: Request): Promise<NextResponse> {
  const base = basePublica(request);
  const salida = NextResponse.redirect(new URL("/login?sesion=expirada", base));

  // Borrar marca anti-bucle y sesión del panel.
  salida.cookies.set(COOKIE_RECIEN_RENOVADA, "", {
    httpOnly: true,
    secure: OPCIONES_COOKIE.secure,
    sameSite: OPCIONES_COOKIE.sameSite,
    path: "/",
    maxAge: 0,
  });
  salida.cookies.set(COOKIE_SESION, "", {
    httpOnly: true,
    secure: OPCIONES_COOKIE.secure,
    sameSite: OPCIONES_COOKIE.sameSite,
    path: "/",
    maxAge: 0,
  });

  return salida;
}
