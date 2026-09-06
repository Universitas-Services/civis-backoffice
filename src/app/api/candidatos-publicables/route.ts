import { NextResponse } from "next/server";
import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/**
 * Postulantes que ya tienen una evaluación aprobada.
 *
 * Se filtra aquí y no en la API porque es una necesidad de esta pantalla —
 * qué fichas tiene sentido ofrecer para publicar—, no una regla del dominio.
 */
export async function GET(): Promise<NextResponse> {
  const sesion = await leerSesion();
  if (!sesion) return NextResponse.json({ items: [] }, { status: 401 });

  const respuesta = await fetch(`${API_INTERNA}/internal/candidates?pageSize=100`, {
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta?.ok) return NextResponse.json({ items: [] });

  const datos = (await respuesta.json().catch(() => null)) as {
    items?: { evaluations?: unknown[] }[];
  } | null;

  const items = (datos?.items ?? []).filter((c) => (c.evaluations?.length ?? 0) > 0);
  return NextResponse.json({ items });
}
