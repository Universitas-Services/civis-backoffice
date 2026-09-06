import { NextResponse } from "next/server";
import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/**
 * Proxy de subida de documentos.
 *
 * El navegador no puede llamar a la API directamente porque el token de
 * acceso vive cifrado en una cookie del servidor y nunca se le entrega. Este
 * manejador recibe el archivo, le añade la autorización y lo reenvía.
 *
 * No valida el contenido: eso lo hace la API, que comprueba el tipo real por
 * los bytes, calcula el hash y lo pasa por el antimalware. Duplicar aquí esa
 * validación crearía dos reglas que se pueden desincronizar.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
): Promise<NextResponse> {
  const sesion = await leerSesion();
  if (!sesion) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }

  const { submissionId } = await params;
  const formData = await request.formData();

  const respuesta = await fetch(`${API_INTERNA}/internal/submissions/${submissionId}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    body: formData,
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta) {
    return NextResponse.json({ message: "No se pudo contactar con el servidor" }, { status: 502 });
  }

  const datos: unknown = await respuesta.json().catch(() => null);
  return NextResponse.json(datos ?? { message: "Respuesta vacía" }, { status: respuesta.status });
}
