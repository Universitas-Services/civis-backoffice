"use server";

import { redirect } from "next/navigation";
import { cambiarContrasenaSchema, loginSchema } from "@/contracts";
import { API_INTERNA } from "@/lib/config";
import {
  cabecerasAuthCookie,
  extraerRefreshCookie,
} from "@/lib/auth-refresh";
import { rutaInicio } from "@/lib/secciones-nav";
import { cerrarSesion, guardarSesion, leerSesion } from "@/lib/sesion";

export interface EstadoLogin {
  readonly error?: string;
  readonly campos?: Record<string, string>;
}

export interface EstadoCambioContrasena {
  readonly error?: string;
  readonly campos?: Record<string, string>;
}

/**
 * Inicia sesión contra la API.
 *
 * La respuesta trae el access token y una cookie de refresh. Ambos se guardan
 * cifrados del lado del servidor: el navegador sólo recibe una cookie opaca.
 */
export async function iniciarSesion(
  _previo: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const analisis = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!analisis.success) {
    const campos: Record<string, string> = {};
    for (const issue of analisis.error.issues) {
      const clave = issue.path.join(".");
      if (!campos[clave]) campos[clave] = issue.message;
    }
    return { campos };
  }

  const respuesta = await fetch(`${API_INTERNA}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(await cabecerasAuthCookie()),
    },
    body: JSON.stringify(analisis.data),
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta) {
    return { error: "No se pudo contactar con el servidor. ¿Está la API en marcha?" };
  }
  if (respuesta.status === 429) {
    return { error: "Demasiados intentos. Espere unos minutos antes de volver a probar." };
  }
  if (respuesta.status === 401) {
    return { error: "Credenciales inválidas." };
  }
  if (respuesta.status === 403) {
    const data = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    const mensaje = data?.message?.trim();
    // OriginGuard o cuenta bloqueada por intentos — no confundir con clave mala.
    return {
      error:
        mensaje && mensaje.length > 0
          ? mensaje
          : "Acceso denegado. Compruebe que CORS_ORIGINS tenga exactamente https://civis-backoffice.netlify.app (sin barra final) y que BACKOFFICE_PUBLIC_URL esté definida en Netlify.",
    };
  }
  if (!respuesta.ok) {
    const data = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    return { error: data?.message ?? `No se pudo iniciar sesión (${respuesta.status}).` };
  }

  const datos = (await respuesta.json()) as {
    accessToken: string;
    user: { id: string; email: string; fullName: string; roles: string[] };
    mustChangePassword: boolean;
  };

  const refreshCookie = extraerRefreshCookie(respuesta);
  if (!refreshCookie) {
    return {
      error:
        "El servidor no entregó la cookie de sesión (refresh). Revise que la API setee cp_refresh en el login.",
    };
  }

  await guardarSesion({
    usuario: {
      id: datos.user.id,
      email: datos.user.email,
      fullName: datos.user.fullName,
      roles: datos.user.roles as never,
    },
    accessToken: datos.accessToken,
    refreshCookie,
  });

  redirect(datos.mustChangePassword ? "/cambiar-contrasena" : rutaInicio(datos.user.roles));
}

export async function terminarSesion(): Promise<void> {
  const sesion = await leerSesion();
  if (sesion) {
    // Se avisa a la API para que revoque la familia de refresh tokens.
    await fetch(`${API_INTERNA}/auth/logout`, {
      method: "POST",
      headers: await cabecerasAuthCookie(sesion.refreshCookie),
      cache: "no-store",
    }).catch(() => undefined);
  }
  await cerrarSesion();
  redirect("/login");
}

export async function cambiarContrasena(
  _previo: EstadoCambioContrasena,
  formData: FormData,
): Promise<EstadoCambioContrasena> {
  const analisis = cambiarContrasenaSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!analisis.success) {
    const campos: Record<string, string> = {};
    for (const issue of analisis.error.issues) {
      const clave = issue.path.join(".");
      if (!campos[clave]) campos[clave] = issue.message;
    }
    return { campos };
  }

  const sesion = await leerSesion();
  if (!sesion) redirect("/login");

  const respuesta = await fetch(`${API_INTERNA}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${sesion.accessToken}`,
      ...(await cabecerasAuthCookie(sesion.refreshCookie)),
    },
    body: JSON.stringify(analisis.data),
    cache: "no-store",
  }).catch(() => null);

  if (!respuesta) return { error: "No se pudo contactar con el servidor." };
  if (!respuesta.ok) {
    const data = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    return { error: data?.message ?? "No se pudo cambiar la contraseña." };
  }

  // La API revoca todas las sesiones y limpia el refresh: hay que volver a entrar.
  await cerrarSesion();
  redirect("/login?passwordChanged=1");
}
