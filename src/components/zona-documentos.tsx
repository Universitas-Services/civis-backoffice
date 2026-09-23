"use client";

import { useRef, useState } from "react";
import { CATEGORIA_ETIQUETA, DOCUMENT_CATEGORY, type DocumentCategory } from "@/contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCEPT_ARCHIVO_DOCUMENTO,
  esArchivoDocumentoPermitido,
  TEXTO_FORMATOS_DOCUMENTO,
} from "@/lib/archivo-documento";

export interface DocumentoCargado {
  readonly id: string;
  readonly originalName: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly category: DocumentCategory;
  readonly scanStatus: string;
}

/**
 * Carga de documentos por arrastre.
 *
 * El arrastre es una comodidad, no el único camino: el mismo `<input file>`
 * está detrás y funciona con teclado y con lector de pantalla. Una zona de
 * arrastre sin alternativa deja fuera a quien no puede usar el ratón.
 */
export function ZonaDocumentos({
  submissionId,
  documentos,
  onCambio,
  mostrarLista = true,
}: {
  readonly submissionId: string;
  readonly documentos: readonly DocumentoCargado[];
  readonly onCambio: (docs: DocumentoCargado[]) => void;
  /** En el detalle del expediente la lista la pinta el servidor; aquí solo la zona de carga. */
  readonly mostrarLista?: boolean;
}) {
  const [categoria, setCategoria] = useState<DocumentCategory>("NATIONAL_ID");
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function subir(archivos: FileList | File[]) {
    setSubiendo(true);
    setErrores([]);
    const nuevos: DocumentoCargado[] = [];
    const fallos: string[] = [];

    for (const archivo of Array.from(archivos)) {
      const cuerpo = new FormData();
      cuerpo.append("category", categoria);
      cuerpo.append("file", archivo);

      try {
        const respuesta = await fetch(`/api/documentos/${submissionId}`, {
          method: "POST",
          body: cuerpo,
        });
        const datos = (await respuesta.json()) as DocumentoCargado & { message?: string };
        if (!respuesta.ok) {
          fallos.push(`${archivo.name}: ${datos.message ?? "no se pudo cargar"}`);
        } else {
          nuevos.push(datos);
        }
      } catch {
        fallos.push(`${archivo.name}: fallo de conexión`);
      }
    }

    onCambio([...documentos, ...nuevos]);
    setErrores(fallos);
    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-toga-200 bg-white p-5">
        <label htmlFor="categoria-trigger" className="block text-xs font-medium text-toga-600">
          Tipo de documento que va a cargar
        </label>
        <Select value={categoria} onValueChange={(v) => setCategoria(v as DocumentCategory)}>
          <SelectTrigger id="categoria-trigger" className="mt-1 w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_CATEGORY.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORIA_ETIQUETA[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            if (e.dataTransfer.files.length > 0) {
              const validos = Array.from(e.dataTransfer.files).filter(esArchivoDocumentoPermitido);
              if (validos.length > 0) void subir(validos);
            }
          }}
          className={`mt-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            arrastrando ? "border-balanza-600 bg-toga-100" : "border-toga-300 bg-toga-50"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="mx-auto h-10 w-10 text-toga-400"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 12v5M9.5 14.5 12 12l2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-3 text-sm text-toga-600">Arrastre aquí PDF o imágenes, o</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="mt-2 rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-60"
          >
            {subiendo ? "Cargando…" : "Seleccione archivos"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ARCHIVO_DOCUMENTO}
            multiple
            className="sr-only"
            aria-label="Seleccionar documentos PDF o imagen"
            onChange={(e) => {
              if (!e.target.files?.length) return;
              const validos = Array.from(e.target.files).filter(esArchivoDocumentoPermitido);
              if (validos.length > 0) void subir(validos);
            }}
          />
          <p className="mt-3 text-xs text-toga-500">{TEXTO_FORMATOS_DOCUMENTO}</p>
        </div>
      </div>

      {errores.length > 0 && (
        <ul role="alert" className="space-y-2">
          {errores.map((e) => (
            <li
              key={e}
              className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
            >
              {e}
            </li>
          ))}
        </ul>
      )}

      {mostrarLista && documentos.length > 0 && (
        <div className="rounded-lg border border-toga-200 bg-white">
          <p className="border-b border-toga-100 px-5 py-3 text-sm font-semibold text-toga-900">
            <span className="cifra">{documentos.length}</span>{" "}
            {documentos.length === 1 ? "documento cargado" : "documentos cargados"}
          </p>
          <ul className="divide-y divide-toga-100">
            {documentos.map((d) => (
              <li key={d.id} className="px-5 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-medium text-toga-900">
                    {d.originalName}
                  </span>
                  <span className="shrink-0 text-xs text-toga-500">
                    {CATEGORIA_ETIQUETA[d.category] ?? d.category} ·{" "}
                    {Math.round(d.sizeBytes / 1024)} KB
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
