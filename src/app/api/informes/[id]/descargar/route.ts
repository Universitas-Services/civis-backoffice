import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/**
 * Descarga del informe en Markdown.
 *
 * Se reenvían las cabeceras de la API tal cual, incluida X-Content-SHA256:
 * quien reciba el archivo puede comprobar que su huella coincide con la que
 * se publicó, y por tanto que nadie lo alteró por el camino.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const sesion = await leerSesion();
  if (!sesion) return new Response("Sesión expirada", { status: 401 });

  const { id } = await params;
  const respuesta = await fetch(`${API_INTERNA}/internal/reports/${id}/download`, {
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta) return new Response("No se pudo contactar con el servidor", { status: 502 });

  const cabeceras = new Headers();
  for (const clave of ["content-type", "content-disposition", "x-content-sha256"]) {
    const valor = respuesta.headers.get(clave);
    if (valor) cabeceras.set(clave, valor);
  }
  cabeceras.set("Cache-Control", "no-store");

  return new Response(respuesta.body, { status: respuesta.status, headers: cabeceras });
}
