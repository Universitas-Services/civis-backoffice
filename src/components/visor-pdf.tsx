"use client";

import { useState } from "react";
import type { DocumentoExpediente } from "@/contracts";
import { CATEGORIA_ETIQUETA } from "@/contracts";
import { InsigniaAnalisis, InsigniaClasificacion } from "./insignias";

/**
 * Visor documental con pestañas.
 *
 * La URL firmada se pide al abrir cada documento y caduca en minutos, de modo
 * que una pantalla abierta toda la tarde no conserva enlaces válidos. Cambiar
 * de pestaña no recarga la página: el evaluador alterna entre el currículum y
 * los títulos sin perder lo que lleva escrito en el baremo.
 */
export function VisorPdf({ documentos }: { readonly documentos: readonly DocumentoExpediente[] }) {
  const [activo, setActivo] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const documento = documentos[activo]!;

  async function abrir(indice: number) {
    setActivo(indice);
    setUrl(null);
    setError(null);
    setCargando(true);
    try {
      // Se confirma que el documento sigue disponible (y que la sesión vale)
      // antes de pintar el visor.
      const respuesta = await fetch(`/api/documentos/descarga/${documentos[indice]!.id}`);
      if (!respuesta.ok) throw new Error();
      // El visor consume la ruta del propio panel, no la URL firmada del
      // almacenamiento: es lo que permite mostrar el PDF en pantalla en vez de
      // descargarlo, con independencia del proveedor que haya detrás.
      setUrl(`/api/documentos/contenido/${documentos[indice]!.id}`);
    } catch {
      setError("No se pudo abrir el documento.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div
        role="tablist"
        aria-label="Documentos del expediente"
        className="flex shrink-0 overflow-x-auto border-b border-toga-200 bg-toga-50"
      >
        {documentos.map((d, i) => (
          <button
            key={d.id}
            role="tab"
            type="button"
            aria-selected={i === activo}
            onClick={() => void abrir(i)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              i === activo
                ? "border-balanza-600 bg-white text-toga-900"
                : "border-transparent text-toga-500 hover:text-toga-900"
            }`}
          >
            {CATEGORIA_ETIQUETA[d.category] ?? d.category}
            {d.version > 1 && <span className="ml-1.5 text-xs text-toga-400">v{d.version}</span>}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-toga-100 px-4 py-2">
        <span className="min-w-0 truncate text-xs font-medium text-toga-700">
          {documento.originalName}
        </span>
        <span className="ml-auto flex shrink-0 gap-2">
          <InsigniaClasificacion valor={documento.classification} />
          <InsigniaAnalisis valor={documento.scanStatus} />
        </span>
      </div>

      <div className="min-h-0 flex-1 bg-toga-100">
        {cargando && <p className="p-10 text-center text-sm text-toga-500">Abriendo documento…</p>}
        {error && <p className="p-10 text-center text-sm text-toga-600">{error}</p>}
        {!cargando && !error && !url && (
          <div className="p-10 text-center">
            <p className="text-sm text-toga-600">
              El documento se abre bajo un enlace temporal por seguridad.
            </p>
            <button
              type="button"
              onClick={() => void abrir(activo)}
              className="mt-4 rounded-md bg-toga-900 px-4 py-2 text-sm font-semibold text-white hover:bg-toga-800"
            >
              Abrir documento
            </button>
          </div>
        )}
        {url && (
          <iframe
            src={url}
            title={`Documento: ${documento.originalName}`}
            className="h-full w-full"
          />
        )}
      </div>

      <p className="codigo shrink-0 truncate border-t border-toga-100 px-4 py-1.5 text-[0.65rem] text-toga-400">
        SHA-256: {documento.sha256}
      </p>
    </div>
  );
}
