import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";
import { esMismoOrigen } from "@/lib/mismo-origen";

/**
 * Renueva el bloqueo de la objeción mientras un miembro del comité la trabaja.
 * Devuelve el 409 de la API tal cual si otra persona la tomó.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!esMismoOrigen(request)) {
    return NextResponse.json({ message: "Origen no permitido" }, { status: 403 });
  }
  const { id } = await params;
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/comite/objeciones/${encodeURIComponent(id)}/bloqueo`,
    { method: "POST" },
  );
  if (!respuesta) {
    return NextResponse.json({ message: "Sesión no válida" }, { status: 401 });
  }
  const datos = (await respuesta.json().catch(() => ({}))) as Record<string, unknown>;
  const salida = NextResponse.json(datos, { status: respuesta.status });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
