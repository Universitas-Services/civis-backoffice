"use client";

import { useEffect, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import {
  generarFichaDescalificacion,
  leerFichaDescalificacion,
} from "@/app/(panel)/evaluacion/[candidateId]/acciones";

/**
 * Ficha que redacta la API, mostrada como Markdown.
 * Solo se pide una vez: si ya hay informe, queda la descarga del PDF.
 */
export function InformeFichaDescalificacion({
  candidateId,
  nombre,
  onCerrar,
}: {
  readonly candidateId: string;
  readonly nombre: string;
  readonly onCerrar: () => void;
}) {
  const [informe, setInforme] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pendiente, iniciar] = useTransition();

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError(null);
    void leerFichaDescalificacion(candidateId).then((r) => {
      if (!vivo) return;
      setCargando(false);
      if (!r.ok) {
        setInforme(null);
        setError(r.error ?? "No se pudo cargar la ficha.");
        return;
      }
      setInforme(r.informe);
    });
    return () => {
      vivo = false;
    };
  }, [candidateId]);

  function generar() {
    setError(null);
    iniciar(async () => {
      const r = await generarFichaDescalificacion(candidateId);
      if (!r.ok || !r.informe) {
        setError(r.error ?? "No se pudo generar la ficha.");
        return;
      }
      setInforme(r.informe);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-toga-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-informe-ficha"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-toga-200 bg-white shadow-lg">
        <div className="flex items-start justify-between gap-3 border-b border-toga-100 px-5 py-4">
          <div>
            <h2 id="titulo-informe-ficha" className="text-base font-semibold text-toga-900">
              Informe de descalificación
            </h2>
            <p className="mt-0.5 text-sm text-toga-500">{nombre}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-toga-300 px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50"
          >
            Cerrar
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? <p className="mb-3 whitespace-pre-wrap text-sm text-toga-800">{error}</p> : null}
          {cargando ? (
            <p className="text-sm text-toga-500">Cargando ficha…</p>
          ) : informe ? (
            <article className="text-justify text-sm leading-relaxed text-toga-800 [&_h1]:mb-3 [&_h1]:text-left [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-left [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-left [&_h3]:text-sm [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
              <ReactMarkdown>{informe}</ReactMarkdown>
            </article>
          ) : error ? null : (
            <p className="text-sm text-toga-600">
              Todavía no hay informe. Generarlo pide la redacción a la API a partir del dictamen ya
              guardado.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-toga-100 px-5 py-4">
          {informe ? null : (
            <button
              type="button"
              disabled={cargando || pendiente}
              onClick={generar}
              className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {pendiente ? "Generando…" : "Generar informe"}
            </button>
          )}
          {informe ? (
            <a
              href={`/api/ficha-descalificacion/${candidateId}`}
              className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Descargar PDF
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
