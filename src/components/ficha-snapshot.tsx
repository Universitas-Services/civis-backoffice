"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { SnapshotEnCola } from "@/contracts";
import { publicarSnapshot, type EstadoPublicacion } from "@/app/(panel)/publicaciones/acciones";

function BotonPublicar({ bloqueado }: { readonly bloqueado: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || bloqueado}
      className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Publicando…" : "Aprobar y publicar"}
    </button>
  );
}

export function FichaSnapshot({
  snapshot,
  tipoLegible,
  loPreparoElMismoUsuario,
}: {
  readonly snapshot: SnapshotEnCola;
  readonly tipoLegible: string;
  readonly loPreparoElMismoUsuario: boolean;
}) {
  const [estado, accion] = useActionState<EstadoPublicacion, FormData>(publicarSnapshot, {});

  const nombre = snapshot.candidate
    ? `${snapshot.candidate.firstName} ${snapshot.candidate.lastName}`
    : tipoLegible;

  return (
    <article className="rounded-lg border border-toga-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-toga-500">
            {tipoLegible} · versión {snapshot.version}
          </p>
          <h2 className="mt-1 font-medium text-toga-900">{nombre}</h2>
          <p className="mt-1 text-xs text-toga-500">
            Preparado por {snapshot.preparedBy?.fullName ?? "—"} el{" "}
            {new Date(snapshot.createdAt).toLocaleString("es-VE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className="rounded-full bg-balanza-50 px-2.5 py-1 text-xs font-medium text-balanza-700">
          Pendiente de aprobación
        </span>
      </div>

      <p className="codigo mt-3 break-all text-[0.7rem] text-toga-400">
        SHA-256: {snapshot.sha256}
      </p>

      {loPreparoElMismoUsuario ? (
        <p className="mt-4 rounded-md border border-toga-200 bg-toga-50 px-4 py-3 text-sm text-toga-600">
          <span aria-hidden="true" className="mr-1.5">
            🛈
          </span>
          Usted preparó este snapshot. Debe aprobarlo otra persona con rol de publicación: la
          separación de funciones es lo que evita que una sola persona publique sin revisión.
        </p>
      ) : (
        <form action={accion} className="mt-4 space-y-3">
          <input type="hidden" name="snapshotId" value={snapshot.id} />

          {estado.error && (
            <p
              role="alert"
              className="rounded-md border border-balanza-600/25 bg-balanza-50 px-3 py-2 text-sm text-balanza-700"
            >
              {estado.error}
            </p>
          )}
          {estado.exito && (
            <p
              role="status"
              className="rounded-md border border-validado-700/20 bg-validado-50 px-3 py-2 text-sm text-validado-700"
            >
              {estado.exito}
            </p>
          )}

          <div>
            <label
              htmlFor={`motivo-${snapshot.id}`}
              className="block text-xs font-medium text-toga-600"
            >
              Motivo de la aprobación <span className="text-balanza-700">*</span>
            </label>
            <textarea
              id={`motivo-${snapshot.id}`}
              name="reason"
              rows={2}
              required
              minLength={10}
              placeholder="Qué revisó y por qué autoriza la publicación."
              className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400"
            />
          </div>

          <BotonPublicar bloqueado={Boolean(estado.exito)} />
        </form>
      )}
    </article>
  );
}
