import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Postulantes que ya tienen una evaluación aprobada.
 */
export async function GET(): Promise<NextResponse> {
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/candidates?pageSize=100`,
  );

  if (!respuesta?.ok) return NextResponse.json({ items: [] });

  const datos = (await respuesta.json().catch(() => null)) as {
    items?: { evaluations?: unknown[] }[];
  } | null;

  const items = (datos?.items ?? []).filter((c) => (c.evaluations?.length ?? 0) > 0);
  const salida = NextResponse.json({ items });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
