import { NextResponse } from "next/server";
import { API_INTERNA } from "@/lib/config";
import { cerrarSesion, cifrarSesion, leerSesion, OPCIONES_COOKIE } from "@/lib/sesion";
import { COOKIE_SESION } from "@/lib/config";

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
/**
 * Base pública desde la que se construyen las redirecciones.
 *
 * NO se usa `request.url`: el servidor escucha en 0.0.0.0, así que esa URL
 * apunta a un origen distinto del que tiene el navegador. Redirigir ahí hace
 * que la cookie de sesión quede huérfana —se escribe para 0.0.0.0 y el
 * navegador está en localhost— y la renovación falla en silencio. Detrás de
 * un proxy inverso pasaría lo mismo.
 */
function baseP(request: Request): string {
  const configurada = process.env.BACKOFFICE_PUBLIC_URL;
  if (configurada) return configurada.replace(/\/$/, "");
  const host = request.headers.get("host");
  if (host) {
    const esquema = request.headers.get("x-forwarded-proto") ?? "http";
    return `${esquema}://${host}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const base = baseP(request);
  const crudo = url.searchParams.get("volver") ?? "/dashboard";
  // Sólo rutas internas: un `volver` externo convertiría esto en un
  // redirector abierto que cualquiera podría usar para dar credibilidad
  // a un enlace hacia otro sitio.
  const volver = crudo.startsWith("/") && !crudo.startsWith("//") ? crudo : "/dashboard";

  const sesion = await leerSesion();
  if (!sesion?.refreshCookie) {
    await cerrarSesion();
    return NextResponse.redirect(new URL("/login", base));
  }

  const respuesta = await fetch(`${API_INTERNA}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: sesion.refreshCookie,
      // La API comprueba el origen en las rutas que usan cookie.
      Origin: base,
    },
    cache: "no-store",
  }).catch(() => null);

  const datos = respuesta?.ok
    ? ((await respuesta.json().catch(() => null)) as { accessToken?: string } | null)
    : null;

  if (!datos?.accessToken) {
    // El refresh caducó, revocaron la cuenta, o la API detectó reuso del
    // token y anuló la familia entera. En los tres casos toca volver a entrar.
    await cerrarSesion();
    return NextResponse.redirect(new URL("/login?sesion=expirada", base));
  }

  const cookie = await cifrarSesion({
    usuario: sesion.usuario,
    accessToken: datos.accessToken,
    // La API rota el refresh: guardar el anterior dejaría la sesión rota.
    refreshCookie: respuesta!.headers.get("set-cookie") ?? sesion.refreshCookie,
  });

  // La cookie se escribe sobre ESTA respuesta. Usar `cookies().set()` y
  // devolver una redirección distinta pierde la cookie en silencio: la
  // renovación parece funcionar —la API responde 200— y el operador acaba
  // en el login igual.
  const salida = NextResponse.redirect(new URL(volver, base));
  salida.cookies.set(COOKIE_SESION, cookie, OPCIONES_COOKIE);
  return salida;
}
