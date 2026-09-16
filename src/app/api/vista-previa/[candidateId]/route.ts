import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Vista previa exacta de la ficha pública de un postulante.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> },
): Promise<NextResponse> {
  const { candidateId } = await params;
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/publications/preview/candidate/${candidateId}`,
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }
  const datos: unknown = await respuesta.json().catch(() => null);
  const salida = NextResponse.json(datos ?? {}, { status: respuesta.status });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
