"use client";

import { useMemo, useState } from "react";
import type { DocumentoExpediente } from "@/contracts";
import {
  documentosPorPestana,
  PESTANAS_VISOR,
  type PestanaVisorId,
} from "@/lib/elegibilidad";
import { VisorPdf } from "@/components/visor-pdf";

/**
 * Visor documental con pestañas por bloque de elegibilidad.
 * Dentro de cada bloque reutiliza VisorPdf para los documentos de ese grupo.
 */
export function VisorDocumentosPorBloque({
  documentos,
}: {
  readonly documentos: readonly DocumentoExpediente[];
}) {
  const pestanasConDocs = useMemo(() => {
    return PESTANAS_VISOR.map((p) => ({
      ...p,
      docs: documentosPorPestana(documentos, p.id),
    })).filter((p) => p.docs.length > 0);
  }, [documentos]);

  const huérfanos = useMemo(() => {
    const cubiertos = new Set(
      pestanasConDocs.flatMap((p) => p.docs.map((d) => d.id)),
    );
    return documentos.filter((d) => !cubiertos.has(d.id));
  }, [documentos, pestanasConDocs]);

  const todas =
    huérfanos.length > 0
      ? [
          ...pestanasConDocs,
          {
            id: "otros" as PestanaVisorId | "otros",
            etiqueta: "Otros",
            categorias: [] as const,
            docs: huérfanos,
          },
        ]
      : pestanasConDocs;

  const [activo, setActivo] = useState(0);
  const actual = todas[activo] ?? todas[0];

  if (documentos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-toga-100 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-toga-700">Sin documentos</p>
          <p className="mt-1.5 text-sm text-toga-500">
            Este expediente no tiene documentos cargados.
          </p>
        </div>
      </div>
    );
  }

  if (todas.length === 0) {
    return <VisorPdf documentos={documentos} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        role="tablist"
        aria-label="Bloques documentales"
        className="flex shrink-0 overflow-x-auto border-b border-toga-200 bg-toga-50"
      >
        {todas.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={i === activo}
            onClick={() => setActivo(i)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              i === activo
                ? "border-balanza-600 bg-white text-toga-900"
                : "border-transparent text-toga-500 hover:text-toga-900"
            }`}
          >
            {p.etiqueta}
            <span className="cifra ml-1.5 text-xs text-toga-400">({p.docs.length})</span>
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {actual && <VisorPdf key={String(actual.id)} documentos={actual.docs} />}
      </div>
    </div>
  );
}
