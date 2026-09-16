import { NextResponse } from "next/server";
import { COOKIE_SESION, origenPanel } from "@/lib/config";
import { renovarSesionTras401 } from "@/lib/auth-refresh";
import { cerrarSesion, cifrarSesion, leerSesion, OPCIONES_COOKIE } from "@/lib/sesion";

/**
 * Renovación del token de acceso.
 *
 * Vive en un Route Handler porque es el único sitio, junto a las Server
 * Actions, donde Next permite escribir cookies. Y escribirla es obligatorio:
 * el refresh de la API es ROTATIVO —cada uso anula el anterior—, así que
 * renovar sin poder guardar el token nuevo dejaría la sesión rota en el
 * siguiente intento, y la API lo leería como robo de credencial.
 *
 * Se llama con `?volver=<ruta>` y devuelve a esa ruta al terminar, de modo
 * que el operador ve un parpadeo y sigue trabajando donde estaba.
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
  const url = new URL(request.url);
  const base = basePublica(request);
  const crudo = url.searchParams.get("volver") ?? "/dashboard";
  const volver = crudo.startsWith("/") && !crudo.startsWith("//") ? crudo : "/dashboard";

  const sesion = await leerSesion();
  if (!sesion?.refreshCookie) {
    await cerrarSesion();
    return NextResponse.redirect(new URL("/login", base));
  }

  const tokens = await renovarSesionTras401(sesion.accessToken, sesion.refreshCookie);
  if (!tokens) {
    await cerrarSesion();
    return NextResponse.redirect(new URL("/login?sesion=expirada", base));
  }

  const cookie = await cifrarSesion({
    usuario: sesion.usuario,
    accessToken: tokens.accessToken,
    refreshCookie: tokens.refreshCookie,
  });

  const salida = NextResponse.redirect(new URL(volver, base));
  salida.cookies.set(COOKIE_SESION, cookie, OPCIONES_COOKIE);
  return salida;
}
