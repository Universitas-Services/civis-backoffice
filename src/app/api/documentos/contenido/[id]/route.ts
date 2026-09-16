import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Entrega el documento al visor del panel.
 *
 * Existe porque un `<iframe>` no puede llevar cabecera `Authorization`: el
 * navegador pide esta ruta del propio panel —que sí lleva la cookie de
 * sesión—, y es el servidor quien añade el token al hablar con la API.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/documents/${id}/content`,
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada o API inaccesible" }, { status: 401 });
  }
  if (!respuesta.ok) {
    return new Response("Documento no disponible", { status: respuesta.status });
  }

  const salida = new NextResponse(respuesta.body, {
    status: 200,
    headers: {
      "Content-Type": respuesta.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": respuesta.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "no-store",
    },
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
