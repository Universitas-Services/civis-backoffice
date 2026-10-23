import { NextResponse } from "next/server";
import { DOCUMENT_CATEGORY } from "@/contracts";
import { API_INTERNA } from "@/lib/config";
import { leerCodigo } from "@/lib/postulacion";

/**
 * Subida de documentos de la autopostulación. El postulante no tiene sesión:
 * su credencial es el código de acceso guardado (cifrado) en su cookie, que
 * aquí se pasa a la API en la cabecera, nunca en la URL.
 *
 * Igual que el proxy del panel, reconstruye el FormData con `category` (y
 * `replaces`) ANTES de `file`: Fastify sólo garantiza los campos previos.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const codigo = await leerCodigo();
  if (!codigo) {
    return NextResponse.json(
      { message: "Su acceso caducó. Vuelva a entrar con su código." },
      { status: 401 },
    );
  }

  const entrante = await request.formData();
  const category = entrante.get("category");
  const replaces = entrante.get("replaces");
  const file = entrante.get("file");

  if (
    typeof category !== "string" ||
    !(DOCUMENT_CATEGORY as readonly string[]).includes(category)
  ) {
    return NextResponse.json({ message: "Tipo de documento no reconocido." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No se recibió ningún archivo" }, { status: 400 });
  }

  const saliente = new FormData();
  saliente.append("category", category);
  if (typeof replaces === "string" && replaces.length > 0) saliente.append("replaces", replaces);
  saliente.append("file", file, file.name.trim().length > 0 ? file.name : "documento.pdf");

  try {
    const respuesta = await fetch(`${API_INTERNA}/public/postulaciones/documentos`, {
      method: "POST",
      headers: { "X-Codigo-Postulacion": codigo },
      body: saliente,
      // Subida + antimalware puede tardar.
      signal: AbortSignal.timeout(120_000),
      cache: "no-store",
    });
    const datos: unknown = await respuesta.json().catch(() => null);
    return NextResponse.json(datos ?? { message: "Respuesta vacía" }, {
      status: respuesta.status,
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servidor. Intente de nuevo." },
      { status: 502 },
    );
  }
}
