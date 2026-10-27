"use server";

import { revalidatePath } from "next/cache";
import { consideracionesComiteSchema } from "@/contracts";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface EstadoActoComite {
  readonly error?: string;
  readonly exito?: string;
  readonly hecho?: boolean;
}

function consideraciones(formData: FormData): string | undefined | { error: string } {
  const analisis = consideracionesComiteSchema.safeParse(
    String(formData.get("consideraciones") ?? ""),
  );
  if (!analisis.success) return { error: analisis.error.issues[0]?.message ?? "Texto no válido" };
  return analisis.data || undefined;
}

async function dictar(
  objectionId: string,
  ruta: "admision" | "decision",
  cuerpo: Record<string, unknown>,
  exito: string,
): Promise<EstadoActoComite> {
  try {
    await llamarApiAccion(`/internal/comite/objeciones/${objectionId}/${ruta}`, {
      method: "POST",
      body: cuerpo,
    });
  } catch (error) {
    return {
      error: error instanceof ErrorApi ? error.message : "No se pudo dictar el auto",
    };
  }
  revalidatePath("/comite-objeciones");
  revalidatePath(`/comite-objeciones/${objectionId}`);
  return { exito, hecho: true };
}

/** Admite (abre el plazo de descargo) o inadmite la objeción. */
export async function pronunciarAdmision(
  objectionId: string,
  admitir: boolean,
  _previo: EstadoActoComite,
  formData: FormData,
): Promise<EstadoActoComite> {
  const texto = consideraciones(formData);
  if (typeof texto === "object") return texto;
  return dictar(
    objectionId,
    "admision",
    { admitir, consideraciones: texto },
    admitir
      ? "Objeción admitida. Se notificó al postulado con el auto y la denuncia."
      : "Objeción inadmitida. Se notificó a la persona objetante.",
  );
}

/** Decisión final: con lugar (pasa al Consejo) o sin lugar. */
export async function decidirObjecion(
  objectionId: string,
  decision: "CON_LUGAR" | "SIN_LUGAR",
  _previo: EstadoActoComite,
  formData: FormData,
): Promise<EstadoActoComite> {
  const texto = consideraciones(formData);
  if (typeof texto === "object") return texto;
  return dictar(
    objectionId,
    "decision",
    { decision, consideraciones: texto },
    decision === "CON_LUGAR"
      ? "Declarada con lugar. Pasó al Consejo y se notificó a ambas partes."
      : "Declarada sin lugar. Se notificó a ambas partes.",
  );
}
