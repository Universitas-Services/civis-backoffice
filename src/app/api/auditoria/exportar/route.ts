import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/**
 * Descarga del CSV de la bitácora.
 *
 * Se hace por proxy porque el navegador no tiene el token. Se reenvían las
 * cabeceras de la API tal cual —incluidas `Content-Disposition` y el número
 * de filas— para que el archivo llegue con su nombre y sin recodificarse.
 */
export async function GET(request: Request): Promise<Response> {
  const sesion = await leerSesion();
  if (!sesion) return new Response("Sesión expirada", { status: 401 });

  const entrante = new URL(request.url);
  const destino = new URL(`${API_INTERNA}/internal/audit/export`);
  for (const [clave, valor] of entrante.searchParams) destino.searchParams.set(clave, valor);

  const respuesta = await fetch(destino, {
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta) return new Response("No se pudo contactar con el servidor", { status: 502 });

  const cabeceras = new Headers();
  for (const clave of ["content-type", "content-disposition", "x-total-rows", "x-truncated"]) {
    const valor = respuesta.headers.get(clave);
    if (valor) cabeceras.set(clave, valor);
  }
  cabeceras.set("Cache-Control", "no-store");

  return new Response(respuesta.body, { status: respuesta.status, headers: cabeceras });
}
