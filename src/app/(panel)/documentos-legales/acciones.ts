"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { borradorLegalSchema, type DocumentoLegal, type TipoDocumentoLegal } from "@/contracts";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface EstadoLegal {
  readonly error?: string;
  readonly exito?: string;
  readonly campos?: Record<string, string>;
}

/**
 * Abre el borrador de la siguiente versión (copia del texto vigente) y lleva
 * al editor. Si ya había uno, lleva a ese.
 */
export async function crearBorradorLegal(kind: TipoDocumentoLegal): Promise<EstadoLegal> {
  let id: string;
  try {
    const borrador = await llamarApiAccion<DocumentoLegal>(
      `/internal/legal/tipo/${kind}/borrador`,
      {
        method: "POST",
      },
    );
    id = borrador.id;
  } catch (error) {
    const existente =
      error instanceof ErrorApi && error.status === 409 ? error.datos?.borradorId : null;
    if (typeof existente !== "string") {
      return { error: error instanceof ErrorApi ? error.message : "No se pudo crear el borrador" };
    }
    id = existente;
  }
  redirect(`/documentos-legales/${id}`, RedirectType.push);
}

function leerBorrador(formData: FormData) {
  return borradorLegalSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    changeSummary: formData.get("changeSummary") ?? "",
  });
}

function camposDe(issues: readonly { path: readonly PropertyKey[]; message: string }[]) {
  const campos: Record<string, string> = {};
  for (const i of issues) campos[String(i.path[0] ?? "")] ??= i.message;
  return campos;
}

/** Guarda el borrador sin publicarlo. */
export async function guardarBorradorLegal(
  id: string,
  _previo: EstadoLegal,
  formData: FormData,
): Promise<EstadoLegal> {
  const analisis = leerBorrador(formData);
  if (!analisis.success) {
    return { error: "Revise los campos marcados", campos: camposDe(analisis.error.issues) };
  }
  try {
    await llamarApiAccion(`/internal/legal/${id}`, { method: "PATCH", body: analisis.data });
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo guardar" };
  }
  revalidatePath("/documentos-legales");
  return { exito: "Borrador guardado. Todavía no es visible para los postulantes." };
}

/** Guarda lo último que se escribió y publica: pasa a ser la versión vigente. */
export async function publicarDocumentoLegal(
  id: string,
  _previo: EstadoLegal,
  formData: FormData,
): Promise<EstadoLegal> {
  const analisis = leerBorrador(formData);
  if (!analisis.success) {
    return { error: "Revise los campos marcados", campos: camposDe(analisis.error.issues) };
  }
  try {
    await llamarApiAccion(`/internal/legal/${id}`, { method: "PATCH", body: analisis.data });
    await llamarApiAccion(`/internal/legal/${id}/publicar`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo publicar" };
  }
  revalidatePath("/documentos-legales");
  redirect(`/documentos-legales/${id}?publicado=1`, RedirectType.replace);
}

/** Descarta el borrador y vuelve al listado. */
export async function descartarBorradorLegal(id: string): Promise<EstadoLegal> {
  try {
    await llamarApiAccion(`/internal/legal/${id}`, { method: "DELETE" });
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo descartar" };
  }
  revalidatePath("/documentos-legales");
  redirect("/documentos-legales", RedirectType.replace);
}
