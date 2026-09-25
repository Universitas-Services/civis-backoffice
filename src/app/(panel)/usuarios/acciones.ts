"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cambiarRolesSchema, ROLES, rolesAsignablesPara } from "@/contracts";
import { ErrorApi, llamarApiAccion } from "@/lib/api";
import { usuarioActual } from "@/lib/sesion";

const crearSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  fullName: z.string().trim().min(3, "Mínimo 3 caracteres").max(160),
  roles: z
    .array(z.enum(ROLES))
    .min(1, "Asigne un rol")
    .max(1, "Solo puede asignar un rol al crear el usuario"),
});

export interface EstadoUsuarios {
  readonly error?: string;
  readonly exito?: string;
  /** Se muestra UNA sola vez: no se guarda ni se vuelve a poder consultar. */
  readonly contrasenaTemporal?: string;
}

function rolesFueraDeAlcance(
  rolesActor: readonly (typeof ROLES)[number][],
  rolesSolicitados: readonly (typeof ROLES)[number][],
): boolean {
  const permitidos = new Set(rolesAsignablesPara(rolesActor));
  return rolesSolicitados.some((r) => !permitidos.has(r));
}

export async function crearUsuario(
  _previo: EstadoUsuarios,
  formData: FormData,
): Promise<EstadoUsuarios> {
  const actor = await usuarioActual();
  if (!actor) return { error: "Sesión expirada" };

  const analisis = crearSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    roles: formData.getAll("roles"),
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }
  if (rolesFueraDeAlcance(actor.roles, analisis.data.roles)) {
    return { error: "No puede asignar uno o más de los roles seleccionados" };
  }

  try {
    const creado = await llamarApiAccion<{ fullName: string; temporaryPassword: string }>(
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
    await llamarApiAccion(`/internal/users/${id}/status`, {
      method: "PATCH",
      body: { status, reason },
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof ErrorApi ? error.message : "No se pudo cambiar" };
  }
}

/**
 * Reemplaza el conjunto de roles de un usuario.
 *
 * Exige motivo porque cambia quién puede qué. La API además cierra las
 * sesiones abiertas de esa persona: el token que lleva en el navegador
 * declara los roles antiguos y no debe seguir sirviendo.
 */
export async function cambiarRoles(
  id: string,
  _previo: EstadoUsuarios,
  formData: FormData,
): Promise<EstadoUsuarios> {
  const actor = await usuarioActual();
  if (!actor) return { error: "Sesión expirada" };
  if (id === actor.id) {
    return { error: "No puede cambiar los roles de su propia cuenta" };
  }

  const analisis = cambiarRolesSchema.safeParse({
    roles: formData.getAll("roles"),
    reason: formData.get("reason"),
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Datos inválidos" };
  }
  if (rolesFueraDeAlcance(actor.roles, analisis.data.roles)) {
    return { error: "No puede asignar uno o más de los roles seleccionados" };
  }

  try {
    await llamarApiAccion(`/internal/users/${id}/roles`, {
      method: "PATCH",
      body: analisis.data,
    });
    revalidatePath("/usuarios");
    return { exito: "Rol actualizado. Se cerraron las sesiones abiertas de esa cuenta." };
  } catch (error) {
    return { error: error instanceof ErrorApi ? error.message : "No se pudieron cambiar" };
  }
}
