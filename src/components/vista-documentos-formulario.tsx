"use client";

import { useMemo, useState } from "react";
import { FileStack, FileText } from "lucide-react";
import type { DocumentoExpediente } from "@/contracts";
import { CATEGORIA_ETIQUETA } from "@/contracts";
import { VisorDocumentoRevision } from "@/components/revision-maqueta/visor-documento-revision";
import { AmpliarDocumento } from "@/components/revision-maqueta/ampliar-documento";
import { documentosPorPestana, PESTANAS_VISOR, type PestanaVisorId } from "@/lib/elegibilidad";

type PestanaId = PestanaVisorId | "otros";

/**
 * Misma visualización que el Paso 1 de elegibilidad:
 * pestañas por bloque, el archivo y el formulario que guardó el revisor.
 */
export function VistaDocumentosFormulario({
  documentos,
  anclarVisor = true,
  ampliar = false,
}: {
  readonly documentos: readonly DocumentoExpediente[];
  /** Si false, el visor no se ancla: el panel que lo contiene ya queda fijo. */
  readonly anclarVisor?: boolean;
  /** Muestra un botón para abrir el documento en un modal más alto. */
  readonly ampliar?: boolean;
}) {
  const pestanasConDocs = useMemo(() => {
    const cubiertas = PESTANAS_VISOR.map((p) => ({
      ...p,
      docs: documentosPorPestana(documentos, p.id),
    })).filter((p) => p.docs.length > 0);

    const idsCubiertos = new Set(cubiertas.flatMap((p) => p.docs.map((d) => d.id)));
    const huerfanos = documentos.filter((d) => !idsCubiertos.has(d.id));
    if (huerfanos.length === 0) {
      return cubiertas as readonly {
        readonly id: PestanaId;
        readonly etiqueta: string;
        readonly docs: DocumentoExpediente[];
      }[];
    }

    return [...cubiertas, { id: "otros" as const, etiqueta: "Otros", docs: huerfanos }];
  }, [documentos]);

  const [pestanaActiva, setPestanaActiva] = useState<PestanaId | null>(null);
  const [documentoId, setDocumentoId] = useState<string | null>(null);

  const docsDePestana = useMemo(() => {
    if (!pestanaActiva) return [] as DocumentoExpediente[];
    return pestanasConDocs.find((p) => p.id === pestanaActiva)?.docs ?? [];
  }, [pestanaActiva, pestanasConDocs]);

  const documentoSeleccionado = useMemo(() => {
    if (!documentoId) return null;
    return documentos.find((d) => d.id === documentoId) ?? null;
  }, [documentos, documentoId]);

  const formularioRevision = useMemo(() => {
    if (!documentoSeleccionado?.reviewData) return [] as { clave: string; valor: string }[];
    return Object.entries(documentoSeleccionado.reviewData)
      .filter(([k]) => !k.startsWith("_") && k !== "es_documento" && k !== "calidad_legibilidad")
      .map(([clave, valor]) => ({
        clave,
        valor:
          valor === null || valor === undefined
            ? "—"
            : typeof valor === "boolean"
              ? valor
                ? "Sí"
                : "No"
              : String(valor),
      }))
      .filter((c) => c.valor.trim() !== "");
  }, [documentoSeleccionado]);

  const tituloDocumento = documentoSeleccionado
    ? (CATEGORIA_ETIQUETA[documentoSeleccionado.category] ?? String(documentoSeleccionado.category))
    : "";

  return (
    <section
      aria-label="Visualización y formulario del revisor"
      className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6"
    >
      <div
        role="tablist"
        aria-label="Clasificación de documentos"
        className="-mx-5 -mt-5 mb-4 flex overflow-x-auto border-b border-toga-200 bg-toga-50 sm:-mx-6 sm:-mt-6"
      >
        {pestanasConDocs.length === 0 ? (
          <p className="px-4 py-2.5 text-sm text-toga-500">Sin documentos en el expediente.</p>
        ) : (
          pestanasConDocs.map((p) => (
            <button
              key={p.id}
              role="tab"
              type="button"
              aria-selected={pestanaActiva === p.id}
              onClick={() => {
                setPestanaActiva(p.id);
                setDocumentoId(null);
              }}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                pestanaActiva === p.id
                  ? "border-balanza-600 bg-white text-toga-900"
                  : "border-transparent text-toga-500 hover:text-toga-900"
              }`}
            >
              {p.etiqueta}
              <span className="cifra ml-1.5 text-xs text-toga-400">({p.docs.length})</span>
            </button>
          ))
        )}
      </div>

      {pestanaActiva && docsDePestana.length > 0 && (
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="list"
          aria-label="Documentos de la clasificación"
        >
          {docsDePestana.map((d) => {
            const activo = documentoSeleccionado?.id === d.id;
            const etiqueta =
              d.originalName?.trim() || CATEGORIA_ETIQUETA[d.category] || String(d.category);
            return (
              <button
                key={d.id}
                type="button"
                role="listitem"
                title={etiqueta}
                onClick={() => {
                  setDocumentoId(d.id);
                }}
                className={`inline-flex max-w-[16rem] items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                  activo
                    ? "border-balanza-600 bg-balanza-50 text-toga-900"
                    : "border-toga-200 bg-white text-toga-700 hover:border-toga-300"
                }`}
              >
                <FileText
                  className={`h-3.5 w-3.5 shrink-0 ${activo ? "text-balanza-700" : "text-toga-400"}`}
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate font-medium">{etiqueta}</span>
              </button>
            );
          })}
        </div>
      )}

      {documentoSeleccionado ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-toga-900">Visualización y formulario</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <VisorDocumentoRevision
              key={documentoSeleccionado.id}
              documentId={documentoSeleccionado.id}
              nombreArchivo={documentoSeleccionado.originalName}
              sizeKb={Math.max(1, Math.round(documentoSeleccionado.sizeBytes / 1024))}
              titulo={tituloDocumento}
              anclar={anclarVisor}
              accionEncabezado={
                ampliar ? (
                  <AmpliarDocumento
                    documentId={documentoSeleccionado.id}
                    nombreArchivo={documentoSeleccionado.originalName}
                    sizeKb={Math.max(1, Math.round(documentoSeleccionado.sizeBytes / 1024))}
                    titulo={tituloDocumento}
                  />
                ) : undefined
              }
            />
            <div>
              <h3 className="text-sm font-semibold text-toga-900">Formulario del revisor</h3>
              <p className="mt-1 text-xs text-toga-500">Datos capturados en revisión documental</p>
              {formularioRevision.length === 0 ? (
                <p className="mt-4 text-sm text-toga-500">
                  Este documento no tiene formulario de revisión guardado.
                </p>
              ) : (
                <dl className="mt-4 space-y-3">
                  {formularioRevision.map((c) => (
                    <div key={c.clave}>
                      <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-toga-400">
                        {etiquetaCampoRevision(c.clave)}
                      </dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-sm text-toga-800">
                        {c.valor}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
          <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-toga-700">Ningún documento seleccionado</p>
          <p className="mt-1 max-w-sm text-xs text-toga-500">
            Elija una clasificación y un documento. Se mostrarán el archivo cargado y el formulario
            que llenó el revisor.
          </p>
        </div>
      )}
    </section>
  );
}

function etiquetaCampoRevision(clave: string): string {
  if (clave === "advertencias" || clave === "advertencia") return "Nota";
  return clave.replace(/_/g, " ");
}
