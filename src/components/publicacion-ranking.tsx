"use client";

import { useState, useTransition } from "react";
import type { EntradaRanking } from "@/contracts";
import { PastillaBanda, salaDe } from "@/components/ranking-interno";
import {
  actualizarEnRankingPublico,
  enviarAlRankingPublico,
  type EstadoRanking,
} from "@/app/(panel)/ranking/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";

/**
 * Publicación en el ranking público, en dos grupos.
 *
 * - Enviar uno o varios (sin cola ni segunda aprobación): solo SUPER_ADMIN.
 * - «Actualizar» a un ya publicado con su nota vigente: SUPER_ADMIN siempre;
 *   ADMIN y evaluadores cuando SUPER_ADMIN lo habilitó. La API lo vuelve a comprobar.
 */
export function PublicacionRanking({
  entries,
  puedeEnviar,
  puedeActualizar,
}: {
  readonly entries: readonly EntradaRanking[];
  readonly puedeEnviar: boolean;
  readonly puedeActualizar: boolean;
}) {
  const [pendiente, iniciar] = useTransition();
  const [estado, setEstado] = useState<EstadoRanking>({});
  const [marcados, setMarcados] = useState<readonly string[]>([]);
  const [confirmar, setConfirmar] = useState<readonly EntradaRanking[] | null>(null);
  const [aActualizar, setAActualizar] = useState<EntradaRanking | null>(null);
  useToastDesdeEstado(estado);

  const publicados = entries.filter((e) => e.published === true);
  const sinPublicar = entries.filter((e) => e.published !== true);
  const marcables = sinPublicar.filter((e) => e.candidateId);
  const todosMarcados =
    marcables.length > 0 &&
    marcables.every((e) => e.candidateId && marcados.includes(e.candidateId));

  function alternar(id: string) {
    setConfirmar(null);
    setMarcados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function alternarTodos() {
    setConfirmar(null);
    setMarcados(todosMarcados ? [] : marcables.map((e) => e.candidateId!));
  }

  function pedirEnvio(filas: readonly EntradaRanking[]) {
    const conId = filas.filter((e) => e.candidateId);
    if (conId.length === 0 || pendiente) return;
    setConfirmar(conId);
  }

  function enviar() {
    if (!confirmar || pendiente) return;
    const ids = confirmar.map((e) => e.candidateId!);
    iniciar(async () => {
      const r = await enviarAlRankingPublico(ids);
      setEstado(r);
      if (!r.error) {
        setConfirmar(null);
        setMarcados([]);
      }
    });
  }

  function actualizar() {
    const fila = aActualizar;
    if (!fila?.candidateId || pendiente) return;
    iniciar(async () => {
      const r = await actualizarEnRankingPublico(fila.candidateId!);
      setEstado(r);
      if (!r.error) setAActualizar(null);
    });
  }

  return (
    <div className="space-y-8">
      {puedeEnviar && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-toga-900">Sin publicar</h2>
              <p className="mt-1 text-sm text-toga-500">
                Están en el ranking interno. La ciudadanía todavía no los ve.
              </p>
            </div>
            {marcables.length > 0 && (
              <button
                type="button"
                disabled={pendiente || marcados.length === 0}
                onClick={() =>
                  pedirEnvio(
                    sinPublicar.filter((e) => e.candidateId && marcados.includes(e.candidateId)),
                  )
                }
                className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
              >
                Enviar los marcados al ranking público
              </button>
            )}
          </div>
          {confirmar && (
            <div className="mt-4 space-y-3 rounded-lg border border-balanza-600/25 bg-balanza-50/40 p-4">
              <p className="text-sm text-toga-800">
                ¿Enviar al ranking público a{" "}
                <span className="font-semibold">{confirmar.map((e) => e.fullName).join(", ")}</span>
                ? Quedarán visibles sin otra aprobación.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={enviar}
                  className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
                >
                  {pendiente ? "Enviando…" : "Confirmar envío"}
                </button>
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => setConfirmar(null)}
                  className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          <TablaRanking
            entries={sinPublicar}
            puedePublicar
            seleccionable
            textoAccion="Enviar al ranking público"
            textoAccionCorto="Enviar"
            marcados={marcados}
            todosMarcados={todosMarcados}
            onAlternar={alternar}
            onAlternarTodos={alternarTodos}
            onEnviarUno={(fila) => {
              setAActualizar(null);
              pedirEnvio([fila]);
            }}
            pendiente={pendiente}
            vacio="Nadie del ranking interno está pendiente de publicar."
          />
        </section>
      )}

      <section>
        <h2 className="text-base font-semibold text-toga-900">Ya publicados</h2>
        <p className="mt-1 text-sm text-toga-500">
          Su ficha ya está en el sitio público. Si la nota cambió y el sitio muestra la anterior,
          use «Actualizar».
        </p>
        {aActualizar && (
          <div className="mt-4 space-y-3 rounded-lg border border-balanza-600/25 bg-balanza-50/40 p-4">
            <p className="text-sm text-toga-800">
              ¿Actualizar la ficha pública de{" "}
              <span className="font-semibold">{aActualizar.fullName}</span> con su nota vigente (
              <span className="cifra font-semibold">{aActualizar.total}</span>)? El ranking público
              se vuelve a publicar con todos los publicados.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pendiente}
                onClick={actualizar}
                className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
              >
                {pendiente ? "Actualizando…" : "Confirmar actualización"}
              </button>
              <button
                type="button"
                disabled={pendiente}
                onClick={() => setAActualizar(null)}
                className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        <TablaRanking
          entries={publicados}
          puedePublicar={puedeActualizar}
          seleccionable={false}
          textoAccion="Actualizar en el ranking público"
          textoAccionCorto="Actualizar"
          marcados={[]}
          todosMarcados={false}
          onAlternar={() => undefined}
          onAlternarTodos={() => undefined}
          onEnviarUno={(fila) => {
            setConfirmar(null);
            setAActualizar(fila);
          }}
          pendiente={pendiente}
          vacio="Todavía no hay postulantes publicados."
        />
      </section>
    </div>
  );
}

function TablaRanking({
  entries,
  puedePublicar,
  seleccionable,
  textoAccion,
  textoAccionCorto,
  marcados,
  todosMarcados,
  onAlternar,
  onAlternarTodos,
  onEnviarUno,
  pendiente,
  vacio,
}: {
  readonly entries: readonly EntradaRanking[];
  readonly puedePublicar: boolean;
  /** Muestra las casillas para enviar varios a la vez. */
  readonly seleccionable: boolean;
  readonly textoAccion: string;
  readonly textoAccionCorto: string;
  readonly marcados: readonly string[];
  readonly todosMarcados: boolean;
  readonly onAlternar: (id: string) => void;
  readonly onAlternarTodos: () => void;
  readonly onEnviarUno: (fila: EntradaRanking) => void;
  readonly pendiente: boolean;
  readonly vacio: string;
}) {
  if (entries.length === 0) {
    return <p className="mt-4 text-sm text-toga-500">{vacio}</p>;
  }

  return (
    <>
      <ul className="mt-4 space-y-3 lg:hidden">
        {entries.map((e) => (
          <li key={e.publicId} className="rounded-lg border border-toga-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="cifra text-sm font-semibold text-toga-900">
                {e.position ?? "—"}
                {e.tied && <span className="ml-2 text-xs text-balanza-700">empate</span>}
              </span>
              <span className="cifra text-lg font-semibold text-toga-900">{e.total}</span>
            </div>
            <p className="mt-1.5 font-medium text-toga-900">{e.fullName}</p>
            <p className="mt-0.5 text-sm text-toga-600">{salaDe(e.chamber)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <PastillaBanda band={e.band} />
              {puedePublicar && e.candidateId && (
                <>
                  {seleccionable && (
                    <label className="inline-flex items-center gap-2 text-sm text-toga-700">
                      <input
                        type="checkbox"
                        checked={marcados.includes(e.candidateId)}
                        onChange={() => onAlternar(e.candidateId!)}
                        className="h-4 w-4 accent-balanza-600"
                      />
                      Marcar
                    </label>
                  )}
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() => onEnviarUno(e)}
                    className="rounded-md border border-balanza-600 bg-white px-3 py-1.5 text-sm font-semibold text-balanza-700 hover:bg-balanza-50 disabled:opacity-60"
                  >
                    {textoAccion}
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Ranking interno de postulantes evaluados</caption>
          <thead className="border-b-2 border-toga-300 bg-toga-50">
            <tr>
              {puedePublicar && seleccionable && (
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={todosMarcados}
                    onChange={onAlternarTodos}
                    aria-label="Marcar todos los que no están publicados"
                    className="h-4 w-4 accent-balanza-600"
                  />
                </th>
              )}
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Pos.
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Postulante
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Sala
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-toga-700">
                Puntaje
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Estatus
              </th>
              {puedePublicar && (
                <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                  <span className="sr-only">{textoAccion}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {entries.map((e) => (
              <tr key={e.publicId} className="hover:bg-toga-50">
                {puedePublicar && seleccionable && (
                  <td className="px-4 py-3">
                    {e.candidateId && (
                      <input
                        type="checkbox"
                        checked={marcados.includes(e.candidateId)}
                        onChange={() => onAlternar(e.candidateId!)}
                        aria-label={`Marcar a ${e.fullName}`}
                        className="h-4 w-4 accent-balanza-600"
                      />
                    )}
                  </td>
                )}
                <th scope="row" className="cifra px-4 py-3 text-left font-semibold text-toga-900">
                  {e.position ?? <span className="font-normal text-toga-400">—</span>}
                  {e.tied && (
                    <span className="ml-1.5 text-xs font-medium text-balanza-700">empate</span>
                  )}
                </th>
                <td className="px-4 py-3 font-medium text-toga-900">{e.fullName}</td>
                <td className="px-4 py-3 text-toga-600">{salaDe(e.chamber)}</td>
                <td className="cifra px-4 py-3 text-right font-semibold text-toga-900">
                  {e.total}
                </td>
                <td className="px-4 py-3">
                  <PastillaBanda band={e.band} />
                </td>
                {puedePublicar && (
                  <td className="px-4 py-3 text-right">
                    {e.candidateId && (
                      <button
                        type="button"
                        disabled={pendiente}
                        onClick={() => onEnviarUno(e)}
                        className="rounded-md border border-balanza-600 bg-white px-3 py-1.5 text-sm font-semibold text-balanza-700 hover:bg-balanza-50 disabled:opacity-60"
                        aria-label={`${textoAccion}: ${e.fullName}`}
                      >
                        {textoAccionCorto}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
