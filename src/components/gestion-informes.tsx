"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { InformeListado } from "@/contracts";
import {
  generarInforme,
  publicarInforme,
  type EstadoInformes,
} from "@/app/(panel)/informes/acciones";

function Boton({ texto, cargando }: { readonly texto: string; readonly cargando: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800 disabled:opacity-60"
    >
      {pending ? cargando : texto}
    </button>
  );
}

export function GenerarInforme() {
  const [estado, accion] = useActionState<EstadoInformes, FormData>(generarInforme, {});
  const [abierto, setAbierto] = useState(false);

  return (
    <section aria-labelledby="generar">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="generar" className="text-base font-semibold text-toga-900">
          Generar un informe
        </h2>
        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
        >
          {abierto ? "Cancelar" : "+ Nuevo borrador"}
        </button>
      </div>

      {estado.exito && (
        <p
          role="status"
          className="mt-4 rounded-md border border-validado-700/20 bg-validado-50 px-4 py-3 text-sm text-validado-700"
        >
          {estado.exito}
        </p>
      )}
      {estado.error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {estado.error}
        </p>
      )}

      {abierto && (
        <form action={accion} className="mt-4 rounded-lg border border-toga-200 bg-white p-5">
          <label htmlFor="cutoffAt" className="block text-xs font-medium text-toga-600">
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
    </section>
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

export function FichaInforme({
  informe,
  puedePublicar,
  loGeneroElMismoUsuario,
}: {
  readonly informe: InformeListado;
  readonly puedePublicar: boolean;
  readonly loGeneroElMismoUsuario: boolean;
}) {
  const [estado, accion] = useActionState<EstadoInformes, FormData>(
    publicarInforme.bind(null, informe.id),
    {},
  );
  const e = ESTADO[informe.status] ?? ESTADO.DRAFT!;
  const pendiente = informe.status === "PENDING_APPROVAL";

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

        {puedePublicar && pendiente && loGeneroElMismoUsuario && (
          <p className="text-sm text-toga-600">
            <span aria-hidden="true" className="mr-1.5">
              🛈
            </span>
            Usted generó este informe: debe aprobarlo otra persona.
          </p>
        )}
      </div>

      {estado.exito && (
        <p
          role="status"
          className="mt-3 rounded-md border border-validado-700/20 bg-validado-50 px-4 py-3 text-sm text-validado-700"
        >
          {estado.exito}
        </p>
      )}
      {estado.error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {estado.error}
        </p>
      )}

      {puedePublicar && pendiente && !loGeneroElMismoUsuario && !estado.exito && (
        <form action={accion} className="mt-4 space-y-3 border-t border-toga-100 pt-4">
          <div>
            <label htmlFor={`r-${informe.id}`} className="block text-xs font-medium text-toga-600">
              Motivo de la aprobación <span className="text-balanza-700">*</span>
            </label>
            <textarea
              id={`r-${informe.id}`}
              name="reason"
              rows={2}
              required
              minLength={10}
              placeholder="Qué revisó antes de autorizar la publicación."
              className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
            />
          </div>
          <Boton texto="Aprobar y publicar" cargando="Publicando…" />
        </form>
      )}
    </article>
  );
}
