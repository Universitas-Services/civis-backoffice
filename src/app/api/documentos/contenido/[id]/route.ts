import { NextResponse } from "next/server";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Entrega el documento al visor del panel.
 *
 * Existe porque un `<iframe>` no puede llevar cabecera `Authorization`: el
 * navegador pide esta ruta del propio panel —que sí lleva la cookie de
 * sesión—, y es el servidor quien añade el token al hablar con la API.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/documents/${id}/content`,
    { signal: AbortSignal.timeout(120_000) },
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada o API inaccesible" }, { status: 401 });
  }
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: unknown } | null;
    const message =
      typeof cuerpo?.message === "string" && cuerpo.message.trim()
        ? cuerpo.message
        : "Documento no disponible";
    return NextResponse.json({ message }, { status: respuesta.status });
  }

  const contentType =
    respuesta.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  const visible =
    contentType === "application/pdf" || contentType.startsWith("image/")
      ? contentType
      : "application/octet-stream";
  const salida = new NextResponse(respuesta.body, {
    status: 200,
    headers: {
      "Content-Type": visible,
      "Content-Disposition": respuesta.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
