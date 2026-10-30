"use server";

import { revalidatePath } from "next/cache";
import { consideracionesComiteSchema, MINIMO_MOTIVO_INADMISION } from "@/contracts";
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

/** Motivo de fuerza mayor: sólo se envía si el formulario lo pidió (fuera de plazo). */
function motivoExtemporaneo(formData: FormData): string | undefined | { error: string } {
  const campo = formData.get("motivoExtemporaneo");
  if (campo === null) return undefined;
  const texto = String(campo).trim();
  if (texto.length < 20) {
    return { error: "Explique el motivo de fuerza mayor (al menos 20 caracteres)." };
  }
  if (texto.length > 2000) return { error: "El motivo no puede superar 2000 caracteres." };
  return texto;
}

async function dictar<T>(
  objectionId: string,
  ruta: "admision" | "decision",
  cuerpo: Record<string, unknown>,
  exito: (respuesta: T) => string,
): Promise<EstadoActoComite> {
  let respuesta: T;
  try {
    respuesta = await llamarApiAccion<T>(`/internal/comite/objeciones/${objectionId}/${ruta}`, {
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
  return { exito: exito(respuesta), hecho: true };
}

const fechaCaracas = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    timeZone: "America/Caracas",
    day: "numeric",
    month: "long",
  });

/**
 * Admite o inadmite la objeción. En plazo, el auto queda dictado y se
 * notifica al día siguiente del último día de admisión; fuera de plazo (con
 * motivo de fuerza mayor), se notifica en el acto.
 */
export async function pronunciarAdmision(
  objectionId: string,
  admitir: boolean,
  _previo: EstadoActoComite,
  formData: FormData,
): Promise<EstadoActoComite> {
  const texto = consideraciones(formData);
  if (typeof texto === "object") return texto;
  if (!admitir && (texto?.length ?? 0) < MINIMO_MOTIVO_INADMISION) {
    return {
      error: `Explique por qué se inadmite (mínimo ${MINIMO_MOTIVO_INADMISION} caracteres).`,
    };
  }
  const motivo = motivoExtemporaneo(formData);
  if (typeof motivo === "object") return motivo;
  return dictar<{ stage: string; notificationDueAt: string; notificados: number }>(
    objectionId,
    "admision",
    { admitir, consideraciones: texto, motivoExtemporaneo: motivo },
    (r) => {
      const notificada = r.stage === "EN_DESCARGO" || r.notificados > 0;
      if (notificada) {
        return admitir
          ? "Objeción admitida y notificada al postulado con el auto y la denuncia."
          : "Objeción inadmitida y notificada a la persona objetante.";
      }
      const cuando = fechaCaracas(r.notificationDueAt);
      return admitir
        ? `Objeción admitida. Se notificará al postulado el ${cuando}.`
        : `Objeción inadmitida. Se notificará a la persona objetante el ${cuando}.`;
    },
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
  const motivo = motivoExtemporaneo(formData);
  if (typeof motivo === "object") return motivo;
  return dictar(
    objectionId,
    "decision",
    { decision, consideraciones: texto, motivoExtemporaneo: motivo },
    () =>
      decision === "CON_LUGAR"
        ? "Declarada con lugar. Pasó al Consejo y se notificó a ambas partes."
        : "Declarada sin lugar. Se notificó a ambas partes.",
  );
}
