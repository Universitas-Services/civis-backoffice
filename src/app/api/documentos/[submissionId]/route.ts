import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Proxy de subida de documentos.
 *
 * El navegador no puede llamar a la API directamente porque el token de
 * acceso vive cifrado en una cookie del servidor y nunca se le entrega.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
): Promise<NextResponse> {
  const { submissionId } = await params;
  const formData = await request.formData();

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/submissions/${submissionId}/documents`,
    { method: "POST", body: formData },
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada o API inaccesible" }, { status: 401 });
  }

  const datos: unknown = await respuesta.json().catch(() => null);
  const salida = NextResponse.json(datos ?? { message: "Respuesta vacía" }, {
    status: respuesta.status,
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
