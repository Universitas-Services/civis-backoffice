import { NextResponse } from "next/server";
import { z } from "zod";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

const codigoSchema = z.string().regex(/^[A-Z0-9-]{4,64}$/);
const autoSchema = z.string().uuid();

/**
 * PDF de un auto de una objeción propia del visualizador. La API comprueba que
 * la objeción sea suya y que el auto ya se le haya notificado.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string; autoId: string }> },
): Promise<Response> {
  const { codigo, autoId } = await params;
  if (!codigoSchema.safeParse(codigo).success || !autoSchema.safeParse(autoId).success) {
    return NextResponse.json({ message: "Solicitud inválida" }, { status: 400 });
  }

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/objections/mine/${encodeURIComponent(codigo)}/autos/${encodeURIComponent(autoId)}`,
  );
  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }

  const cabeceras = new Headers();
  const tipo = respuesta.headers.get("content-type");
  if (tipo) cabeceras.set("content-type", tipo);
  const disposicion = respuesta.headers.get("content-disposition");
  if (respuesta.ok && disposicion) cabeceras.set("content-disposition", disposicion);
  cabeceras.set("Cache-Control", "no-store");

  const salida = new NextResponse(respuesta.body, { status: respuesta.status, headers: cabeceras });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
