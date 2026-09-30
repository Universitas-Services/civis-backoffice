"use client";

import { useActionState, useState, useTransition } from "react";
import type { AjustesPortal, EvaluationMode } from "@/contracts";
import {
  cambiarActivoComite,
  guardarAjustesComite,
  type EstadoUsuarios,
} from "@/app/(panel)/usuarios/acciones";
import { useToast } from "@/components/toast-provider";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";

export function ConfiguracionEvaluacion({
  ajustes,
  esSuperAdmin,
}: {
  readonly ajustes: AjustesPortal;
  readonly esSuperAdmin: boolean;
}) {
  const [modo, setModo] = useState<EvaluationMode>(ajustes.evaluationMode);
  const [estado, accion] = useActionState(
    async (_prev: EstadoUsuarios, fd: FormData) => guardarAjustesComite(fd),
    {},
  );
  useToastDesdeEstado(estado);

  const esComite = modo === "COMMITTEE";

  return (
    <section
      aria-labelledby="config-evaluacion"
      className="rounded-lg border border-toga-200 bg-white p-5"
    >
      <h2 id="config-evaluacion" className="text-base font-semibold text-toga-900">
        Modalidad de evaluación
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-toga-600">
        Solo los evaluadores activos en comité (tope máximo 7) pueden evaluar, en individual o
        en comité. En comité, el quorum es el mínimo de actuaciones (voto o recusación) para
        decidir por mayoría. Cambiar de modalidad exige que no haya rondas abiertas (SUPER_ADMIN
        puede forzar el cierre si aún no hay quorum).
      </p>

      <form action={accion} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2 sm:max-w-sm">
          <span className="font-medium text-toga-800">Modalidad</span>
          <select
            name="evaluationMode"
            value={modo}
            disabled={!esSuperAdmin}
            onChange={(e) => setModo(e.target.value as EvaluationMode)}
            className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm disabled:bg-toga-50"
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMMITTEE">Comité</option>
          </select>
          {!esSuperAdmin && (
            <span className="mt-1 block text-xs text-toga-500">
              Sólo SUPER_ADMIN cambia la modalidad.
            </span>
          )}
        </label>

        <label className="block text-sm">
          <span className="font-medium text-toga-800">Tope de evaluadores activos</span>
          <input
            type="number"
            name="maxActiveEvaluators"
            min={1}
            max={7}
            defaultValue={ajustes.maxActiveEvaluators}
            className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-toga-500">
            Máximo 7. Solo esos evaluadores pueden evaluar (individual o comité).
          </span>
        </label>

        {esComite && (
          <>
            <label className="block text-sm">
              <span className="font-medium text-toga-800">Quorum (Q)</span>
              <input
                type="number"
                name="quorumThreshold"
                min={1}
                max={7}
                defaultValue={ajustes.quorumThreshold}
                className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-xs text-toga-500">
                Actuaciones mínimas (voto elegible/inelegible o recusación) para poder decidir por
                mayoría. No puede superar el tope.
              </span>
            </label>

            <label className="block text-sm sm:col-span-2 sm:max-w-sm">
              <span className="font-medium text-toga-800">Plazo de ronda (días)</span>
              <input
                type="number"
                name="roundDeadlineDays"
                min={1}
                max={90}
                defaultValue={ajustes.roundDeadlineDays}
                className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
              />
            </label>
          </>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Guardar ajustes
          </button>
        </div>
      </form>
    </section>
  );
}

/** Incluye o saca a un EVALUATOR del comité activo. */
export function InterruptorComite({
  id,
  nombre,
  enComite,
  esEvaluador,
  cuentaActiva,
}: {
  readonly id: string;
  readonly nombre: string;
  readonly enComite: boolean;
  readonly esEvaluador: boolean;
  readonly cuentaActiva: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pendiente, iniciar] = useTransition();
  const toast = useToast();

  if (!esEvaluador) {
    return <span className="text-xs text-toga-400">—</span>;
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        disabled={!cuentaActiva && !enComite}
        onClick={() => setConfirmando(true)}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset disabled:opacity-50 ${
          enComite
            ? "bg-balanza-50 text-balanza-800 ring-balanza-600/20"
            : "bg-toga-100 text-toga-500 ring-toga-300"
        }`}
      >
        {enComite ? "En comité" : "Fuera del comité"}
      </button>
    );
  }

  return (
    <div className="mx-auto min-w-[16rem] rounded-md border border-toga-300 bg-white p-3 text-left">
      <p className="text-xs font-medium text-toga-900">
        {enComite ? `Sacar a ${nombre} del comité` : `Incluir a ${nombre} en el comité`}
      </p>
      <textarea
        rows={2}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo (obligatorio)"
        className="mt-2 w-full rounded-md border border-toga-300 px-2 py-1.5 text-xs"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            iniciar(async () => {
              const r = await cambiarActivoComite(id, !enComite, motivo);
              if (r.ok) {
                setConfirmando(false);
                toast.exito(enComite ? "Fuera del comité." : "Incluido en el comité.");
              } else {
                toast.error(r.error ?? "No se pudo cambiar");
              }
            })
          }
          className="rounded-md bg-balanza-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
        >
          {pendiente ? "…" : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
