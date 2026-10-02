"use client";

import { useState } from "react";
import { Check, Copy, PencilLine, Sparkles, Trash2 } from "lucide-react";
import { CargaIa } from "@/components/carga-ia";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Informe IA del postulante en una hoja lateral amplia, abierta desde un botón
 * flotante. En elegibilidad es solo lectura (texto guardado en BD). En tachas
 * sigue permitiendo editar/borrar en sesión.
 */
export function InformeIaSheet({
  nombrePostulante,
  informe,
  cargando = false,
  generando,
  onGenerar,
  onCambiar,
  onBorrar,
  onAbrir,
  descripcion,
  textoVacio,
  nivel,
  cupoSesion = false,
  generacionAgotada = false,
  soloLectura = false,
  disponible,
}: {
  readonly nombrePostulante: string;
  readonly informe: string;
  readonly cargando?: boolean;
  readonly generando: boolean;
  readonly onGenerar: () => void;
  readonly onCambiar: (texto: string) => void;
  readonly onBorrar: () => void;
  /** Se llama al abrir la hoja (p. ej. cargar/revelar con retraso). */
  readonly onAbrir?: () => void;
  readonly descripcion?: string;
  readonly textoVacio?: string;
  readonly nivel?: string;
  /** Si es true, la generación exitosa solo puede hacerse una vez en la sesión. */
  readonly cupoSesion?: boolean;
  readonly generacionAgotada?: boolean;
  /** Sin editar, borrar ni regenerar; solo lectura + copiar. */
  readonly soloLectura?: boolean;
  /** Punto en el botón flotante (p. ej. hay informe en BD aún no revelado). */
  readonly disponible?: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const hayInforme = informe.trim().length > 0;
  const mostrarDisponible = disponible ?? hayInforme;
  const puedeEditar = !soloLectura;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(informe);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false);
    }
  }

  function borrar() {
    onBorrar();
    setEditando(false);
  }

  return (
    <Sheet
      onOpenChange={(abierto) => {
        if (!abierto) setEditando(false);
        else onAbrir?.();
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          className="group fixed right-6 bottom-6 z-40 inline-flex items-center gap-2 rounded-full bg-balanza-600 py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-lg shadow-balanza-900/25 ring-1 ring-balanza-700/40 transition hover:-translate-y-0.5 hover:bg-balanza-700 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-balanza-600/30 focus-visible:outline-none"
        >
          <span className="relative">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {mostrarDisponible && (
              <span
                className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white ring-2 ring-balanza-600"
                aria-hidden="true"
              />
            )}
          </span>
          Informe IA
          {mostrarDisponible && <span className="sr-only">(generado)</span>}
        </button>
      </SheetTrigger>

      <SheetContent className="max-w-2xl">
        <SheetHeader className="px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-balanza-50 text-balanza-700 ring-1 ring-balanza-600/15">
              <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <SheetTitle>
                Informe IA
                {nivel ? (
                  <span className="ml-2 align-middle text-xs font-semibold tracking-wide text-balanza-700 uppercase">
                    {nivel}
                  </span>
                ) : null}
              </SheetTitle>
              <SheetDescription>
                {descripcion ??
                  `Resumen del expediente de ${nombrePostulante}. Es un apoyo: el dictamen lo decide usted.`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
          {cargando && !generando ? (
            <p className="m-auto text-sm text-toga-500" aria-live="polite">
              Cargando el informe guardado…
            </p>
          ) : generando ? (
            <CargaIa activo={generando} etiqueta="Preparando informe…" />
          ) : !hayInforme && !editando ? (
            <div className="m-auto flex max-w-sm flex-col items-center py-10 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-balanza-50 text-balanza-700 ring-1 ring-balanza-600/15">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-toga-900">Aún no hay informe</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-toga-500">
                {textoVacio ??
                  (soloLectura
                    ? "Si el informe no se generó al enviar a evaluación, puede pedirlo una sola vez. Quedará guardado para todo el comité."
                    : "La IA revisa los datos y documentos que el revisor ya guardó y redacta un resumen que podrá leer y editar aquí.")}
              </p>
              <button
                type="button"
                onClick={onGenerar}
                disabled={generacionAgotada || generando}
                title={
                  !cupoSesion
                    ? undefined
                    : generacionAgotada
                      ? "Generación ya usada en esta sesión"
                      : "Generar el informe con IA (una vez por sesión)"
                }
                className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generando ? (
                  <Spinner className="text-white" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
                {generacionAgotada ? "IA ya usada" : generando ? "Generando…" : "Generar informe"}
              </button>
              {generacionAgotada && (
                <p className="mt-2 text-xs text-toga-500">Generación ya usada en esta sesión.</p>
              )}
              {puedeEditar ? (
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  disabled={generando}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-toga-600 hover:text-toga-900 disabled:opacity-50"
                >
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                  Redactar a mano
                </button>
              ) : null}
            </div>
          ) : null}

          {!cargando && !generando && (hayInforme || editando) && (
            <>
              {editando && puedeEditar ? (
                <>
                  <label htmlFor="informe-ia-elegibilidad" className="sr-only">
                    Texto del Informe IA
                  </label>
                  <textarea
                    id="informe-ia-elegibilidad"
                    autoFocus
                    value={informe}
                    onChange={(e) => onCambiar(e.target.value)}
                    placeholder="Escriba aquí el resumen del expediente…"
                    className="min-h-[24rem] w-full flex-1 resize-none rounded-lg border border-toga-300 bg-white px-4 py-3 text-sm leading-relaxed text-toga-900 placeholder:text-toga-400 focus:border-balanza-600 focus:ring-2 focus:ring-balanza-600/20 focus:outline-none"
                  />
                </>
              ) : (
                <article className="text-[0.9375rem] leading-7 whitespace-pre-wrap text-toga-800">
                  {informe}
                </article>
              )}
            </>
          )}
        </div>

        {!cargando && !generando && (hayInforme || editando) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-toga-100 bg-toga-50/60 px-6 py-3">
            <p className="text-xs text-toga-500">
              {informe.trim().split(/\s+/).filter(Boolean).length} palabras
              {soloLectura ? " · Solo lectura" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {puedeEditar ? (
                <button
                  type="button"
                  onClick={borrar}
                  disabled={!hayInforme}
                  className="inline-flex items-center gap-1.5 rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Borrar
                </button>
              ) : null}
              <button
                type="button"
                onClick={copiar}
                disabled={!hayInforme}
                className="inline-flex items-center gap-1.5 rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copiado ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copiado ? "Copiado" : "Copiar"}
              </button>
              {puedeEditar && hayInforme ? (
                <button
                  type="button"
                  onClick={() => {
                    if (generacionAgotada || generando) return;
                    setEditando(false);
                    onGenerar();
                  }}
                  disabled={generacionAgotada || generando}
                  title={
                    !cupoSesion
                      ? undefined
                      : generacionAgotada
                        ? "Generación ya usada en esta sesión"
                        : "Generar el informe con IA (una vez por sesión)"
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generando ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {generacionAgotada
                    ? "IA ya usada"
                    : generando
                      ? "Generando…"
                      : "Generar de nuevo"}
                </button>
              ) : null}
              {puedeEditar ? (
                <button
                  type="button"
                  onClick={() => setEditando((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-balanza-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-balanza-700"
                >
                  {editando ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {editando ? "Listo" : "Editar"}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
