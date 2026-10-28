import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";
import { esMismoOrigen } from "@/lib/mismo-origen";

/**
 * Libera el bloqueo de la objeción al salir de la pantalla o cerrar la
 * pestaña. Es POST porque `navigator.sendBeacon` sólo envía POST.
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
    `/internal/comite/objeciones/${encodeURIComponent(id)}/liberar`,
    { method: "POST" },
  );
  const salida = NextResponse.json({}, { status: respuesta?.status ?? 401 });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
