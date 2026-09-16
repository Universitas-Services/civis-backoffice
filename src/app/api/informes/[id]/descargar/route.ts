import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Descarga del informe en Markdown.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/reports/${id}/download`,
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }

  const cabeceras = new Headers();
  for (const clave of ["content-type", "content-disposition", "x-content-sha256"]) {
    const valor = respuesta.headers.get(clave);
    if (valor) cabeceras.set(clave, valor);
  }
  cabeceras.set("Cache-Control", "no-store");

  const salida = new NextResponse(respuesta.body, { status: respuesta.status, headers: cabeceras });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
