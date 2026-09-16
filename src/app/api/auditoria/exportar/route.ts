import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Descarga del CSV de la bitácora.
 */
export async function GET(request: Request): Promise<Response> {
  const entrante = new URL(request.url);
  const qs = entrante.searchParams.toString();
  const ruta = `/internal/audit/export${qs ? `?${qs}` : ""}`;

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(ruta);

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
  }

  const cabeceras = new Headers();
  for (const clave of ["content-type", "content-disposition", "x-total-rows", "x-truncated"]) {
    const valor = respuesta.headers.get(clave);
    if (valor) cabeceras.set(clave, valor);
  }
  cabeceras.set("Cache-Control", "no-store");

  const salida = new NextResponse(respuesta.body, { status: respuesta.status, headers: cabeceras });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
