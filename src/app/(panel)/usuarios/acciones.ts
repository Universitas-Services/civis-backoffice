"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROLES } from "@/contracts";
import { ErrorApi, llamarApi } from "@/lib/api";

const crearSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  fullName: z.string().trim().min(3, "Mínimo 3 caracteres").max(160),
  roles: z.array(z.enum(ROLES)).min(1, "Asigne al menos un rol"),
});

export interface EstadoUsuarios {
  readonly error?: string;
  readonly exito?: string;
  /** Se muestra UNA sola vez: no se guarda ni se vuelve a poder consultar. */
  readonly contrasenaTemporal?: string;
}

export async function crearUsuario(
  _previo: EstadoUsuarios,
  formData: FormData,
): Promise<EstadoUsuarios> {
  const analisis = crearSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    roles: formData.getAll("roles"),
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const creado = await llamarApi<{ fullName: string; temporaryPassword: string }>(
      "/internal/users",
      { method: "POST", body: analisis.data },
    );
    revalidatePath("/usuarios");
    return {
      exito: `Usuario ${creado.fullName} creado.`,
      contrasenaTemporal: creado.temporaryPassword,
    };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudo crear el usuario" };
  }
}

/** Interruptor de suspensión. No borra el historial de esa persona. */
export async function cambiarEstado(
  id: string,
  status: "ACTIVE" | "SUSPENDED",
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (reason.trim().length < 10) {
    return { ok: false, error: "Indique el motivo (mínimo 10 caracteres)" };
  }
  try {
    await llamarApi(`/internal/users/${id}/status`, { method: "PATCH", body: { status, reason } });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo cambiar" };
  }
}
