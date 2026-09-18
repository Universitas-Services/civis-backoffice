"use client";

import { useEffect, useState } from "react";

/**
 * Carga el PDF vía fetch (con cookie de sesión) y lo muestra como blob URL.
 * Evita el iframe directo a /api/... que a veces termina en «conexión rechazada»
 * cuando el visor nativo no puede interpretar la respuesta.
 */
export function VisorDocumentoRevision({
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
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    let objectUrl: string | null = null;

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
  }, [documentId]);

  return (
    <div className="overflow-hidden rounded-md border border-toga-200 bg-toga-50 lg:sticky lg:top-4">
      <p className="border-b border-toga-100 px-3 py-1.5 text-xs font-medium text-toga-600">
        {titulo}
      </p>
      {cargando ? (
        <div className="flex h-[28rem] items-center justify-center bg-white text-sm text-toga-500">
          Cargando documento…
        </div>
      ) : error ? (
        <div className="flex h-[28rem] flex-col items-center justify-center gap-2 bg-white px-4 text-center">
          <p className="text-sm text-toga-700">{error}</p>
          <a
            href={`/api/documentos/contenido/${documentId}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-balanza-700 hover:underline"
          >
            Abrir en pestaña nueva
          </a>
        </div>
      ) : url ? (
        <iframe title={`Vista previa: ${nombreArchivo}`} src={url} className="h-[28rem] w-full bg-white" />
      ) : null}
      <p className="codigo truncate border-t border-toga-100 px-3 py-1.5 text-xs text-toga-500">
        {nombreArchivo} · {sizeKb} KB
      </p>
    </div>
  );
}
