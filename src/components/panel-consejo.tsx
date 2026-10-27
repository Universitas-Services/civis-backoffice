"use client";

import { useState, useTransition } from "react";
import type { AjustesPortal, UsuarioDirectorio } from "@/contracts";
import { cambiarActivoComite } from "@/app/(panel)/usuarios/acciones";
import { useToast } from "@/components/toast-provider";

const MOTIVO_MINIMO = 5;

/**
 * Pestaña «Consejo»: puestos ocupados, miembros actuales y alta guiada.
 * La API valida el tope y el motivo; aquí solo se anticipa para orientar.
 */
export function PanelConsejo({
  directorio,
  ajustes,
  onIrAUsuarios,
}: {
  readonly directorio: readonly UsuarioDirectorio[];
  readonly ajustes: AjustesPortal;
  readonly onIrAUsuarios: () => void;
}) {
  const evaluadores = directorio.filter((u) => u.roles.includes("EVALUATOR"));
  const miembros = evaluadores.filter((u) => u.committeeActive);
  const disponibles = evaluadores.filter((u) => !u.committeeActive && u.status === "ACTIVE");
  const tope = ajustes.maxActiveEvaluators;
  const ocupados = miembros.length;
  const hayCupo = ocupados < tope;
  const modoComite = ajustes.evaluationMode === "COMMITTEE";
  const [agregando, setAgregando] = useState(false);

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="puestos-consejo"
        className="rounded-lg border border-toga-200 bg-white p-5"
      >
        <h2 id="puestos-consejo" className="text-base font-semibold text-toga-900">
          Puestos del Consejo
        </h2>
        <p className="mt-1 text-sm text-toga-600">
          Solo los evaluadores del Consejo pueden evaluar
          {modoComite ? " y votar en las rondas" : ""}. El tope se cambia en «Modalidad de
          evaluación».
        </p>
        <p className="mt-4 text-sm text-toga-800">
          <span className="cifra text-2xl font-semibold text-toga-900">{ocupados}</span> de{" "}
          <span className="cifra font-semibold">{tope}</span> puestos ocupados
        </p>
        <div
          role="meter"
          aria-label="Puestos ocupados del Consejo"
          aria-valuemin={0}
          aria-valuemax={tope}
          aria-valuenow={ocupados}
          className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-toga-100"
        >
          <div
            className="h-full rounded-full bg-balanza-600"
            style={{ width: `${Math.min(100, (ocupados / Math.max(tope, 1)) * 100)}%` }}
          />
        </div>
        {modoComite && (
          <p className="mt-3 text-sm text-toga-600">
            Modalidad Consejo · quorum{" "}
            <span className="cifra font-medium text-toga-800">{ajustes.quorumThreshold}</span>{" "}
            actuaciones para decidir por mayoría.
            {ocupados < ajustes.quorumThreshold && (
              <span className="mt-1 block font-medium text-balanza-800">
                Con {ocupados} miembro{ocupados === 1 ? "" : "s"} no se alcanza el quorum: las
                rondas no podrán decidirse.
              </span>
            )}
          </p>
        )}
      </section>

      <section aria-labelledby="miembros-consejo">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="miembros-consejo" className="text-base font-semibold text-toga-900">
            Miembros actuales
          </h2>
          {!agregando && evaluadores.length > 0 && (
            <button
              type="button"
              disabled={!hayCupo || disponibles.length === 0}
              onClick={() => setAgregando(true)}
              className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-50"
            >
              Agregar al Consejo
            </button>
          )}
        </div>

        {evaluadores.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-toga-300 bg-white p-5 text-sm text-toga-600">
            <p>
              Todavía no hay cuentas con rol Evaluador. Para formar el Consejo, primero cree o
              asigne ese rol a una cuenta.
            </p>
            <button
              type="button"
              onClick={onIrAUsuarios}
              className="mt-2 font-semibold text-balanza-700 underline underline-offset-2 hover:text-balanza-800"
            >
              Ir a la pestaña Usuarios
            </button>
          </div>
        ) : (
          <>
            {!hayCupo && (
              <p className="mt-3 rounded-md border border-balanza-600/30 bg-balanza-50 p-3 text-sm text-balanza-800">
                Los {tope} puestos están ocupados. Para agregar a alguien, saque antes a un miembro
                o suba el tope en «Modalidad de evaluación» (máximo 7).
              </p>
            )}
            {hayCupo && disponibles.length === 0 && (
              <p className="mt-3 text-sm text-toga-600">
                No hay evaluadores activos fuera del Consejo. Las cuentas suspendidas no pueden
                incorporarse; para sumar a alguien nuevo, asígnele el rol Evaluador en{" "}
                <button
                  type="button"
                  onClick={onIrAUsuarios}
                  className="font-semibold text-balanza-700 underline underline-offset-2 hover:text-balanza-800"
                >
                  Usuarios
                </button>
                .
              </p>
            )}

            {agregando && hayCupo && disponibles.length > 0 && (
              <AgregarAlConsejo
                disponibles={disponibles}
                puestoNumero={ocupados + 1}
                tope={tope}
                onCerrar={() => setAgregando(false)}
              />
            )}

            {miembros.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-toga-300 bg-white p-5 text-sm text-toga-600">
                El Consejo está vacío: nadie puede evaluar hasta que agregue al menos un evaluador.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-toga-100 rounded-lg border border-toga-200 bg-white">
                {miembros.map((u) => (
                  <MiembroConsejo key={u.id} usuario={u} />
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function MiembroConsejo({ usuario }: { readonly usuario: UsuarioDirectorio }) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-toga-900">
            {usuario.fullName}
            {usuario.status === "SUSPENDED" && (
              <span className="ml-2 rounded bg-toga-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-toga-600">
                cuenta suspendida
              </span>
            )}
          </p>
          <p className="break-all text-xs text-toga-500">{usuario.email}</p>
        </div>
        {!confirmando && (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="rounded-md border border-toga-300 px-3 py-1.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
          >
            Sacar del Consejo
          </button>
        )}
      </div>
      {confirmando && (
        <ConfirmarCambio
          id={usuario.id}
          incluir={false}
          titulo={`¿Sacar a ${usuario.fullName} del Consejo? Dejará de poder evaluar y votar.`}
          textoConfirmar={`Sacar a ${usuario.fullName}`}
          onCerrar={() => setConfirmando(false)}
        />
      )}
    </li>
  );
}

function AgregarAlConsejo({
  disponibles,
  puestoNumero,
  tope,
  onCerrar,
}: {
  readonly disponibles: readonly UsuarioDirectorio[];
  readonly puestoNumero: number;
  readonly tope: number;
  readonly onCerrar: () => void;
}) {
  const [elegidoId, setElegidoId] = useState<string | null>(null);
  const elegido = disponibles.find((u) => u.id === elegidoId);

  return (
    <div className="mt-3 rounded-lg border border-balanza-600/30 bg-white p-4">
      <fieldset>
        <legend className="text-sm font-semibold text-toga-900">
          Elija al evaluador que ocupará el puesto{" "}
          <span className="cifra">
            {puestoNumero} de {tope}
          </span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {disponibles.map((u) => (
            <label
              key={u.id}
              className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${
                elegidoId === u.id
                  ? "border-balanza-600 bg-balanza-50"
                  : "border-toga-200 hover:bg-toga-50"
              }`}
            >
              <input
                type="radio"
                name="evaluador-consejo"
                value={u.id}
                checked={elegidoId === u.id}
                onChange={() => setElegidoId(u.id)}
                className="mt-1 accent-balanza-600"
              />
              <span className="min-w-0">
                <span className="block font-medium text-toga-900">{u.fullName}</span>
                <span className="block break-all text-xs text-toga-500">{u.email}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {elegido ? (
        <ConfirmarCambio
          key={elegido.id}
          id={elegido.id}
          incluir
          titulo={`¿Agregar a ${elegido.fullName} al Consejo? Podrá evaluar y votar desde ahora.`}
          textoConfirmar={`Agregar a ${elegido.fullName}`}
          onCerrar={onCerrar}
        />
      ) : (
        <div className="mt-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-toga-300 px-3 py-1.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmarCambio({
  id,
  incluir,
  titulo,
  textoConfirmar,
  onCerrar,
}: {
  readonly id: string;
  readonly incluir: boolean;
  readonly titulo: string;
  readonly textoConfirmar: string;
  readonly onCerrar: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [pendiente, iniciar] = useTransition();
  const toast = useToast();
  const motivoValido = motivo.trim().length >= MOTIVO_MINIMO;
  const idMotivo = `motivo-consejo-${id}`;

  return (
    <div className="mt-3 rounded-md border border-toga-300 bg-toga-50 p-3">
      <p className="text-sm font-medium text-toga-900">{titulo}</p>
      <label htmlFor={idMotivo} className="mt-2 block text-sm text-toga-800">
        Motivo (obligatorio, mínimo {MOTIVO_MINIMO} caracteres)
      </label>
      <textarea
        id={idMotivo}
        rows={2}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pendiente || !motivoValido}
          onClick={() =>
            iniciar(async () => {
              const r = await cambiarActivoComite(id, incluir, motivo);
              if (r.ok) {
                toast.exito(incluir ? "Incluido en el Consejo." : "Fuera del Consejo.");
                onCerrar();
              } else {
                toast.error(r.error ?? "No se pudo cambiar el Consejo");
              }
            })
          }
          className="rounded-md bg-balanza-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : textoConfirmar}
        </button>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-md border border-toga-300 px-3 py-1.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
