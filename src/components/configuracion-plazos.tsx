"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Minus, Plus, RotateCcw, X } from "lucide-react";
import type { AjustesPortal } from "@/contracts";
import { guardarPlazos, type EstadoPlazos } from "@/app/(panel)/configuracion/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";
import { fechaCaracas, periodosProceso } from "@/lib/calendario-proceso";
import { aFecha, aIso, FERIADOS_VENEZUELA } from "@/lib/feriados";
import { fechaLarga } from "@/lib/plazos";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarioProceso } from "@/components/calendario-proceso";

/** Plazos de la LOTSJ (arts. 71 y 72). */
const LEY = { lapso: 15, admision: 8, descargo: 3, comprobacion: 5 } as const;

/** Fines de semana atenuados y feriados marcados, en todos los calendarios. */
const FIN_DE_SEMANA = { dayOfWeek: [0, 6] };
const CLASES_DIA = {
  finDeSemana: "[&>button]:text-toga-400",
  feriado:
    "[&>button]:font-semibold [&>button]:text-balanza-700 [&>button]:underline [&>button]:decoration-balanza-500 [&>button]:decoration-2 [&>button]:underline-offset-4",
};

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar configuración"}
    </button>
  );
}

function Paso({
  numero,
  titulo,
  ayuda,
  accion,
  children,
}: {
  readonly numero: number;
  readonly titulo: string;
  readonly ayuda?: string;
  readonly accion?: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-lg border border-toga-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <legend className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-toga-900 text-xs font-semibold text-white">
            {numero}
          </span>
          <span className="font-semibold text-toga-900">{titulo}</span>
        </legend>
        {accion}
      </div>
      {ayuda && <p className="mt-1.5 text-sm text-toga-600">{ayuda}</p>}
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

/** Número de días con botones − / +, y la referencia de la ley. */
function Duracion({
  etiqueta,
  tipoDia,
  valor,
  ley,
  onCambio,
  error,
  children,
}: {
  readonly etiqueta: string;
  readonly tipoDia: string;
  readonly valor: number;
  readonly ley: number;
  readonly onCambio: (n: number) => void;
  readonly error?: string;
  readonly children?: React.ReactNode;
}) {
  const fijar = (n: number) => onCambio(Math.min(60, Math.max(1, n || 1)));
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-toga-900">{etiqueta}</p>
          <p className="text-xs text-toga-500">
            {tipoDia} ·{" "}
            {valor === ley ? (
              <span className="text-validado-700">según la ley ({ley})</span>
            ) : (
              <span className="text-balanza-700">la ley indica {ley}</span>
            )}
          </p>
        </div>
        <div className="flex items-center rounded-md border border-toga-300 bg-white">
          <button
            type="button"
            onClick={() => fijar(valor - 1)}
            aria-label={`Restar un día a ${etiqueta}`}
            className="grid h-9 w-9 place-items-center text-toga-600 hover:bg-toga-50 disabled:opacity-40"
            disabled={valor <= 1}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <input
            type="number"
            min={1}
            max={60}
            value={valor}
            onChange={(e) => fijar(Number(e.target.value))}
            aria-label={`${etiqueta} (días)`}
            className="cifra h-9 w-12 border-x border-toga-200 text-center text-sm text-toga-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => fijar(valor + 1)}
            aria-label={`Sumar un día a ${etiqueta}`}
            className="grid h-9 w-9 place-items-center text-toga-600 hover:bg-toga-50 disabled:opacity-40"
            disabled={valor >= 60}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {children}
      {error && <p className="mt-1 text-sm text-balanza-700">{error}</p>}
    </div>
  );
}

/**
 * Configuración de los plazos del proceso en tres pasos (inicio del lapso,
 * duración de cada etapa y feriados) con la vista previa del calendario al
 * lado: cada cambio recalcula los periodos antes de guardar.
 */
export function ConfiguracionPlazos({ ajustes }: { readonly ajustes: AjustesPortal }) {
  const [estado, accion] = useActionState<EstadoPlazos, FormData>(guardarPlazos, {});
  useToastDesdeEstado(estado);

  const inicioGuardado = ajustes.objectionPeriodStart
    ? fechaCaracas(new Date(ajustes.objectionPeriodStart))
    : "";
  const [modoInicio, setModoInicio] = useState<"auto" | "fecha">(inicioGuardado ? "fecha" : "auto");
  const [inicio, setInicio] = useState(inicioGuardado);
  const [abiertoInicio, setAbiertoInicio] = useState(false);
  const [lapsoDias, setLapsoDias] = useState(ajustes.objectionPeriodDays);
  const [habiles, setHabiles] = useState(ajustes.objectionBusinessDays);
  const [admision, setAdmision] = useState(ajustes.admissionDays);
  const [descargo, setDescargo] = useState(ajustes.descargoDays);
  const [comprobacion, setComprobacion] = useState(ajustes.verificationDays);
  const [feriados, setFeriados] = useState<string[]>(() => [...ajustes.holidays].sort());

  const inicioEfectivo = modoInicio === "fecha" ? inicio : "";
  const fechasFeriados = useMemo(
    () => feriados.map(aFecha).filter((d): d is Date => d !== undefined),
    [feriados],
  );
  const modificadores = { finDeSemana: FIN_DE_SEMANA, feriado: fechasFeriados };

  const periodos = useMemo(
    () =>
      periodosProceso({
        applicationsClosedAt: ajustes.applicationsClosedAt,
        inicio: inicioEfectivo || null,
        objectionPeriodDays: lapsoDias || 1,
        objectionBusinessDays: habiles,
        admissionDays: admision || 1,
        descargoDays: descargo || 1,
        verificationDays: comprobacion || 1,
        holidays: feriados,
      }),
    [
      ajustes.applicationsClosedAt,
      inicioEfectivo,
      lapsoDias,
      habiles,
      admision,
      descargo,
      comprobacion,
      feriados,
    ],
  );
  const campos = estado.campos ?? {};
  const enLey =
    lapsoDias === LEY.lapso &&
    admision === LEY.admision &&
    descargo === LEY.descargo &&
    comprobacion === LEY.comprobacion;

  const porAnio = useMemo(() => {
    const grupos = new Map<string, string[]>();
    for (const f of feriados) grupos.set(f.slice(0, 4), [...(grupos.get(f.slice(0, 4)) ?? []), f]);
    return [...grupos.entries()];
  }, [feriados]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <form action={accion} className="space-y-4">
        {/* Lo que guarda la acción, con el mismo formato de siempre. */}
        <input type="hidden" name="objectionPeriodStart" value={inicioEfectivo} />
        <input type="hidden" name="objectionPeriodDays" value={lapsoDias} />
        {habiles && <input type="hidden" name="objectionBusinessDays" value="on" />}
        <input type="hidden" name="admissionDays" value={admision} />
        <input type="hidden" name="descargoDays" value={descargo} />
        <input type="hidden" name="verificationDays" value={comprobacion} />
        <input type="hidden" name="holidays" value={feriados.join("\n")} />

        <Paso numero={1} titulo="¿Cuándo empieza el lapso de objeciones?">
          <div className="grid gap-2" role="radiogroup" aria-label="Inicio del lapso">
            {(
              [
                {
                  valor: "auto",
                  titulo: "Automático",
                  detalle: ajustes.applicationsClosedAt
                    ? `El día hábil siguiente al cierre de postulaciones (${fechaLarga(ajustes.applicationsClosedAt)}).`
                    : "El día hábil siguiente al cierre de postulaciones. Se calcula al cerrarlas.",
                },
                {
                  valor: "fecha",
                  titulo: "Elegir una fecha",
                  detalle: "Por ejemplo, el día de publicación de la nómina.",
                },
              ] as const
            ).map((op) => (
              <label
                key={op.valor}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-md border p-3",
                  modoInicio === op.valor
                    ? "border-balanza-600 bg-balanza-50/50"
                    : "border-toga-200 hover:border-toga-300",
                )}
              >
                <input
                  type="radio"
                  name="modo-inicio"
                  checked={modoInicio === op.valor}
                  onChange={() => setModoInicio(op.valor)}
                  className="mt-0.5 h-4 w-4 accent-balanza-600"
                />
                <span>
                  <span className="block text-sm font-medium text-toga-900">{op.titulo}</span>
                  <span className="block text-xs text-toga-600">{op.detalle}</span>
                </span>
              </label>
            ))}
          </div>

          {modoInicio === "fecha" && (
            <Popover open={abiertoInicio} onOpenChange={setAbiertoInicio}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-invalid={campos.objectionPeriodStart ? true : undefined}
                  className={cn(
                    "mt-3 flex h-10 w-full items-center justify-between gap-2 rounded-md border border-toga-300 bg-white px-3 text-left text-sm",
                    "focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20",
                    inicio ? "text-toga-900" : "text-toga-400",
                  )}
                >
                  <span>
                    {inicio
                      ? format(aFecha(inicio)!, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
                      : "Elija el día de inicio"}
                  </span>
                  <CalendarIcon className="h-4 w-4 shrink-0 text-toga-500" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={aFecha(inicio)}
                  defaultMonth={aFecha(inicio)}
                  onSelect={(d) => {
                    setInicio(d ? aIso(d) : "");
                    setAbiertoInicio(false);
                  }}
                  startMonth={new Date(2026, 0)}
                  endMonth={new Date(2028, 11)}
                  modifiers={modificadores}
                  modifiersClassNames={CLASES_DIA}
                />
                <p className="border-t border-toga-100 px-3 py-2 text-xs text-toga-500">
                  <span className="font-semibold text-balanza-700 underline decoration-2">12</span>{" "}
                  feriado · <span className="text-toga-400">12</span> fin de semana
                </p>
              </PopoverContent>
            </Popover>
          )}
          {campos.objectionPeriodStart && (
            <p className="mt-1 text-sm text-balanza-700">{campos.objectionPeriodStart}</p>
          )}
        </Paso>

        <Paso
          numero={2}
          titulo="¿Cuántos días dura cada etapa?"
          accion={
            !enLey && (
              <button
                type="button"
                onClick={() => {
                  setLapsoDias(LEY.lapso);
                  setAdmision(LEY.admision);
                  setDescargo(LEY.descargo);
                  setComprobacion(LEY.comprobacion);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-balanza-700 hover:bg-balanza-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Usar los plazos de ley
              </button>
            )
          }
        >
          <div className="divide-y divide-toga-100">
            <Duracion
              etiqueta="Lapso de objeciones"
              tipoDia={habiles ? "días hábiles" : "días continuos"}
              valor={lapsoDias}
              ley={LEY.lapso}
              onCambio={setLapsoDias}
              error={campos.objectionPeriodDays}
            >
              <div
                role="radiogroup"
                aria-label="Cómo se cuentan los días del lapso"
                className="mt-2 inline-flex rounded-md border border-toga-300 p-0.5 text-xs"
              >
                {[
                  { v: true, t: "Hábiles" },
                  { v: false, t: "Continuos" },
                ].map((op) => (
                  <button
                    key={op.t}
                    type="button"
                    role="radio"
                    aria-checked={habiles === op.v}
                    onClick={() => setHabiles(op.v)}
                    className={cn(
                      "rounded px-3 py-1 font-medium",
                      habiles === op.v
                        ? "bg-toga-900 text-white"
                        : "text-toga-600 hover:bg-toga-50",
                    )}
                  >
                    {op.t}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-toga-500">
                El art. 71 de la LOTSJ habla de días continuos. En hábiles se saltan fines de semana
                y feriados.
              </p>
            </Duracion>
            <Duracion
              etiqueta="Admisión del comité"
              tipoDia="días continuos"
              valor={admision}
              ley={LEY.admision}
              onCambio={setAdmision}
              error={campos.admissionDays}
            />
            <Duracion
              etiqueta="Descargo del postulante"
              tipoDia="días continuos desde la notificación"
              valor={descargo}
              ley={LEY.descargo}
              onCambio={setDescargo}
              error={campos.descargoDays}
            />
            <Duracion
              etiqueta="Comprobación"
              tipoDia="días continuos, como máximo"
              valor={comprobacion}
              ley={LEY.comprobacion}
              onCambio={setComprobacion}
              error={campos.verificationDays}
            />
          </div>
        </Paso>

        <Paso
          numero={3}
          titulo="Feriados"
          ayuda="Toque un día para marcarlo o quitarlo como feriado. Sólo cuentan cuando el lapso va en días hábiles."
          accion={
            <button
              type="button"
              onClick={() => setFeriados([...FERIADOS_VENEZUELA])}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-balanza-700 hover:bg-balanza-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Feriados nacionales
            </button>
          }
        >
          <div className="flex justify-center rounded-md border border-toga-100">
            <Calendar
              mode="multiple"
              selected={fechasFeriados}
              onSelect={(dias) => setFeriados((dias ?? []).map(aIso).sort())}
              defaultMonth={aFecha(inicioEfectivo) ?? new Date()}
              startMonth={new Date(2026, 0)}
              endMonth={new Date(2028, 11)}
              modifiers={{ finDeSemana: FIN_DE_SEMANA }}
              modifiersClassNames={{ finDeSemana: CLASES_DIA.finDeSemana }}
            />
          </div>
          {feriados.length === 0 ? (
            <p className="mt-3 text-sm text-toga-500">No hay feriados marcados.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {porAnio.map(([anio, dias]) => (
                <div key={anio}>
                  <p className="text-xs font-semibold text-toga-500">
                    {anio} · <span className="cifra">{dias.length}</span> feriados
                  </p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {dias.map((f) => (
                      <li
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-balanza-50 py-0.5 pl-2.5 pr-1 text-xs text-balanza-700"
                      >
                        {format(aFecha(f)!, "d MMM", { locale: es })}
                        <button
                          type="button"
                          onClick={() => setFeriados(feriados.filter((x) => x !== f))}
                          aria-label={`Quitar el feriado del ${format(aFecha(f)!, "d 'de' MMMM 'de' yyyy", { locale: es })}`}
                          className="grid h-4 w-4 place-items-center rounded-full hover:bg-balanza-100"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {campos.holidays && <p className="mt-1 text-sm text-balanza-700">{campos.holidays}</p>}
        </Paso>

        <BotonGuardar />
      </form>

      <section aria-labelledby="calendario" className="min-w-0">
        <h3 id="calendario" className="mb-3 text-sm font-semibold text-toga-900">
          Así queda el calendario
        </h3>
        {periodos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-toga-300 bg-toga-50 px-4 py-6 text-sm text-toga-600">
            El calendario aparece al cerrar las postulaciones, o antes si elige la fecha de inicio
            del lapso en el paso 1.
          </p>
        ) : (
          <CalendarioProceso
            periodos={periodos}
            feriados={feriados}
            lapsoHabiles={habiles}
            hoy={fechaCaracas(new Date())}
          />
        )}
      </section>
    </div>
  );
}
