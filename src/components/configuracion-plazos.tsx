"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { AjustesPortal } from "@/contracts";
import { guardarPlazos, type EstadoPlazos } from "@/app/(panel)/configuracion/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";
import { fechaCaracas, periodosProceso } from "@/lib/calendario-proceso";
import { CalendarioProceso } from "@/components/calendario-proceso";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar configuración"}
    </button>
  );
}

const ENTRADA =
  "mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-base text-toga-900 focus:border-balanza-600";

function CampoDias({
  nombre,
  etiqueta,
  ayuda,
  valor,
  onCambio,
  error,
}: {
  readonly nombre: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly valor: number;
  readonly onCambio: (n: number) => void;
  readonly error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-toga-800">{etiqueta}</span>
      <input
        type="number"
        name={nombre}
        min={1}
        max={60}
        required
        value={valor}
        onChange={(e) => onCambio(Number(e.target.value))}
        aria-invalid={error ? true : undefined}
        className={`${ENTRADA} cifra`}
      />
      <span className="mt-1 block text-xs text-toga-500">{ayuda}</span>
      {error && <span className="mt-1 block text-sm text-balanza-700">{error}</span>}
    </label>
  );
}

/**
 * Plazos del proceso con vista previa del calendario: cada cambio recalcula
 * los periodos antes de guardar. Alargar un periodo por un inconveniente es
 * cambiar su número de días y guardar.
 */
export function ConfiguracionPlazos({ ajustes }: { readonly ajustes: AjustesPortal }) {
  const [estado, accion] = useActionState<EstadoPlazos, FormData>(guardarPlazos, {});
  useToastDesdeEstado(estado);

  const [inicio, setInicio] = useState(
    ajustes.objectionPeriodStart ? fechaCaracas(new Date(ajustes.objectionPeriodStart)) : "",
  );
  const [lapsoDias, setLapsoDias] = useState(ajustes.objectionPeriodDays);
  const [habiles, setHabiles] = useState(ajustes.objectionBusinessDays);
  const [admision, setAdmision] = useState(ajustes.admissionDays);
  const [descargo, setDescargo] = useState(ajustes.descargoDays);
  const [comprobacion, setComprobacion] = useState(ajustes.verificationDays);
  const [feriados, setFeriados] = useState(ajustes.holidays.join("\n"));

  const listaFeriados = useMemo(
    () => feriados.split(/[\s,;]+/).filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f)),
    [feriados],
  );
  const periodos = useMemo(
    () =>
      periodosProceso({
        applicationsClosedAt: ajustes.applicationsClosedAt,
        inicio: inicio || null,
        objectionPeriodDays: lapsoDias || 1,
        objectionBusinessDays: habiles,
        admissionDays: admision || 1,
        descargoDays: descargo || 1,
        verificationDays: comprobacion || 1,
        holidays: listaFeriados,
      }),
    [
      ajustes.applicationsClosedAt,
      inicio,
      lapsoDias,
      habiles,
      admision,
      descargo,
      comprobacion,
      listaFeriados,
    ],
  );
  const campos = estado.campos ?? {};

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form
        action={accion}
        className="space-y-4 rounded-lg border border-toga-200 bg-white p-4 sm:p-5"
      >
        <label className="block">
          <span className="text-sm font-medium text-toga-800">Inicio del lapso de objeciones</span>
          <input
            type="date"
            name="objectionPeriodStart"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className={ENTRADA}
          />
          <span className="mt-1 block text-xs text-toga-500">
            Publicación de la nómina. Vacío: el día hábil siguiente al cierre de postulaciones.
          </span>
          {campos.objectionPeriodStart && (
            <span className="mt-1 block text-sm text-balanza-700">
              {campos.objectionPeriodStart}
            </span>
          )}
        </label>

        <CampoDias
          nombre="objectionPeriodDays"
          etiqueta="Lapso de objeciones (días)"
          ayuda="Ley: 15 días (art. 71 LOTSJ)."
          valor={lapsoDias}
          onCambio={setLapsoDias}
          error={campos.objectionPeriodDays}
        />
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            name="objectionBusinessDays"
            checked={habiles}
            onChange={(e) => setHabiles(e.target.checked)}
            className="mt-1 h-4 w-4 accent-balanza-600"
          />
          <span className="text-sm text-toga-800">
            Contar el lapso en días hábiles
            <span className="block text-xs text-toga-500">
              Sin marcar, cuenta días continuos como dice el art. 71.
            </span>
          </span>
        </label>
        <CampoDias
          nombre="admissionDays"
          etiqueta="Admisión del comité (días continuos)"
          ayuda="Ley: 8 días."
          valor={admision}
          onCambio={setAdmision}
          error={campos.admissionDays}
        />
        <CampoDias
          nombre="descargoDays"
          etiqueta="Descargo del postulante (días continuos)"
          ayuda="Ley: 3 días desde la notificación. Aplica a las objeciones que se admitan desde ahora."
          valor={descargo}
          onCambio={setDescargo}
          error={campos.descargoDays}
        />
        <CampoDias
          nombre="verificationDays"
          etiqueta="Comprobación (días continuos)"
          ayuda="Ley: hasta 5 días (art. 72 LOTSJ)."
          valor={comprobacion}
          onCambio={setComprobacion}
          error={campos.verificationDays}
        />
        <label className="block">
          <span className="text-sm font-medium text-toga-800">Feriados</span>
          <textarea
            name="holidays"
            rows={5}
            value={feriados}
            onChange={(e) => setFeriados(e.target.value)}
            className={`${ENTRADA} codigo text-sm`}
          />
          <span className="mt-1 block text-xs text-toga-500">
            Una fecha por línea (AAAA-MM-DD). Sólo cuentan para el lapso en días hábiles.
          </span>
          {campos.holidays && (
            <span className="mt-1 block text-sm text-balanza-700">{campos.holidays}</span>
          )}
        </label>
        <BotonGuardar />
      </form>

      <section aria-labelledby="calendario" className="min-w-0">
        <h3 id="calendario" className="sr-only">
          Calendario
        </h3>
        {periodos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-toga-300 bg-toga-50 px-4 py-6 text-sm text-toga-600">
            El calendario se calcula al cerrar las postulaciones, o antes si fija el inicio del
            lapso de objeciones.
          </p>
        ) : (
          <CalendarioProceso
            periodos={periodos}
            feriados={listaFeriados}
            lapsoHabiles={habiles}
            hoy={fechaCaracas(new Date())}
          />
        )}
      </section>
    </div>
  );
}
