import { NextResponse } from "next/server";
import { z } from "zod";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * PDF de la ficha de descalificación. El navegador no llama a la API:
 * esta ruta pide el archivo con la sesión y lo devuelve como adjunto.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> },
): Promise<Response> {
  const { candidateId } = await params;
  if (!z.string().uuid().safeParse(candidateId).success) {
    return NextResponse.json({ message: "Expediente inválido" }, { status: 400 });
  }

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/evaluations/candidate/${candidateId}/disqualification-draft/pdf`,
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }

  const cabeceras = new Headers();
  const tipo = respuesta.headers.get("content-type");
  if (tipo) cabeceras.set("content-type", tipo);
  if (respuesta.ok) {
    cabeceras.set("content-disposition", 'attachment; filename="ficha-descalificacion.pdf"');
  }
  cabeceras.set("Cache-Control", "no-store");

  const salida = new NextResponse(respuesta.body, { status: respuesta.status, headers: cabeceras });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
