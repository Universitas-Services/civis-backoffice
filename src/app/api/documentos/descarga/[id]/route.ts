import { NextResponse } from "next/server";
import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/**
 * Devuelve la URL firmada de un documento para el visor.
 *
 * La URL se pide en el momento de abrir el documento y caduca en minutos: una
 * pantalla que quede abierta no conserva un enlace válido indefinidamente.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const sesion = await leerSesion();
  if (!sesion) return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });

  const { id } = await params;
  const respuesta = await fetch(`${API_INTERNA}/internal/documents/${id}/download`, {
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta) {
    return NextResponse.json({ message: "No se pudo contactar con el servidor" }, { status: 502 });
  }
  const datos: unknown = await respuesta.json().catch(() => null);
  return NextResponse.json(datos ?? {}, { status: respuesta.status });
}
