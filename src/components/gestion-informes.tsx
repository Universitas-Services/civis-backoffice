"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { InformeListado } from "@/contracts";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { generarInforme, type EstadoInformes } from "@/app/(panel)/informes/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";

function Boton({ texto, cargando }: { readonly texto: string; readonly cargando: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? cargando : texto}
    </button>
  );
}

export function MarcoInformes({
  puedeGenerar,
  children,
}: {
  readonly puedeGenerar: boolean;
  readonly children: ReactNode;
}) {
  const [estado, accion] = useActionState<EstadoInformes, FormData>(generarInforme, {});
  const [abierto, setAbierto] = useState(false);
  useToastDesdeEstado(estado);

  return (
    <>
      <CabeceraPagina
        titulo="Informes finales"
        descripcion="Cada informe se genera a partir de evaluaciones aprobadas y lleva su huella digital, para que cualquiera pueda comprobar que el documento no cambió."
        acciones={
          puedeGenerar ? (
            <button
              type="button"
              onClick={() => setAbierto(!abierto)}
              className="rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
            >
              {abierto ? "Cancelar" : "Nuevo borrador"}
            </button>
          ) : undefined
        }
      />
      <div className="space-y-8 px-5 py-6 sm:px-8">
        {puedeGenerar && abierto && (
          <form action={accion} className="rounded-lg border border-toga-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-toga-900">Generar un informe</h2>
            <label htmlFor="cutoffAt" className="mt-3 block text-xs font-medium text-toga-600">
              Fecha de corte de los datos
            </label>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-toga-500">
              El informe recoge el estado del proceso a esta fecha. Es una entrada, no el momento de
              generarlo: con los mismos datos y la misma fecha, el informe sale idéntico y su huella
              digital coincide. Si lo deja en blanco se usa ahora mismo.
            </p>
            <input
              id="cutoffAt"
              name="cutoffAt"
              type="datetime-local"
              className="mt-2 rounded-md border border-toga-300 px-3 py-2 text-sm"
            />
            <div className="mt-4">
              <Boton texto="Generar borrador" cargando="Generando…" />
            </div>
          </form>
        )}
        {children}
      </div>
    </>
  );
}

const ESTADO: Record<string, { texto: string; clases: string }> = {
  DRAFT: { texto: "Borrador", clases: "bg-toga-100 text-toga-600 ring-toga-300" },
  PENDING_APPROVAL: {
    texto: "Pendiente de aprobación",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  },
  PUBLISHED: {
    texto: "Publicado",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
  },
  WITHDRAWN: {
    texto: "Retirado",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
  },
};

/**
 * Ficha de un informe generado. Ya no se publica en el sitio público (la
 * landing está fuera de uso): se genera y se descarga con su huella.
 */
export function FichaInforme({ informe }: { readonly informe: InformeListado }) {
  const e = ESTADO[informe.status] ?? ESTADO.DRAFT!;

  return (
    <article className="rounded-lg border border-toga-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-toga-900">Informe versión {informe.version}</h3>
          <p className="mt-0.5 text-xs text-toga-500">
            Generado por {informe.preparedBy?.fullName ?? "—"} el{" "}
            {new Date(informe.createdAt).toLocaleString("es-VE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            {informe.publishedAt &&
              ` · publicado el ${new Date(informe.publishedAt).toLocaleDateString("es-VE", { dateStyle: "medium" })}`}
          </p>
        </div>
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${e.clases}`}
        >
          {e.texto}
        </span>
      </div>

      <p className="codigo mt-3 break-all text-[0.7rem] text-toga-400">SHA-256: {informe.sha256}</p>

      {informe.approvalReason && (
        <p className="mt-2 text-sm leading-relaxed text-toga-600">
          <span className="text-toga-500">Motivo de la aprobación:</span> {informe.approvalReason}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-toga-100 pt-4">
        <a
          href={`/api/informes/${informe.id}/descargar`}
          className="rounded-md border border-toga-300 px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-100"
        >
          Descargar Markdown
        </a>
      </div>
    </article>
  );
}
