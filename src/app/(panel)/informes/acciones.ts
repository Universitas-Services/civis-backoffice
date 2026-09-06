"use server";

import { revalidatePath } from "next/cache";
import { generarInformeSchema, publicarInformeSchema } from "@/contracts";
import { ErrorApi, llamarApi } from "@/lib/api";

export interface EstadoInformes {
  readonly error?: string;
  readonly exito?: string;
}

/**
 * Genera un borrador de informe.
 *
 * La fecha de corte es una ENTRADA, no el reloj: con los mismos datos y la
 * misma fecha el informe sale byte a byte idéntico, y por eso su huella
 * digital sirve para verificarlo después.
 */
export async function generarInforme(
  _previo: EstadoInformes,
  formData: FormData,
): Promise<EstadoInformes> {
  const crudo = String(formData.get("cutoffAt") ?? "").trim();
  const analisis = generarInformeSchema.safeParse({ cutoffAt: crudo || undefined });
  if (!analisis.success) return { error: "Fecha de corte inválida" };

  // El campo del formulario es datetime-local, sin zona: se envía en ISO.
  const cutoffAt = analisis.data.cutoffAt
    ? new Date(analisis.data.cutoffAt).toISOString()
    : undefined;

  try {
    const creado = await llamarApi<{ version: number; sha256: string }>("/internal/reports/draft", {
      method: "POST",
      body: cutoffAt ? { cutoffAt } : {},
    });
    revalidatePath("/informes");
    return {
      exito: `Borrador versión ${creado.version} generado. Huella ${creado.sha256.slice(0, 16)}…`,
    };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo generar" };
  }
}

export async function publicarInforme(
  id: string,
  _previo: EstadoInformes,
  formData: FormData,
): Promise<EstadoInformes> {
  const analisis = publicarInformeSchema.safeParse({ reason: formData.get("reason") });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Motivo inválido" };
  }

  try {
    await llamarApi(`/internal/reports/${id}/publish`, {
      method: "POST",
      body: analisis.data,
    });
    revalidatePath("/informes");
    return { exito: "Informe publicado. Ya es visible en el sitio público." };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo publicar" };
  }
}
