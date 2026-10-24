"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";
import { VisorDocumentoRevision } from "./visor-documento-revision";

const ALTURA_MODAL = "h-[min(80dvh,52rem)]";

/**
 * Botón «Ampliar» para el encabezado del visor: abre el mismo documento en un
 * modal más alto, para leerlo bien. Lo usan la evaluación y la revisión.
 */
export function AmpliarDocumento({
  documentId,
  nombreArchivo,
  sizeKb,
  titulo,
}: {
  readonly documentId: string;
  readonly nombreArchivo: string;
  readonly sizeKb: number;
  readonly titulo: string;
}) {
  const [abierto, setAbierto] = useState(false);

  // Escape cierra el modal, como el resto de diálogos del panel.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-toga-300 bg-white px-2 py-1 text-xs font-medium text-toga-700 hover:bg-toga-50"
      >
        <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        Ampliar
      </button>
      {abierto &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-toga-900/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-documento-ampliado"
            onClick={() => setAbierto(false)}
          >
            <div
              className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-toga-200 bg-white shadow-lg"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-toga-200 px-4 py-3">
                <h2 id="titulo-documento-ampliado" className="text-sm font-semibold text-toga-900">
                  {titulo}
                </h2>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="rounded-md border border-toga-300 px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50"
                >
                  Cerrar
                </button>
              </div>
              <div className="min-h-0 overflow-auto p-4">
                <VisorDocumentoRevision
                  key={`${documentId}-ampliado`}
                  documentId={documentId}
                  nombreArchivo={nombreArchivo}
                  sizeKb={sizeKb}
                  titulo={titulo}
                  anclar={false}
                  altura={ALTURA_MODAL}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
