"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { DocumentoEnRevision } from "@/contracts";
import { CATEGORIA_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import {
  clasificarDocumento,
  verificarDocumento,
  type EstadoRevision,
} from "@/app/(panel)/revision-documental/acciones";
import { InsigniaAnalisis, InsigniaClasificacion } from "./insignias";

/**
 * Ficha de revisión de un documento.
 *
 * El documento se abre bajo enlace temporal en vez de incrustarlo siempre:
 * en una bandeja con veinte documentos, cargarlos todos de golpe pediría
 * veinte URLs firmadas que caducarían antes de usarse.
 */
export function FichaRevision({
  documento,
  puedeVerificar,
  puedeClasificar,
}: {
  readonly documento: DocumentoEnRevision;
  readonly puedeVerificar: boolean;
  readonly puedeClasificar: boolean;
}) {
  const [urlDocumento, setUrlDocumento] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState(false);
  const [verificacion, accionVerificar] = useActionState<EstadoRevision, FormData>(
    verificarDocumento.bind(null, documento.id),
    {},
  );
  const [clasificacion, accionClasificar] = useActionState<EstadoRevision, FormData>(
    clasificarDocumento.bind(null, documento.id),
    {},
  );

  async function abrir() {
    setAbriendo(true);
    try {
      const r = await fetch(`/api/documentos/descarga/${documento.id}`);
      // Ver comentario en visor-pdf.tsx: la ruta de descarga confirma que el
      // documento está disponible; el contenido lo sirve el propio panel.
      if (r.ok) setUrlDocumento(`/api/documentos/contenido/${documento.id}`);
    } finally {
      setAbriendo(false);
    }
  }

  const candidato = documento.submission.candidate;
  const limpio = ["CLEAN", "SKIPPED"].includes(documento.scanStatus);

  return (
    <article className="rounded-lg border border-toga-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="codigo text-xs text-toga-500">{documento.submission.fileNumber}</p>
          <h3 className="mt-0.5 font-medium text-toga-900">
            <Link href={`/expedientes/${candidato.id}`} className="hover:underline">
              {candidato.firstName} {candidato.lastName}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-toga-500">
            {SALA_ETIQUETA[candidato.chamber]} ·{" "}
            {CATEGORIA_ETIQUETA[documento.category] ?? documento.category} ·{" "}
            {Math.round(documento.sizeBytes / 1024)} KB
            {documento.version > 1 && ` · versión ${documento.version}`}
          </p>
        </div>
        <span className="flex shrink-0 flex-wrap gap-2">
          <InsigniaClasificacion valor={documento.classification} />
          <InsigniaAnalisis valor={documento.scanStatus} />
        </span>
      </div>

      <p className="mt-2 truncate text-sm text-toga-700">{documento.originalName}</p>
      <p className="codigo mt-1 break-all text-[0.7rem] text-toga-400">
        SHA-256: {documento.sha256}
      </p>

      {/* ── Lectura del documento ─────────────────────────────────── */}
      <div className="mt-4 border-t border-toga-100 pt-4">
        {urlDocumento ? (
          <iframe
            src={urlDocumento}
            title={`Documento: ${documento.originalName}`}
            className="h-96 w-full rounded-md border border-toga-200"
          />
        ) : (
          <button
            type="button"
            onClick={() => void abrir()}
            disabled={abriendo}
            className="rounded-md border border-toga-300 px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-60"
          >
            {abriendo ? "Abriendo…" : "Leer documento"}
          </button>
        )}
      </div>

      {(verificacion.exito ?? clasificacion.exito) && (
        <p
          role="status"
          className="mt-4 rounded-md border border-validado-700/20 bg-validado-50 px-4 py-3 text-sm text-validado-700"
        >
          {verificacion.exito ?? clasificacion.exito}
        </p>
      )}
      {(verificacion.error ?? clasificacion.error) && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {verificacion.error ?? clasificacion.error}
        </p>
      )}

      <div className="mt-4 grid gap-4 border-t border-toga-100 pt-4 lg:grid-cols-2">
        {/* ── Verificación ─────────────────────────────────────────── */}
        {puedeVerificar && !verificacion.exito && (
          <form action={accionVerificar} className="space-y-2">
            <p className="text-xs font-semibold text-toga-900">¿El documento es válido?</p>
            <div className="flex gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-toga-700">
                <input type="radio" name="status" value="VERIFIED" required /> Verificado
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-toga-700">
                <input type="radio" name="status" value="REJECTED" /> Rechazado
              </label>
            </div>
            <textarea
              name="reason"
              rows={2}
              required
              minLength={5}
              placeholder="Qué comprobó, o por qué lo rechaza (ej.: escaneo ilegible)."
              className="w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-toga-900 px-4 py-2 text-sm font-semibold text-white hover:bg-toga-800"
            >
              Registrar verificación
            </button>
          </form>
        )}

        {/* ── Clasificación de privacidad ──────────────────────────── */}
        {puedeClasificar && !clasificacion.exito && (
          <form action={accionClasificar} className="space-y-2">
            <p className="text-xs font-semibold text-toga-900">Privacidad del archivo</p>
            <p className="text-xs leading-relaxed text-toga-500">
              Marcarlo público lo expone a cualquier ciudadano. Nace privado por defecto.
            </p>
            <select
              name="classification"
              defaultValue=""
              required
              className="w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Seleccione…
              </option>
              <option value="PRIVATE">Privado — sólo uso interno</option>
              <option value="REDACTED">Redactado — versión con datos ocultos</option>
              <option value="PUBLIC" disabled={!limpio}>
                Público{!limpio ? " — requiere análisis limpio" : ""}
              </option>
            </select>
            <textarea
              name="reason"
              rows={2}
              required
              minLength={5}
              placeholder="Por qué esta clasificación."
              className="w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md border border-toga-300 px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-100"
            >
              Cambiar clasificación
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
