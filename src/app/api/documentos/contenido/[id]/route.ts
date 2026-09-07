import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/**
 * Entrega el documento al visor del panel.
 *
 * Existe porque un `<iframe>` no puede llevar cabecera `Authorization`: el
 * navegador pide esta ruta del propio panel —que sí lleva la cookie de
 * sesión—, y es el servidor quien añade el token al hablar con la API. Así el
 * documento se muestra en pantalla sin que el token viaje en una URL ni la
 * clave de almacenamiento llegue al cliente.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const sesion = await leerSesion();
  if (!sesion) return new Response("Sesión expirada", { status: 401 });

  const { id } = await params;
  const respuesta = await fetch(`${API_INTERNA}/internal/documents/${id}/content`, {
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta) return new Response("No se pudo contactar con el servidor", { status: 502 });
  if (!respuesta.ok) return new Response("Documento no disponible", { status: respuesta.status });

  return new Response(respuesta.body, {
    status: 200,
    headers: {
      "Content-Type": respuesta.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": respuesta.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "no-store",
    },
  });
}
