import { NextResponse } from "next/server";
import { z } from "zod";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

const codigoSchema = z.string().regex(/^[A-Z0-9-]{4,64}$/);

/**
 * PDF de la denuncia de una objeción propia del visualizador: el mismo que se
 * adjuntó al acuse. La API comprueba que la objeción sea suya.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string }> },
): Promise<Response> {
  const { codigo } = await params;
  if (!codigoSchema.safeParse(codigo).success) {
    return NextResponse.json({ message: "Código inválido" }, { status: 400 });
  }

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/objections/mine/${encodeURIComponent(codigo)}/pdf`,
  );
  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }

  const cabeceras = new Headers();
  const tipo = respuesta.headers.get("content-type");
  if (tipo) cabeceras.set("content-type", tipo);
  if (respuesta.ok) {
    cabeceras.set("content-disposition", `attachment; filename="denuncia-${codigo}.pdf"`);
  }
  cabeceras.set("Cache-Control", "no-store");

  const salida = new NextResponse(respuesta.body, { status: respuesta.status, headers: cabeceras });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
