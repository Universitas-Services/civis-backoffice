export const APP = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Panel operativo",
} as const;

/** URL que usa el SERVIDOR de Next para hablar con la API. */
export const API_INTERNA =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const COOKIE_SESION = process.env.SESSION_COOKIE_NAME ?? "cp_bo_session";

/** Nombre de la cookie HttpOnly de refresh que emite la API (path /api/v1/auth). */
export const COOKIE_REFRESH_API = process.env.API_REFRESH_COOKIE_NAME ?? "cp_refresh";

/**
 * Origen público del panel (redirects, fallback).
 * En Netlify: definir BACKOFFICE_PUBLIC_URL=https://civis-backoffice.netlify.app
 * (sin barra final) y el mismo valor en CORS_ORIGINS de la API.
 */
export function origenPanel(): string {
  const configurada = process.env.BACKOFFICE_PUBLIC_URL?.replace(/\/$/, "");
  if (configurada) return configurada;
  return "http://localhost:3002";
}
