import "server-only";
import { API_INTERNA } from "./config";
import { leerSesion } from "./sesion";

/**
 * Cliente de la API para el panel interno.
 *
 * Se ejecuta SIEMPRE en el servidor: adjunta el token desde la cookie cifrada,
 * de modo que el navegador nunca lo ve. Un 401 se propaga como `NoAutorizado`
 * para que la capa superior redirija al login.
 */
export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detalles?: readonly { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ErrorApi";
  }
}

export class NoAutorizado extends ErrorApi {
  constructor() {
    super("Sesión expirada", 401);
    this.name = "NoAutorizado";
  }
}

interface Opciones {
  readonly method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly body?: unknown;
  /** Segundos de caché. Por defecto 0: el panel muestra siempre el estado real. */
  readonly revalidate?: number;
}

export async function llamarApi<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const sesion = await leerSesion();
  const token = sesion?.accessToken ?? null;

  const respuesta = await fetch(`${API_INTERNA}${ruta}`, {
    method: opciones.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    ...(opciones.revalidate
      ? { next: { revalidate: opciones.revalidate } }
      : { cache: "no-store" as const }),
  });

  // Un 401 aquí significa que la sesión ya no sirve: la renovación la hace
  // el proxy ANTES de llegar a la página, que es el único punto donde se
  // puede guardar el token nuevo. Reintentar aquí rompería la rotación.
  if (respuesta.status === 401) throw new NoAutorizado();
  if (respuesta.status === 204) return undefined as T;

  const datos = (await respuesta.json().catch(() => null)) as
    (T & { message?: string; errors?: { field: string; message: string }[] }) | null;

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.message ?? "No se pudo completar la operación",
      respuesta.status,
      datos?.errors,
    );
  }
  return datos as T;
}
