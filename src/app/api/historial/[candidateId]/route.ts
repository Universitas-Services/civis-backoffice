import { NextResponse } from "next/server";
import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/** Historial de evaluaciones y ajustes de un postulante. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> },
): Promise<NextResponse> {
  const sesion = await leerSesion();
  if (!sesion) return NextResponse.json([], { status: 401 });

  const { candidateId } = await params;
  const respuesta = await fetch(`${API_INTERNA}/internal/evaluations/history/${candidateId}`, {
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta?.ok) return NextResponse.json([], { status: respuesta?.status ?? 502 });
  return NextResponse.json(await respuesta.json());
}
