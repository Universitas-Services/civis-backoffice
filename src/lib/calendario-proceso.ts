/**
 * Cálculo del calendario del proceso. Espejo de civis-api `src/plazos/plazos.ts`
 * para la vista previa mientras el superadministrador edita los plazos; lo
 * que vale es lo que guarda y devuelve la API.
 *
 * Fechas `AAAA-MM-DD` en hora de Caracas (UTC-4, sin horario de verano).
 */
import type { ClavePeriodo, PeriodoProceso } from "@/contracts";

const DESFASE_CARACAS_MS = 4 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;

export function fechaCaracas(instante: Date): string {
  return new Date(instante.getTime() - DESFASE_CARACAS_MS).toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number): string {
  return new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * DIA_MS).toISOString().slice(0, 10);
}

export function diaSemana(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

export function esDiaHabil(fecha: string, feriados: ReadonlySet<string>): boolean {
  const d = diaSemana(fecha);
  return d !== 0 && d !== 6 && !feriados.has(fecha);
}

function primerDiaHabil(fecha: string, feriados: ReadonlySet<string>): string {
  let dia = fecha;
  while (!esDiaHabil(dia, feriados)) dia = sumarDias(dia, 1);
  return dia;
}

function lapso(inicio: string, n: number, habiles: boolean, feriados: ReadonlySet<string>) {
  if (!habiles) return { inicio, fin: sumarDias(inicio, Math.max(n, 1) - 1) };
  const primero = primerDiaHabil(inicio, feriados);
  let fin = primero;
  for (let contados = 1; contados < n;) {
    fin = sumarDias(fin, 1);
    if (esDiaHabil(fin, feriados)) contados++;
  }
  return { inicio: primero, fin };
}

export interface EntradaCalendario {
  readonly applicationsClosedAt: string | null;
  /** `AAAA-MM-DD` o null (automático: día hábil siguiente al cierre). */
  readonly inicio: string | null;
  readonly objectionPeriodDays: number;
  readonly objectionBusinessDays: boolean;
  readonly admissionDays: number;
  readonly descargoDays: number;
  readonly verificationDays: number;
  readonly holidays: readonly string[];
}

const TITULOS: Record<ClavePeriodo, string> = {
  LAPSO_OBJECIONES: "Lapso de objeciones",
  ADMISION: "Admisión por el comité",
  DESCARGOS: "Descargos (estimado)",
  COMPROBACION: "Comprobación (estimado)",
};

/** Periodos del proceso, o vacío si todavía no hay fecha de inicio. */
export function periodosProceso(e: EntradaCalendario): PeriodoProceso[] {
  const feriados = new Set(e.holidays);
  const inicio =
    e.inicio ??
    (e.applicationsClosedAt
      ? primerDiaHabil(sumarDias(fechaCaracas(new Date(e.applicationsClosedAt)), 1), feriados)
      : null);
  if (!inicio) return [];
  const objeciones = lapso(inicio, e.objectionPeriodDays, e.objectionBusinessDays, feriados);
  const admision = lapso(sumarDias(objeciones.fin, 1), e.admissionDays, false, feriados);
  const descargos = lapso(sumarDias(admision.fin, 1), e.descargoDays, false, feriados);
  const comprobacion = lapso(sumarDias(descargos.fin, 1), e.verificationDays, false, feriados);
  const tipo = e.objectionBusinessDays ? "hábiles" : "continuos";
  return [
    {
      clave: "LAPSO_OBJECIONES",
      titulo: TITULOS.LAPSO_OBJECIONES,
      detalle: `${e.objectionPeriodDays} días ${tipo} desde la publicación de la nómina`,
      ...objeciones,
    },
    {
      clave: "ADMISION",
      titulo: TITULOS.ADMISION,
      detalle: `${e.admissionDays} días continuos para admitir o inadmitir`,
      ...admision,
    },
    {
      clave: "DESCARGOS",
      titulo: TITULOS.DESCARGOS,
      detalle: `${e.descargoDays} días continuos desde la notificación de cada objeción`,
      ...descargos,
    },
    {
      clave: "COMPROBACION",
      titulo: TITULOS.COMPROBACION,
      detalle: `${e.verificationDays} días continuos tras vencer el descargo`,
      ...comprobacion,
    },
  ];
}
