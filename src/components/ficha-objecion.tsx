"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import type { ObjecionBandeja } from "@/contracts";
import {
  asignarObjecion,
  resolverObjecion,
  solicitarInformacion,
  type Resultado,
} from "@/app/(panel)/objeciones/acciones";
import { InsigniaObjecion } from "./insignias";

const CRITERIOS_AJUSTABLES = [
  { key: "ACADEMIC_DOCTORATE", label: "Doctorado" },
  { key: "ACADEMIC_MASTER", label: "Maestría" },
  { key: "ACADEMIC_SPECIALIZATION", label: "Especialización" },
  { key: "TEACHING_TENURED", label: "Docencia por concurso (años)" },
  { key: "TEACHING_CONTRACTED", label: "Docencia contratada (años)" },
  { key: "RESEARCH_BOOK", label: "Libros con ISBN" },
  { key: "RESEARCH_ARTICLE", label: "Artículos indexados" },
  { key: "EXPERIENCE_MINIMUM_YEARS", label: "Años de ejercicio" },
  { key: "EXPERIENCE_ADDITIONAL_YEARS", label: "Años adicionales" },
  { key: "INCOMPAT_PARTY_MILITANCY", label: "Militancia partidista (1 = comprobada)" },
  { key: "INCOMPAT_KINSHIP", label: "Parentesco (1 = comprobado)" },
  { key: "INCOMPAT_STATE_CONTRACTS", label: "Contratos con el Estado (1 = comprobado)" },
  { key: "INCOMPAT_FIRM_SANCTION", label: "Sanción firme (1 = comprobada)" },
] as const;

const RESUELTAS = ["RESOLVED_FOUNDED", "RESOLVED_UNFOUNDED", "REJECTED_INADMISSIBLE"];

