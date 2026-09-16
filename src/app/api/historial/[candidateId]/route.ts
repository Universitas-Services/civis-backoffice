import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/** Historial de evaluaciones y ajustes de un postulante. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> },
): Promise<NextResponse> {
  const { candidateId } = await params;
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/evaluations/history/${candidateId}`,
  );

  if (!respuesta?.ok) {
    return NextResponse.json([], { status: respuesta?.status ?? 401 });
  }
  const salida = NextResponse.json(await respuesta.json());
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
