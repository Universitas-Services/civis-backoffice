"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronRight, FileText } from "lucide-react";
import {
  BLOQUE_ETIQUETA,
  ordenBloquesRevision,
  type BloqueDocumentoId,
  type DocumentoRevisionMock,
} from "@/lib/maqueta-revision-documental";
import { cn } from "@/lib/utils";

export function SidebarDocsRevision({
  documentos,
  formulariosGuardados,
  activo,
  onSeleccionar,
}: {
  readonly documentos: readonly DocumentoRevisionMock[];
  readonly formulariosGuardados: ReadonlySet<string>;
  readonly activo?: string;
  readonly onSeleccionar: (id: string) => void;
}) {
  const bloques = ordenBloquesRevision();
  const [forzarAbierto, setForzarAbierto] = useState<Set<BloqueDocumentoId>>(
    () => new Set(),
  );
  const [forzarCerrado, setForzarCerrado] = useState<Set<BloqueDocumentoId>>(
    () => new Set(),
  );

  const resumen = bloques
    .map((bloque) => {
      const items = documentos.filter((d) => d.bloque === bloque);
      const hechos = items.filter((d) => formulariosGuardados.has(d.id)).length;
      return {
        bloque,
        items,
        hechos,
        completo: items.length > 0 && hechos === items.length,
      };
    })
    .filter((r) => r.items.length > 0);

  const guardados = documentos.filter((d) => formulariosGuardados.has(d.id)).length;
  const total = documentos.length;

  useEffect(() => {
    setForzarAbierto((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const r of resumen) {
        if (r.completo && next.has(r.bloque)) {
          next.delete(r.bloque);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [formulariosGuardados, documentos]); // eslint-disable-line react-hooks/exhaustive-deps

  function estaAbierto(bloque: BloqueDocumentoId, completo: boolean): boolean {
    if (forzarAbierto.has(bloque)) return true;
    if (forzarCerrado.has(bloque)) return false;
    return !completo;
  }

  function alternarBloque(bloque: BloqueDocumentoId, completo: boolean) {
    const abierto = estaAbierto(bloque, completo);
    if (abierto) {
      setForzarAbierto((prev) => {
        const next = new Set(prev);
        next.delete(bloque);
        return next;
      });
      setForzarCerrado((prev) => new Set(prev).add(bloque));
    } else {
      setForzarCerrado((prev) => {
        const next = new Set(prev);
        next.delete(bloque);
        return next;
      });
      setForzarAbierto((prev) => new Set(prev).add(bloque));
    }
  }

  return (
    <aside className="rounded-lg border border-toga-200 bg-white">
      <div className="border-b border-toga-100 px-4 py-3">
        <p className="text-sm font-semibold text-toga-900">Documentos del expediente</p>
        <p className="mt-1 text-xs text-toga-500">
          <span className="cifra font-medium text-toga-800">{guardados}</span>
          {" / "}
          <span className="cifra">{total}</span> verificados
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-toga-100">
          <div
            className="h-full rounded-full bg-balanza-600 transition-all"
            style={{ width: `${total ? (guardados / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <nav className="space-y-2 p-3" aria-label="Índice de documentos a revisar">
        {resumen.map(({ bloque, items, hechos, completo }) => {
          const abierto = estaAbierto(bloque, completo);
          const panelId = `rev-bloque-${bloque}`;

          return (
            <div
              key={bloque}
              className={cn(
                "rounded-md border",
                completo
                  ? "border-validado-700/25 bg-validado-50/40"
                  : "border-transparent",
              )}
            >
              <button
                type="button"
                onClick={() => alternarBloque(bloque, completo)}
                aria-expanded={abierto}
                aria-controls={panelId}
                className="flex w-full items-start gap-1.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-toga-50"
              >
                {abierto ? (
                  <ChevronDown
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-toga-400"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronRight
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-toga-400"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[0.65rem] font-semibold uppercase tracking-wide",
                      completo ? "text-validado-700" : "text-toga-400",
                    )}
                  >
                    {BLOQUE_ETIQUETA[bloque]}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] text-toga-500">
                    <span className="cifra">
                      {hechos}/{items.length}
                    </span>
                    {completo && (
                      <span className="inline-flex items-center gap-0.5 font-medium text-validado-700">
                        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                        Completo
                      </span>
                    )}
                  </span>
                </span>
              </button>

              {abierto && (
                <ul id={panelId} className="space-y-0.5 px-1 pb-2">
                  {items.map((d) => {
                    const ok = formulariosGuardados.has(d.id);
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => onSeleccionar(d.id)}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                            activo === d.id &&
                              "bg-toga-100 ring-1 ring-inset ring-balanza-600/40",
                            ok
                              ? "text-validado-700 hover:bg-validado-50"
                              : "text-toga-700 hover:bg-toga-50",
                          )}
                        >
                          {ok ? (
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-validado-700"
                              strokeWidth={2.5}
                              aria-hidden="true"
                            />
                          ) : (
                            <FileText
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-toga-500"
                              aria-hidden="true"
                            />
                          )}
                          <span className="min-w-0 flex-1 leading-snug">
                            <span className="block">{d.titulo}</span>
                            <span
                              className={cn(
                                "mt-0.5 inline-block rounded px-1.5 py-0.5 text-[0.6rem] font-medium",
                                ok
                                  ? "bg-validado-50 text-validado-700"
                                  : "bg-amber-50 text-amber-800",
                              )}
                            >
                              {ok ? "Verificado" : "Pendiente"}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