export function FichaObjecion({
  objecion,
  causa,
  sala,
  usuarioId,
}: {
  readonly objecion: ObjecionBandeja;
  readonly causa: string;
  readonly sala: string;
  readonly usuarioId: string;
}) {
  const [abierta, setAbierta] = useState(false);
  const [pidiendoInfo, setPidiendoInfo] = useState(false);
  const [conAjuste, setConAjuste] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const [mensajeAsignar, setMensajeAsignar] = useState<string | null>(null);
  const [estado, accion] = useActionState<Resultado, FormData>(
    resolverObjecion.bind(null, objecion.id),
    { ok: false },
  );
  const [info, accionInfo] = useActionState<Resultado, FormData>(
    solicitarInformacion.bind(null, objecion.id),
    { ok: false },
  );

  const resuelta = RESUELTAS.includes(objecion.status);
  const asignada = Boolean(objecion.assignedTo);

  return (
    <article className="rounded-lg border border-toga-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {/* El código lleva al expediente completo de la objeción: los hechos
              denunciados y la identidad del objetante no caben —ni deben caber—
              en la bandeja. */}
          <Link
            href={`/objeciones/${objecion.id}`}
            className="codigo text-xs font-medium text-balanza-700 hover:underline"
          >
            {objecion.trackingCode} →
          </Link>
          <h2 className="mt-1 font-medium text-toga-900">
            <Link href={`/expedientes/${objecion.candidate.id}`} className="hover:underline">
              {objecion.candidate.firstName} {objecion.candidate.lastName}
            </Link>
          </h2>
          <p className="mt-0.5 text-xs text-toga-500">
            {sala} · {causa} ·{" "}
            {new Date(objecion.receivedAt).toLocaleDateString("es-VE", { dateStyle: "medium" })}
          </p>
        </div>
        <InsigniaObjecion estado={objecion.status} />
      </div>

      <p className="mt-3 text-xs text-toga-500">
        {objecion.assignedTo ? `Asignada a ${objecion.assignedTo.fullName}` : "Sin asignar"}
        {objecion._count.adjustments > 0 &&
          ` · ${objecion._count.adjustments} ajuste(s) aplicado(s)`}
        {objecion.affectsCredential && ` · afecta a ${objecion.affectsCredential}`}
      </p>

      {info.exito && (
        <p
          role="status"
          className="mt-3 rounded-md border border-validado-700/20 bg-validado-50 px-4 py-3 text-sm text-validado-700"
        >
          {info.exito}
        </p>
      )}
      {info.error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {info.error}
        </p>
      )}

      {estado.exito && (
        <p
          role="status"
          className="mt-3 rounded-md border border-validado-700/20 bg-validado-50 px-4 py-3 text-sm text-validado-700"
        >
          {estado.exito}
        </p>
      )}
      {(estado.error ?? mensajeAsignar) && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {estado.error ?? mensajeAsignar}
        </p>
      )}

      {!resuelta && !estado.exito && !info.exito && (
        <div className="mt-4 border-t border-toga-100 pt-4">
          {!asignada ? (
            <button
              type="button"
              disabled={pendiente}
              onClick={() =>
                iniciar(async () => {
                  const r = await asignarObjecion(objecion.id, usuarioId);
                  if (!r.ok) setMensajeAsignar(r.error ?? "No se pudo asignar");
                })
              }
              className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800 disabled:opacity-60"
            >
              {pendiente ? "Asignando…" : "Asignármela y revisar"}
            </button>
          ) : !abierta && !pidiendoInfo ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAbierta(true)}
                className="rounded-md border border-toga-300 px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
              >
                Resolver objeción
              </button>
              <button
                type="button"
                onClick={() => setPidiendoInfo(true)}
                className="rounded-md border border-toga-300 px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
              >
                Solicitar información
              </button>
            </div>
          ) : pidiendoInfo ? (
            /* Falta información: no se cierra como infundada ni se deja
               envejecer sin que nadie sepa por qué está parada. */
            <form action={accionInfo} className="space-y-3">
              <div>
                <label
                  htmlFor={`i-${objecion.id}`}
                  className="block text-xs font-medium text-toga-600"
                >
                  ¿Qué información falta? <span className="text-balanza-700">*</span>
                </label>
                <textarea
                  id={`i-${objecion.id}`}
                  name="reason"
                  rows={3}
                  required
                  minLength={15}
                  placeholder="Qué prueba o aclaración se le pide al objetante."
                  className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
                >
                  Registrar solicitud
                </button>
                <button
                  type="button"
                  onClick={() => setPidiendoInfo(false)}
                  className="rounded-md border border-toga-300 px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <form action={accion} className="space-y-4">
              <fieldset>
                <legend className="text-xs font-medium text-toga-600">Resolución</legend>
                <div className="mt-2 space-y-2">
                  {[
                    ["RESOLVED_FOUNDED", "Fundada — los hechos alegados se comprobaron"],
                    ["RESOLVED_UNFOUNDED", "Infundada — se revisó y no procede"],
                    ["REJECTED_INADMISSIBLE", "Inadmisible — no cumple los requisitos formales"],
                  ].map(([valor, texto]) => (
                    <label
                      key={valor}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-toga-200 p-3 hover:bg-toga-50"
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value={valor}
                        required
                        className="mt-0.5"
                        onChange={() => {
                          if (valor !== "RESOLVED_FOUNDED") setConAjuste(false);
                        }}
                      />
                      <span className="text-sm text-toga-900">{texto}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor={`r-${objecion.id}`}
                  className="block text-xs font-medium text-toga-600"
                >
                  Motivación de la resolución <span className="text-balanza-700">*</span>
                </label>
                <textarea
                  id={`r-${objecion.id}`}
                  name="reason"
                  rows={3}
                  required
                  minLength={20}
                  placeholder="Qué verificó, contra qué documento, y por qué concluye lo que concluye."
                  className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="rounded-md border border-toga-200 bg-toga-50 p-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={conAjuste}
                    onChange={(e) => setConAjuste(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-toga-900">
                    Proponer un ajuste de puntaje
                    <span className="mt-0.5 block text-xs leading-relaxed text-toga-500">
                      Sólo procede si la objeción se declara <strong>fundada</strong>. El valor
                      anterior se conserva en el historial: no se sobrescribe nada.
                    </span>
                  </span>
                </label>

                {conAjuste && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`c-${objecion.id}`}
                        className="block text-xs font-medium text-toga-600"
                      >
                        Criterio afectado
                      </label>
                      <select
                        id={`c-${objecion.id}`}
                        name="criterionKey"
                        defaultValue=""
                        className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="" disabled>
                          Seleccione…
                        </option>
                        {CRITERIOS_AJUSTABLES.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={`v-${objecion.id}`}
                        className="block text-xs font-medium text-toga-600"
                      >
                        Nuevo valor
                      </label>
                      <input
                        id={`v-${objecion.id}`}
                        name="newValue"
                        type="number"
                        min={0}
                        className="cifra mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
                >
                  Registrar resolución
                </button>
                <button
                  type="button"
                  onClick={() => setAbierta(false)}
                  className="rounded-md border border-toga-300 px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
