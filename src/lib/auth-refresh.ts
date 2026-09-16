import "server-only";

import { API_INTERNA, COOKIE_REFRESH_API, origenPanel } from "./config";
import { leerSesion } from "./sesion";

/**
 * Refresh de la API vía BFF.
 *
 * La cookie HttpOnly `cp_refresh` no viaja en el navegador del panel: Next la
 * captura del Set-Cookie, la guarda cifrada en la sesión del panel y la
 * reenvía solo a /auth/*. Un refresh es rotativo: reusar el valor anterior
 * revoca toda la familia (REUSE_DETECTED).
 *
 * Origin: el OriginGuard de la API exige el origen del panel en CORS_ORIGINS.
 * Se envía `BACKOFFICE_PUBLIC_URL` (origenPanel), nunca un localhost inventado
 * en producción.
 */

export type TokensRenovados = {
  readonly accessToken: string;
  readonly refreshCookie: string;
};

/** Lista Set-Cookie de una Response (Node/undici). */
function setCookieHeaders(respuesta: Response): string[] {
  const headers = respuesta.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const unica = respuesta.headers.get("set-cookie");
  return unica ? [unica] : [];
}

/**
 * Extrae `cp_refresh=<valor>` del Set-Cookie de login/refresh.
 * Descarta Path, HttpOnly, etc.: eso no va en el header Cookie de ida.
 */
export function extraerRefreshCookie(respuesta: Response): string | null {
  const prefijo = `${COOKIE_REFRESH_API}=`;
  for (const cruda of setCookieHeaders(respuesta)) {
    const primerSegmento = cruda.split(";")[0]?.trim() ?? "";
    if (primerSegmento.startsWith(prefijo) && primerSegmento.length > prefijo.length) {
      return primerSegmento;
    }
  }
  return null;
}

/**
 * Cabeceras para login/refresh/logout hacia la API.
 *
 * Origin = URL pública del panel (debe coincidir con CORS_ORIGINS).
 * Cookie = refresh solo cuando aplica.
 */
export function cabecerasAuthCookie(refreshCookie?: string | null): Record<string, string> {
  return {
    Origin: origenPanel(),
    ...(refreshCookie ? { Cookie: refreshCookie } : {}),
  };
}

let renovacionEnCurso: Promise<TokensRenovados | null> | null = null;

/**
 * Un solo POST /auth/refresh a la vez. Si accessToken es null, 401, o no hay
 * Set-Cookie nuevo, devuelve null (sin reutilizar el refresh anterior).
 */
export async function renovarAccessConMutex(
  refreshCookie: string,
): Promise<TokensRenovados | null> {
  if (!renovacionEnCurso) {
    renovacionEnCurso = ejecutarRefresh(refreshCookie).finally(() => {
      renovacionEnCurso = null;
    });
  }
  return renovacionEnCurso;
}

/**
 * Renueva el access de forma segura ante 401.
 *
 * Evita REUSE_DETECTED: si otro request ya renovó (misma cookie de panel con
 * access/refresh nuevos), reutiliza esa sesión en lugar de refrescar de nuevo
 * con el refresh viejo.
 */
export async function renovarSesionTras401(
  accessQueFallo: string | null,
  refreshAlFallar: string | null,
): Promise<TokensRenovados | null> {
  if (!refreshAlFallar) return null;

  const actual = await leerSesion();
  if (
    actual?.accessToken &&
    actual.refreshCookie &&
    actual.accessToken !== accessQueFallo
  ) {
    // Otro request ya renovó y guardó tokens nuevos.
    return {
      accessToken: actual.accessToken,
      refreshCookie: actual.refreshCookie,
    };
  }

  const refreshAUsar = actual?.refreshCookie ?? refreshAlFallar;
  const tokens = await renovarAccessConMutex(refreshAUsar);

  if (tokens) {
    return tokens;
  }

  // Refresh falló: quizá otro request ganó la carrera y ya escribió sesión.
  const otraVez = await leerSesion();
  if (
    otraVez?.accessToken &&
    otraVez.refreshCookie &&
    otraVez.accessToken !== accessQueFallo
  ) {
    return {
      accessToken: otraVez.accessToken,
      refreshCookie: otraVez.refreshCookie,
    };
  }

  return null;
}

async function ejecutarRefresh(refreshCookie: string): Promise<TokensRenovados | null> {
  const respuesta = await fetch(`${API_INTERNA}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...cabecerasAuthCookie(refreshCookie),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  }).catch(() => null);

  if (!respuesta) return null;

  // 200 + { accessToken: null } = sin sesión; 401 = inválido / reuso.
  if (respuesta.status === 401 || !respuesta.ok) return null;

  const datos = (await respuesta.json().catch(() => null)) as {
    accessToken?: string | null;
  } | null;

  if (!datos?.accessToken) return null;

  const nuevaRefresh = extraerRefreshCookie(respuesta);
  if (!nuevaRefresh) {
    return null;
  }

  return { accessToken: datos.accessToken, refreshCookie: nuevaRefresh };
}
