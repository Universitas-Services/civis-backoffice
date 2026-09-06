import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESION } from "@/lib/config";

/**
 * Guardián de rutas del panel.
 *
 * Sólo comprueba que EXISTA la cookie de sesión; no la descifra. El proxy
 * corre en el edge runtime, donde no hay `node:crypto`, y llevar el secreto
 * de sesión a ese entorno sería peor que el problema que resuelve.
 *
 * La renovación del token NO vive aquí: Next descarta las cabeceras que se
 * añaden a `NextResponse.next()` y la escritura de cookies desde el proxy
 * resultó poco fiable. Se hace en /api/sesion/renovar, un Route Handler, que
 * es el mecanismo que Next documenta para escribir cookies.
 *
 * La validación real —¿la sesión sirve?, ¿el rol alcanza?— la hace la API en
 * cada llamada, y cada página la comprueba con `exigirRol`.
 */
const RUTAS_PUBLICAS = ["/login", "/api/sesion"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Misma razón que en /api/sesion/renovar: el servidor escucha en 0.0.0.0 y
  // `request.url` no es el origen que ve el navegador. Redirigir a otro
  // origen pierde la cookie de sesión por el camino.
  const base = process.env.BACKOFFICE_PUBLIC_URL ?? request.nextUrl.origin;

  if (RUTAS_PUBLICAS.some((r) => pathname.startsWith(r))) {
    if (pathname.startsWith("/login") && request.cookies.has(COOKIE_SESION)) {
      return NextResponse.redirect(new URL("/dashboard", base));
    }
    return NextResponse.next();
  }

  if (!request.cookies.has(COOKIE_SESION)) {
    const destino = new URL("/login", base);
    destino.searchParams.set("volver", pathname);
    return NextResponse.redirect(destino);
  }

  // Se propaga la ruta para que el layout sepa qué elemento del menú marcar.
  const cabeceras = new Headers(request.headers);
  cabeceras.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: cabeceras } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
