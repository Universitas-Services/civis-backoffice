import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/** Contenido publicado ahora mismo, para poder retirarlo. */
export async function GET(): Promise<NextResponse> {
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/publications/published`,
  );

  if (!respuesta?.ok) return NextResponse.json({ items: [] });
  const items = (await respuesta.json().catch(() => [])) as unknown[];
  const salida = NextResponse.json({ items });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
