import { NextResponse } from "next/server";
import { API_INTERNA } from "@/lib/config";
import { leerSesion } from "@/lib/sesion";

/** Contenido publicado ahora mismo, para poder retirarlo. */
export async function GET(): Promise<NextResponse> {
  const sesion = await leerSesion();
  if (!sesion) return NextResponse.json({ items: [] }, { status: 401 });

  const respuesta = await fetch(`${API_INTERNA}/internal/publications/published`, {
    headers: { Authorization: `Bearer ${sesion.accessToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta?.ok) return NextResponse.json({ items: [] });
  const items = (await respuesta.json().catch(() => [])) as unknown[];
  return NextResponse.json({ items });
}
