"use client";

import { useEffect, useState } from "react";
import type { EvaluacionHistorial } from "@/contracts";

const ESTADO: Record<string, { texto: string; clases: string }> = {
  DRAFT: { texto: "Borrador", clases: "bg-toga-100 text-toga-600 ring-toga-300" },
  SUBMITTED: { texto: "Enviada", clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25" },
  APPROVED: { texto: "Vigente", clases: "bg-validado-50 text-validado-700 ring-validado-700/20" },
  SUPERSEDED: {
    texto: "Reemplazada",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
  },
};

/**
 * Historial de evaluaciones y ajustes de un expediente.
 *
 * Se carga bajo demanda: en la mayoría de visitas al expediente sólo importa
 * la evaluación vigente, y traer todo el historial en cada carga sería pedir
 * datos que casi nadie mira.
 *
 * Es la pantalla donde se ve que un ajuste NO borra el valor anterior: cada
 * uno muestra de cuánto a cuánto, por qué y quién lo pidió.
 */
export function HistorialEvaluaciones({ candidateId }: { readonly candidateId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [historial, setHistorial] = useState<EvaluacionHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto || historial) return;
    void fetch(`/api/historial/${candidateId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: EvaluacionHistorial[]) => setHistorial(d))
      .catch(() => setError("No se pudo cargar el historial."));
  }, [abierto, historial, candidateId]);

  return (
    <section className="rounded-lg border border-toga-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-toga-900">Historial de evaluaciones</h2>
        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          className="text-xs font-medium text-balanza-700 hover:underline"
        >
          {abierto ? "Ocultar" : "Ver historial"}
        </button>
      </div>

      {abierto && (
        <div className="mt-4">
          {error && <p className="text-sm text-balanza-700">{error}</p>}
          {!historial && !error && <p className="text-sm text-toga-500">Cargando…</p>}

          {historial?.length === 0 && (
            <p className="text-sm text-toga-500">Este expediente aún no tiene evaluaciones.</p>
          )}

          <ol className="space-y-4">
            {historial?.map((ev) => {
              const e = ESTADO[ev.status] ?? ESTADO.DRAFT!;
              return (
                <li key={ev.id} className="border-t border-toga-100 pt-4 first:border-0 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="cifra text-lg font-semibold text-toga-900">
                        {Number(ev.totalPoints)}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${e.clases}`}
                      >
                        {e.texto}
                      </span>
                      {ev.ineligible && (
                        <span className="inline-flex rounded-full bg-toga-800 px-2.5 py-1 text-xs font-medium text-toga-100">
                          Inhabilitado
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-toga-500">baremo {ev.rubric.version}</span>
                  </div>

                  <p className="mt-1 text-xs text-toga-500">
                    Evaluó {ev.evaluator?.fullName ?? "—"}
                    {ev.approvedBy && ` · aprobó ${ev.approvedBy.fullName}`}
                    {ev.approvedAt &&
                      ` · ${new Date(ev.approvedAt).toLocaleDateString("es-VE", { dateStyle: "medium" })}`}
                  </p>

                  {ev.ineligibilityReasons.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-toga-600">
                      {ev.ineligibilityReasons.map((m) => (
                        <li key={m}>
                          <span aria-hidden="true" className="mr-1.5">
                            ✕
                          </span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}

                  {ev.adjustments.length > 0 && (
                    <div className="mt-3 rounded-md border border-toga-200 bg-toga-50 p-3">
                      <p className="text-xs font-semibold text-toga-900">
                        {ev.adjustments.length} ajuste(s) — el valor anterior se conserva
                      </p>
                      <ul className="mt-2 space-y-2">
                        {ev.adjustments.map((a) => (
                          <li key={a.id} className="text-xs text-toga-600">
                            <span className="codigo">{a.criterionKey}</span>{" "}
                            <span className="cifra font-semibold text-toga-900">
                              {Number(a.previousValue)} → {Number(a.newValue)}
                            </span>
                            <span className="text-toga-500">
                              {" "}
                              · {a.requestedBy?.fullName ?? "—"}
                            </span>
                            <p className="mt-0.5 leading-relaxed">{a.reason}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
