/**
 * Presentación de plazos del procedimiento de objeciones. Todo en hora de
 * Caracas, que es la que fija la API para los vencimientos.
 */

const ZONA = "America/Caracas";

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    timeZone: ZONA,
  });
}

export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  });
}

export function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-VE", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: ZONA,
  });
}

/** Fecha de calendario `AAAA-MM-DD` (sin hora) en texto. */
export function diaCalendario(fecha: string, opciones?: Intl.DateTimeFormatOptions): string {
  return new Date(`${fecha}T12:00:00Z`).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    ...opciones,
  });
}

export type TonoPlazo = "vencido" | "urgente" | "normal";

/**
 * Lo que queda de un plazo: «Vence hoy», «Quedan 2 días», «Venció hace 1 día».
 * `urgente` cuando falta menos de un día.
 */
export function restante(
  iso: string,
  ahora: Date = new Date(),
): { texto: string; tono: TonoPlazo } {
  const ms = new Date(iso).getTime() - ahora.getTime();
  const horas = ms / 3_600_000;
  if (ms <= 0) {
    const dias = Math.floor(-horas / 24);
    return {
      texto: dias < 1 ? "Venció hoy" : `Venció hace ${dias} ${dias === 1 ? "día" : "días"}`,
      tono: "vencido",
    };
  }
  if (horas < 24) {
    const h = Math.max(1, Math.floor(horas));
    return { texto: `Quedan ${h} ${h === 1 ? "hora" : "horas"}`, tono: "urgente" };
  }
  const dias = Math.floor(horas / 24);
  return { texto: `Quedan ${dias} ${dias === 1 ? "día" : "días"}`, tono: "normal" };
}

export const CLASE_TONO: Record<TonoPlazo, string> = {
  vencido: "font-semibold text-balanza-700",
  urgente: "font-semibold text-balanza-600",
  normal: "text-toga-600",
};
