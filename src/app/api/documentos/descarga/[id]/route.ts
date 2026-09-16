import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Devuelve la URL firmada de un documento para el visor.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/documents/${id}/download`,
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }
  const datos: unknown = await respuesta.json().catch(() => null);
  const salida = NextResponse.json(datos ?? {}, { status: respuesta.status });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
