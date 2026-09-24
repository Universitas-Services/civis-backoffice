"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { baremoSchema, type BaremoDetalle } from "@/contracts";
import { ErrorApi, llamarApiAccion, NoAutorizado } from "@/lib/api";
import { exigirRol } from "@/lib/rutas";

export type ErrorCampoBaremo = { readonly field: string; readonly message: string };

export type ResultadoBaremo =
  | { readonly ok: false; readonly error: string; readonly errores?: readonly ErrorCampoBaremo[] }
  | undefined;

function fallo(error: unknown): ResultadoBaremo {
  if (error instanceof NoAutorizado) return { ok: false, error: "Sesión expirada." };
  if (error instanceof ErrorApi) {
    return { ok: false, error: error.message, errores: error.detalles };
  }
  throw error;
}

function refrescar(id?: string) {
  revalidatePath("/baremo");
  revalidatePath("/baremo/configuracion");
  if (id) revalidatePath(`/baremo/configuracion/${id}`);
}

export async function crearBaremo(body: unknown): Promise<ResultadoBaremo> {
  await exigirRol("SUPER_ADMIN");
  const analisis = baremoSchema.safeParse(body);
  if (!analisis.success) {
    return {
      ok: false,
      error: "Revise los campos del baremo.",
      errores: analisis.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  try {
    const creado = await llamarApiAccion<BaremoDetalle>("/internal/baremos", {
      method: "POST",
      body: analisis.data,
    });
    refrescar(creado.id);
    redirect("/baremo/configuracion?aviso=creado");
  } catch (error) {
    return fallo(error);
  }
}

export async function actualizarBaremo(id: string, body: unknown): Promise<ResultadoBaremo> {
  await exigirRol("SUPER_ADMIN");
  const analisis = baremoSchema.safeParse(body);
  if (!analisis.success) {
    return {
      ok: false,
      error: "Revise los campos del baremo.",
      errores: analisis.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  try {
    const actualizado = await llamarApiAccion<BaremoDetalle>(`/internal/baremos/${id}`, {
      method: "PATCH",
      body: analisis.data,
    });
    refrescar(actualizado.id);
    redirect("/baremo/configuracion?aviso=actualizado");
  } catch (error) {
    return fallo(error);
  }
}

export async function activarBaremo(id: string, volverALista = false): Promise<ResultadoBaremo> {
  await exigirRol("SUPER_ADMIN");
  try {
    await llamarApiAccion(`/internal/baremos/${id}/activate`, { method: "POST" });
    refrescar(id);
    redirect(volverALista ? "/baremo/configuracion" : `/baremo/configuracion/${id}`);
  } catch (error) {
    return fallo(error);
  }
}

export async function eliminarBaremo(id: string): Promise<ResultadoBaremo> {
  await exigirRol("SUPER_ADMIN");
  try {
    await llamarApiAccion(`/internal/baremos/${id}`, { method: "DELETE" });
    refrescar();
    redirect("/baremo/configuracion");
  } catch (error) {
    return fallo(error);
  }
}
