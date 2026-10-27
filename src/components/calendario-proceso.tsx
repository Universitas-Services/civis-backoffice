import type { ClavePeriodo, PeriodoProceso } from "@/contracts";
import { diaCalendario } from "@/lib/plazos";
import { diaSemana, sumarDias } from "@/lib/calendario-proceso";

/** Color de cada periodo: fondo del día y punto de la leyenda. */
const COLOR: Record<ClavePeriodo, { dia: string; punto: string }> = {
  LAPSO_OBJECIONES: { dia: "bg-toga-800 text-white", punto: "bg-toga-800" },
  ADMISION: { dia: "bg-balanza-600 text-white", punto: "bg-balanza-600" },
  DESCARGOS: {
    dia: "bg-balanza-100 text-balanza-700",
    punto: "bg-balanza-100 ring-1 ring-balanza-200",
  },
  COMPROBACION: { dia: "bg-toga-200 text-toga-800", punto: "bg-toga-200" },
};

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

function nombreMes(fecha: string): string {
  return diaCalendario(fecha, { month: "long", year: "numeric", day: undefined });
}

/** Meses (primer día `AAAA-MM-01`) que cubren los periodos. */
function meses(periodos: readonly PeriodoProceso[]): string[] {
  const primero = periodos[0]!.inicio.slice(0, 7);
  const ultimo = periodos[periodos.length - 1]!.fin.slice(0, 7);
  const lista: string[] = [];
  let [a, m] = primero.split("-").map(Number) as [number, number];
  for (;;) {
    const clave = `${a}-${String(m).padStart(2, "0")}`;
    lista.push(`${clave}-01`);
    if (clave >= ultimo || lista.length > 12) break;
    m++;
    if (m > 12) {
      m = 1;
      a++;
    }
  }
  return lista;
}

function periodoDe(fecha: string, periodos: readonly PeriodoProceso[]): PeriodoProceso | undefined {
  return periodos.find((p) => fecha >= p.inicio && fecha <= p.fin);
}

/**
 * Calendario mensual del proceso con cada periodo coloreado. Los feriados se
 * marcan con un punto; los fines de semana van atenuados.
 */
export function CalendarioProceso({
  periodos,
  feriados,
  lapsoHabiles,
  hoy,
}: {
  readonly periodos: readonly PeriodoProceso[];
  readonly feriados: readonly string[];
  /** El lapso de objeciones cuenta sólo días hábiles. */
  readonly lapsoHabiles: boolean;
  /** `AAAA-MM-DD` de hoy en Caracas. */
  readonly hoy: string;
}) {
  if (periodos.length === 0) return null;
  const festivos = new Set(feriados);

  return (
    <div className="space-y-5">
      <ol className="grid gap-2 sm:grid-cols-2">
        {periodos.map((p) => (
          <li key={p.clave} className="flex gap-3 rounded-md border border-toga-200 bg-white p-3">
            <span
              aria-hidden="true"
              className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${COLOR[p.clave].punto}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-toga-900">{p.titulo}</p>
              <p className="text-sm text-toga-700">
                {diaCalendario(p.inicio, { weekday: "short" })} →{" "}
                {diaCalendario(p.fin, { weekday: "short" })}
              </p>
              <p className="mt-0.5 text-xs text-toga-500">{p.detalle}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {meses(periodos).map((mes) => {
          // Lunes = 0.
          const desfase = (diaSemana(mes) + 6) % 7;
          const dias: string[] = [];
          for (let d = mes; d.slice(0, 7) === mes.slice(0, 7); d = sumarDias(d, 1)) dias.push(d);
          return (
            <figure key={mes} className="rounded-lg border border-toga-200 bg-white p-3">
              <figcaption className="mb-2 text-sm font-semibold text-toga-900 first-letter:uppercase">
                {nombreMes(mes)}
              </figcaption>
              <div role="grid" className="grid grid-cols-7 gap-1 text-center text-xs">
                {DIAS.map((d, i) => (
                  <span key={i} role="columnheader" className="pb-1 font-medium text-toga-400">
                    {d}
                  </span>
                ))}
                {Array.from({ length: desfase }, (_, i) => (
                  <span key={`v${i}`} />
                ))}
                {dias.map((d) => {
                  const p = periodoDe(d, periodos);
                  const finde = diaSemana(d) === 0 || diaSemana(d) === 6;
                  const festivo = festivos.has(d);
                  const etiqueta = [
                    diaCalendario(d, { weekday: "long", month: "long" }),
                    p?.titulo,
                    festivo ? "feriado" : null,
                    d === hoy ? "hoy" : null,
                  ]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <span
                      key={d}
                      role="gridcell"
                      aria-label={etiqueta}
                      title={etiqueta}
                      className={`relative flex h-8 items-center justify-center rounded cifra ${
                        p ? COLOR[p.clave].dia : finde ? "text-toga-300" : "text-toga-600"
                      } ${
                        lapsoHabiles && p?.clave === "LAPSO_OBJECIONES" && (finde || festivo)
                          ? "opacity-50"
                          : ""
                      } ${d === hoy ? "ring-2 ring-balanza-500 ring-offset-1" : ""}`}
                    >
                      {Number(d.slice(8))}
                      {festivo && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0.5 h-1 w-1 rounded-full bg-balanza-500"
                        />
                      )}
                    </span>
                  );
                })}
              </div>
            </figure>
          );
        })}
      </div>
      <p className="text-xs text-toga-500">
        Punto vino: feriado.{" "}
        {lapsoHabiles &&
          "En el lapso de objeciones, los fines de semana y feriados se ven atenuados porque no cuentan."}{" "}
        Los descargos y la comprobación son una estimación: cada objeción corre desde su propia
        notificación.
      </p>
    </div>
  );
}
