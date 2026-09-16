export const APP = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Panel operativo",
} as const;

/** URL que usa el SERVIDOR de Next para hablar con la API. */
export const API_INTERNA =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const COOKIE_SESION = process.env.SESSION_COOKIE_NAME ?? "cp_bo_session";

/** Nombre de la cookie HttpOnly de refresh que emite la API (path /api/v1/auth). */
export const COOKIE_REFRESH_API = process.env.API_REFRESH_COOKIE_NAME ?? "cp_refresh";

/** Origen público del panel (`BACKOFFICE_PUBLIC_URL`).
 * Se envía como header `Origin` en login/refresh/logout (OriginGuard).
 * Debe coincidir EXACTAMENTE con un valor de CORS_ORIGINS en la API.
 * En producción: la URL desplegada del backoffice, nunca localhost.
 */
export function origenPanel(): string {
  const configurada = process.env.BACKOFFICE_PUBLIC_URL?.replace(/\/$/, "");
  if (configurada) return configurada;
  return "http://localhost:3002";
}
