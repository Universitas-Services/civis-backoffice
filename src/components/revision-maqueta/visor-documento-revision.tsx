"use client";

import { useEffect, useState, type ReactNode } from "react";
import { prepararVistaDocumento } from "@/lib/archivo-documento";

/**
 * Carga el archivo vía fetch (con cookie de sesión) y lo muestra como blob URL.
 * PDF en iframe; imagen (JPEG, PNG, WEBP) en una etiqueta img.
 */
export function VisorDocumentoRevision({
  documentId,
  nombreArchivo,
  sizeKb,
  titulo,
  acciones,
  accionEncabezado,
  anclar = true,
  altura = "h-[28rem]",
}: {
  readonly documentId: string;
  readonly nombreArchivo: string;
  readonly sizeKb: number;
  readonly titulo: string;
  /** Controles que deben quedar pegados al visor (por ejemplo, actualizar el archivo). */
  readonly acciones?: ReactNode;
  /** Control junto al título, por ejemplo ampliar el documento. */
  readonly accionEncabezado?: ReactNode;
  /** Si false, el visor no se queda fijo al hacer scroll (el panel padre ya lo está). */
  readonly anclar?: boolean;
  /** Clase de altura del lienzo. Por defecto `h-[28rem]`. */
  readonly altura?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [modo, setModo] = useState<"imagen" | "pdf">("pdf");
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
          const cuerpo = (await respuesta.json().catch(() => null)) as {
            message?: unknown;
          } | null;
          if (cancelado) return;
          const detalle =
            typeof cuerpo?.message === "string" && cuerpo.message !== "Documento no disponible"
              ? ` ${cuerpo.message}`
              : "";
          setError(
            respuesta.status >= 500
              ? `La API no pudo entregar el archivo (error ${respuesta.status}).${detalle}`
              : `No se pudo cargar el documento.${detalle}`,
          );
          return;
        }
        const blob = await respuesta.blob();
        if (cancelado) return;
        const vista = await prepararVistaDocumento(blob, nombreArchivo);
        if (cancelado) return;
        objectUrl = URL.createObjectURL(vista.blob);
        setModo(vista.modo);
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
  }, [documentId, nombreArchivo]);

  return (
    <div
      className={`overflow-hidden rounded-md border border-toga-200 bg-toga-50${
        anclar ? " lg:sticky lg:top-4" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-toga-100 px-3 py-1.5">
        <p className="min-w-0 truncate text-xs font-medium text-toga-600">{titulo}</p>
        {accionEncabezado}
      </div>
      {cargando ? (
        <div
          className={`flex ${altura} items-center justify-center bg-white text-sm text-toga-500`}
        >
          Cargando documento…
        </div>
      ) : error ? (
        <div
          className={`flex ${altura} flex-col items-center justify-center gap-2 bg-white px-4 text-center`}
        >
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
      ) : url && modo === "imagen" ? (
        <div className={`flex ${altura} items-center justify-center bg-white`}>
          <img src={url} alt={nombreArchivo} className="max-h-full max-w-full object-contain" />
        </div>
      ) : url ? (
        <iframe
          title={`Vista previa: ${nombreArchivo}`}
          src={url}
          className={`${altura} w-full bg-white`}
        />
      ) : null}
      <p className="codigo truncate border-t border-toga-100 px-3 py-1.5 text-xs text-toga-500">
        {nombreArchivo} · {sizeKb} KB
      </p>
      {acciones ? (
        <div className="border-t border-toga-100 bg-white px-3 py-2.5">{acciones}</div>
      ) : null}
    </div>
  );
}
