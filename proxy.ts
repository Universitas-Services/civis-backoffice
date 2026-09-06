import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESION } from "@/lib/config";

/**
 * Guardián de rutas del panel.
 *
 * Sólo comprueba que EXISTA una cookie de sesión, no la descifra: el proxy de
 * Next corre en el edge runtime y descifrar aquí obligaría a llevar el
 * secreto a ese entorno. La validación real —¿la sesión sirve?, ¿el rol
 * alcanza?— la hace la API en cada llamada, que es donde debe hacerse.
 *
 * Esto evita el parpadeo de cargar una pantalla para redirigir después.
 */
const RUTAS_PUBLICAS = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RUTAS_PUBLICAS.some((r) => pathname.startsWith(r))) {
    // Con sesión activa, el login redirige al panel.
    if (request.cookies.has(COOKIE_SESION)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!request.cookies.has(COOKIE_SESION)) {
    const destino = new URL("/login", request.url);
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
