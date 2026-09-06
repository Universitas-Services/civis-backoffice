export const APP = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Panel operativo",
} as const;

/** URL que usa el SERVIDOR de Next para hablar con la API. */
export const API_INTERNA =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const COOKIE_SESION = process.env.SESSION_COOKIE_NAME ?? "cp_bo_session";
