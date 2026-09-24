import { NextResponse } from "next/server";
import { DOCUMENT_CATEGORY } from "@/contracts";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Proxy de subida de documentos.
 *
 * Reconstruye el FormData poniendo `category` (y `replaces`) ANTES de `file`:
 * Fastify (`request.file()`) solo garantiza campos recibidos junto/antes del
 * archivo; si `category` va después, llega `undefined` → 400 "Categoría inválida".
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
): Promise<NextResponse> {
  const { submissionId } = await params;
  const entrante = await request.formData();

  const category = entrante.get("category");
  const replaces = entrante.get("replaces");
  const file = entrante.get("file");

  if (typeof category !== "string" || !category.trim()) {
    return NextResponse.json(
      { message: "Falta el campo category del recaudo." },
      { status: 400 },
    );
  }
  if (!(DOCUMENT_CATEGORY as readonly string[]).includes(category)) {
    return NextResponse.json(
      {
        message: `Categoría inválida (${category}). Valores admitidos: ${DOCUMENT_CATEGORY.join(", ")}`,
      },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No se recibió ningún archivo" }, { status: 400 });
  }

  const saliente = new FormData();
  saliente.append("category", category);
  if (typeof replaces === "string" && replaces.length > 0) {
    saliente.append("replaces", replaces);
  }
  const nombre = file.name.trim().length > 0 ? file.name : "documento.pdf";
  saliente.append("file", file, nombre);

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/internal/submissions/${submissionId}/documents`,
    {
      method: "POST",
      body: saliente,
      // Subida + antimalware puede tardar.
      signal: AbortSignal.timeout(120_000),
    },
  );

  if (!respuesta) {
    return NextResponse.json({ message: "Sesión expirada o API inaccesible" }, { status: 401 });
  }

  const datos: unknown = await respuesta.json().catch(() => null);
  const salida = NextResponse.json(datos ?? { message: "Respuesta vacía" }, {
    status: respuesta.status,
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
