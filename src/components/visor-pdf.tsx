"use client";

import { useEffect, useState } from "react";
import type { DocumentoExpediente } from "@/contracts";
import { CATEGORIA_ETIQUETA } from "@/contracts";
import { InsigniaAnalisis, InsigniaClasificacion } from "./insignias";

/**
 * Visor documental con pestañas.
 *
 * Carga el PDF vía fetch + blob URL (misma técnica que revisión) para evitar
 * el iframe directo a /api/... que el navegador rechaza con «conexión rechazada».
 */
export function VisorPdf({
  documentos,
  ocultarPestanas = false,
}: {
  readonly documentos: readonly DocumentoExpediente[];
  /** Si true, no muestra la barra de pestañas (navegación externa). */
  readonly ocultarPestanas?: boolean;
}) {
  const [activo, setActivo] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentos.length === 0) return;
    let cancelado = false;
    let objectUrl: string | null = null;
    const indice = Math.min(activo, documentos.length - 1);
    const documentId = documentos[indice]!.id;

    async function cargar() {
      setCargando(true);
      setError(null);
      setUrl(null);
      try {
        const respuesta = await fetch(`/api/documentos/contenido/${documentId}`, {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (cancelado) return;
        if (respuesta.status === 401) {
          setError("Sesión expirada. Vuelva a iniciar sesión para ver el documento.");
          return;
        }
        if (!respuesta.ok) {
          setError("No se pudo cargar el documento.");
          return;
        }
        const blob = await respuesta.blob();
        if (cancelado) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelado) setError("No se pudo cargar el documento (red o API).");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    void cargar();

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activo, documentos]);

  if (documentos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-toga-100 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-toga-700">Sin documentos</p>
          <p className="mt-1.5 text-sm text-toga-500">
            Este expediente no tiene documentos cargados. Devuélvalo a secretaría.
          </p>
        </div>
      </div>
    );
  }

  const documento = documentos[Math.min(activo, documentos.length - 1)]!;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {!ocultarPestanas && (
        <div
          role="tablist"
          aria-label="Documentos del expediente"
          className="flex shrink-0 overflow-x-auto border-b border-toga-200 bg-toga-50"
        >
          {documentos.map((d, i) => {
            const etiqueta =
              d.originalName?.trim() ||
              CATEGORIA_ETIQUETA[d.category] ||
              String(d.category);
            return (
              <button
                key={d.id}
                role="tab"
                type="button"
                title={etiqueta}
                aria-selected={i === activo}
                onClick={() => setActivo(i)}
                className={`max-w-[14rem] shrink-0 truncate border-b-2 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  i === activo
                    ? "border-balanza-600 bg-white text-toga-900"
                    : "border-transparent text-toga-500 hover:text-toga-900"
                }`}
              >
                {etiqueta}
                {d.version > 1 && (
                  <span className="ml-1.5 text-xs font-normal text-toga-400">v{d.version}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-toga-100 px-4 py-2">
        <span className="min-w-0 truncate text-xs font-medium text-toga-700">
          {documento.originalName}
        </span>
        <span className="text-xs text-toga-400">
          {CATEGORIA_ETIQUETA[documento.category] ?? documento.category}
        </span>
        {!ocultarPestanas && (
          <span className="ml-auto flex shrink-0 gap-2">
            <InsigniaClasificacion valor={documento.classification} />
            <InsigniaAnalisis valor={documento.scanStatus} />
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 bg-toga-100">
        {cargando && <p className="p-10 text-center text-sm text-toga-500">Abriendo documento…</p>}
        {error && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
            <p className="text-sm text-toga-600">{error}</p>
            <a
              href={`/api/documentos/contenido/${documento.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-balanza-700 underline"
            >
              Abrir en pestaña nueva
            </a>
          </div>
        )}
        {url && !cargando && !error && (
          <iframe
            src={url}
            title={`Documento: ${documento.originalName}`}
            className="h-full w-full border-0"
          />
        )}
      </div>

      <p className="codigo shrink-0 truncate border-t border-toga-100 px-4 py-1.5 text-[0.65rem] text-toga-400">
        SHA-256: {documento.sha256}
      </p>
    </div>
  );
}
