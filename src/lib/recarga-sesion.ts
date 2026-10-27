/**
 * Recarga completa hacia los Route Handlers de sesión.
 *
 * Un `redirect()` a `/api/sesion/*` desde el render no sirve: tras una Server
 * Action con `revalidatePath` (o un `router.refresh`), el enrutador del cliente
 * aplica ese 307 como navegación suave, mezcla la URL con datos de otra ruta y
 * la pantalla queda en blanco. Por eso el render pide la recarga al navegador
 * (`window.location.replace`), que sí hace una petición de documento real.
 *
 * Este módulo no toca la sesión: sirve tanto al servidor como a `error.tsx`.
 */

const PREFIJO_DIGEST = "CIVIS_RECARGA_SESION:";

/** Ruta del handler que renueva y devuelve a `volver`. */
export function rutaRenovar(volver: string): string {
  const segura = volver.startsWith("/") && !volver.startsWith("//") ? volver : "/inicio";
  return `/api/sesion/renovar?volver=${encodeURIComponent(segura)}`;
}

export const RUTA_EXPIRADA = "/api/sesion/expirada";

/** Solo se aceptan destinos de los handlers de sesión del propio panel. */
function destinoValido(destino: string): boolean {
  return destino.startsWith("/api/sesion/renovar?") || destino === RUTA_EXPIRADA;
}

/**
 * Error que una página lanza para pedir la recarga.
 *
 * Lleva su propio `digest`: Next lo respeta y lo envía tal cual al cliente
 * incluso en producción (el `message` sí se oculta), así `error.tsx` sabe
 * adónde ir sin exponer nada de la sesión.
 */
export class RecargaSesion extends Error {
  readonly digest: string;

  constructor(readonly destino: string) {
    super("Renovando la sesión");
    this.name = "RecargaSesion";
    this.digest = `${PREFIJO_DIGEST}${destino}`;
  }
}

/** Destino de recarga contenido en un `digest`, o null si no es uno nuestro. */
export function destinoDeDigest(digest: string | undefined): string | null {
  if (!digest?.startsWith(PREFIJO_DIGEST)) return null;
  const destino = digest.slice(PREFIJO_DIGEST.length);
  return destinoValido(destino) ? destino : null;
}
