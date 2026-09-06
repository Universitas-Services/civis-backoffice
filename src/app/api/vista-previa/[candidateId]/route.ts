import { NextResponse } from "next/server";
import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/**
 * Vista previa exacta de la ficha pública de un postulante.
 *
 * Devuelve lo mismo que verá la ciudadanía si se publica ahora. Se consulta
 * antes de aprobar: aprobar sin mirar lo que sale es justo lo que la cola de
 * publicación existe para evitar.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> },
): Promise<NextResponse> {
  const sesion = await leerSesion();
  if (!sesion) return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });

  const { candidateId } = await params;
  const respuesta = await fetch(
    `${API_INTERNA}/internal/publications/preview/candidate/${candidateId}`,
    { headers: { Authorization: `Bearer ${sesion.accessToken}` }, cache: "no-store" },
  ).catch(() => null);

  if (!respuesta) {
    return NextResponse.json({ message: "No se pudo contactar con el servidor" }, { status: 502 });
  }
  const datos: unknown = await respuesta.json().catch(() => null);
  return NextResponse.json(datos ?? {}, { status: respuesta.status });
}
