import { format, isValid, parse } from "date-fns";

/**
 * Feriados nacionales de Venezuela 2026-2027 (incluye carnaval y Semana
 * Santa). Espejo de civis-api `FERIADOS_VENEZUELA`: se usa para
 * «Restablecer feriados nacionales» en la configuración del proceso.
 */
export const FERIADOS_VENEZUELA: readonly string[] = [
  "2026-01-01",
  "2026-02-16",
  "2026-02-17",
  "2026-04-02",
  "2026-04-03",
  "2026-04-19",
  "2026-05-01",
  "2026-06-24",
  "2026-07-05",
  "2026-07-24",
  "2026-10-12",
  "2026-12-24",
  "2026-12-25",
  "2026-12-31",
  "2027-01-01",
  "2027-02-08",
  "2027-02-09",
  "2027-03-25",
  "2027-03-26",
  "2027-04-19",
  "2027-05-01",
  "2027-06-24",
  "2027-07-05",
  "2027-07-24",
  "2027-10-12",
  "2027-12-24",
  "2027-12-25",
  "2027-12-31",
];

/** `AAAA-MM-DD` → Date local (sin desfase de zona). */
export function aFecha(iso: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

/** Date local → `AAAA-MM-DD`. */
export function aIso(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd");
}
