import { NextResponse } from "next/server";
import { z } from "zod";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

const idSchema = z.string().uuid();

/**
 * PDF de un auto del comité. Un enlace no puede llevar `Authorization`: el
 * servidor añade el token al hablar con la API.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ objectionId: string; autoId: string }> },
): Promise<Response> {
  const { objectionId, autoId } = await params;
  if (!idSchema.safeParse(objectionId).success || !idSchema.safeParse(autoId).success) {
    return NextResponse.json({ message: "Auto inválido" }, { status: 400 });
  }
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/objections/${objectionId}/autos/${autoId}`,
  );
  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: unknown } | null;
    const message = typeof cuerpo?.message === "string" ? cuerpo.message : "Auto no disponible";
    return NextResponse.json({ message }, { status: respuesta.status });
  }

  const salida = new NextResponse(respuesta.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": respuesta.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
