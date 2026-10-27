"use server";

import { revalidatePath } from "next/cache";
import { plazosProcesoSchema } from "@/contracts";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface EstadoPlazos {
  readonly error?: string;
  readonly exito?: string;
  readonly campos?: Record<string, string>;
}

/** Guarda la fecha de inicio, las duraciones y los feriados del proceso. */
export async function guardarPlazos(
  _previo: EstadoPlazos,
  formData: FormData,
): Promise<EstadoPlazos> {
  const inicio = String(formData.get("objectionPeriodStart") ?? "").trim();
  const feriados = String(formData.get("holidays") ?? "")
    .split(/[\s,;]+/)
    .map((f) => f.trim())
    .filter(Boolean);

  const analisis = plazosProcesoSchema.safeParse({
    objectionPeriodStart: inicio || null,
    objectionPeriodDays: formData.get("objectionPeriodDays"),
    objectionBusinessDays: formData.get("objectionBusinessDays") === "on",
    admissionDays: formData.get("admissionDays"),
    descargoDays: formData.get("descargoDays"),
    verificationDays: formData.get("verificationDays"),
    holidays: feriados,
  });
  if (!analisis.success) {
    const campos: Record<string, string> = {};
    for (const issue of analisis.error.issues) {
      const campo = String(issue.path[0] ?? "");
      campos[campo] ??= issue.message;
    }
    return { error: "Revise los campos marcados", campos };
  }

  try {
    await llamarApiAccion("/internal/portal", { method: "PATCH", body: analisis.data });
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo guardar" };
  }
  revalidatePath("/configuracion");
  revalidatePath("/comite-objeciones");
  return { exito: "Configuración de plazos guardada. El calendario se recalculó." };
}
