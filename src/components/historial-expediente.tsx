"use client";

import {
  ArrowRightLeft,
  FilePen,
  FilePlus,
  History,
  RefreshCw,
  Scale,
  Sparkles,
  Upload,
} from "lucide-react";
import { CATEGORIA_ETIQUETA, etiquetaRol } from "@/contracts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type EventoHistorial = {
  readonly id: string;
  readonly action: string;
  readonly occurredAt: string;
  readonly actor: string;
  readonly role: string | null;
  readonly reason: string | null;
  readonly document: {
    readonly category: string | null;
    readonly name: string | null;
  } | null;
};

const ACCION_ETIQUETA: Record<string, string> = {
  "candidate.created": "Expediente creado",
  "candidate.updated": "Expediente actualizado",
  "candidate.transitioned": "Cambio de etapa",
  "document.uploaded": "Documento cargado",
  "document.replaced": "Documento actualizado",
  "document.reclassified": "Documento reclasificado",
  "document.verified": "Documento verificado",
  "document.reviewed": "Revisión guardada",
  "document.extract_requested": "Extracción con IA",
  "eligibility.decided": "Dictamen de elegibilidad",
};

const ICONO_ACCION: Record<string, typeof History> = {
  "candidate.created": FilePlus,
  "candidate.updated": FilePen,
  "candidate.transitioned": ArrowRightLeft,
  "document.uploaded": Upload,
  "document.replaced": RefreshCw,
  "document.reclassified": RefreshCw,
  "document.verified": FilePen,
  "document.reviewed": FilePen,
  "document.extract_requested": Sparkles,
  "eligibility.decided": Scale,
};

const TEXTO_HISTORIAL = "Del más reciente al más antiguo.";

export function HistorialExpediente({
  eventos,
}: {
  readonly eventos: readonly EventoHistorial[];
}) {
  return (
    <section className="rounded-lg border border-toga-200 bg-white">
      <header className="border-b border-toga-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-toga-900">Historial del expediente</h2>
        <p className="mt-1 text-xs text-toga-500">{TEXTO_HISTORIAL}</p>
      </header>
      <ListaHistorial eventos={eventos} />
    </section>
  );
}

/** Botón de la cabecera que abre el historial en un panel lateral. */
export function HojaHistorialExpediente({
  eventos,
}: {
  readonly eventos: readonly EventoHistorial[];
}) {
  const cantidad = eventos.length;
  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-toga-300 px-4 py-2.5 text-sm font-medium text-toga-700 hover:border-toga-400 hover:bg-toga-50">
        <History className="h-4 w-4" aria-hidden="true" />
        Ver historial
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-balanza-50 text-balanza-600">
              <History className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <SheetTitle>Historial del expediente</SheetTitle>
              <SheetDescription>
                {cantidad === 0
                  ? "Todavía no hay movimientos."
                  : `${cantidad} ${cantidad === 1 ? "movimiento" : "movimientos"}. ${TEXTO_HISTORIAL}`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto bg-toga-50/40">
          <ListaHistorial eventos={eventos} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ListaHistorial({ eventos }: { readonly eventos: readonly EventoHistorial[] }) {
  const ordenados = [...eventos].reverse();

  if (ordenados.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-toga-100 text-toga-500">
          <History className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm text-toga-600">
          Este expediente todavía no tiene movimientos registrados.
        </p>
      </div>
    );
  }

  return (
    <ol className="px-5 py-5">
      {ordenados.map((evento, indice) => {
        const categoria = evento.document?.category;
        const nombreDoc = evento.document?.name;
        const etiquetaCategoria = categoria ? CATEGORIA_ETIQUETA[categoria] : undefined;
        const Icono = ICONO_ACCION[evento.action] ?? History;
        const fecha = new Date(evento.occurredAt);
        const ultimo = indice === ordenados.length - 1;
        return (
          <li key={evento.id} className="relative pl-7">
            {ultimo ? null : (
              <span
                className="absolute top-3 bottom-0 left-[7px] w-px bg-toga-200"
                aria-hidden="true"
              />
            )}
            <span
              className="absolute top-3.5 left-0 h-4 w-4 rounded-full border-2 border-balanza-600 bg-white"
              aria-hidden="true"
            />
            <article className={`rounded-lg border border-toga-200 bg-white px-3.5 py-3 shadow-sm ${ultimo ? "" : "mb-4"}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium text-toga-900">
                  <Icono className="h-3.5 w-3.5 shrink-0 text-balanza-600" aria-hidden="true" />
                  {ACCION_ETIQUETA[evento.action] ?? evento.action}
                </p>
                <time
                  className="shrink-0 text-right text-[11px] leading-tight text-toga-500 tabular-nums"
                  dateTime={evento.occurredAt}
                >
                  {fecha.toLocaleDateString("es-VE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  <span className="mt-0.5 block text-toga-400">
                    {fecha.toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </time>
              </div>
              <p className="mt-2 text-xs text-toga-600">
                {evento.actor}
                {evento.role ? ` · ${etiquetaRol(evento.role)}` : ""}
              </p>
              {nombreDoc ? (
                <p className="mt-2 inline-flex max-w-full rounded-md bg-toga-50 px-2 py-1 text-xs text-toga-700 ring-1 ring-toga-200">
                  {etiquetaCategoria ? `${etiquetaCategoria} · ` : ""}
                  {nombreDoc}
                </p>
              ) : null}
              {evento.reason ? (
                <p className="mt-2 border-l-2 border-balanza-200 pl-2.5 text-sm leading-relaxed text-toga-800">
                  {evento.reason}
                </p>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
