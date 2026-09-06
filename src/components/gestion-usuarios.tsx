"use client";

import { useActionState, useState, useTransition } from "react";
import { ROLES, ROL_ETIQUETA } from "@/contracts";
import { cambiarEstado, crearUsuario, type EstadoUsuarios } from "@/app/(panel)/usuarios/acciones";

export function CrearUsuario() {
  const [abierto, setAbierto] = useState(false);
  const [estado, accion] = useActionState<EstadoUsuarios, FormData>(crearUsuario, {});

  return (
    <section aria-labelledby="crear">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="crear" className="text-base font-semibold text-toga-900">
          Registrar integrante del equipo
        </h2>
        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
        >
          {abierto ? "Cancelar" : "+ Nuevo usuario"}
        </button>
      </div>

      {/* La contraseña temporal se muestra UNA vez. Si se cierra la pantalla,
          no hay forma de recuperarla: hay que restablecerla. */}
      {estado.contrasenaTemporal && (
        <div className="mt-4 rounded-lg border border-balanza-600/25 bg-balanza-50 p-5">
          <p className="text-sm font-semibold text-toga-900">{estado.exito}</p>
          <p className="mt-2 text-sm leading-relaxed text-toga-700">
            Ésta es la contraseña temporal. <strong>Se muestra una sola vez</strong> y no queda
            registrada en ninguna parte. Transmítala por un canal seguro; la persona deberá
            cambiarla en su primer ingreso.
          </p>
          <p className="codigo mt-3 select-all rounded-md border border-balanza-600/25 bg-white px-4 py-3 text-center text-lg font-semibold tracking-wider text-toga-900">
            {estado.contrasenaTemporal}
          </p>
        </div>
      )}

      {estado.error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {estado.error}
        </p>
      )}

      {abierto && !estado.contrasenaTemporal && (
        <form action={accion} className="mt-4 rounded-lg border border-toga-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-toga-600">
                Nombre completo <span className="text-balanza-700">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-toga-600">
                Correo institucional <span className="text-balanza-700">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="text-xs font-medium text-toga-600">
              Roles <span className="text-balanza-700">*</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-toga-200 px-3 py-2 text-sm hover:bg-toga-50"
                >
                  <input type="checkbox" name="roles" value={r} />
                  {ROL_ETIQUETA[r]}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-5 rounded-md bg-toga-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
          >
            Crear usuario
          </button>
        </form>
      )}
    </section>
  );
}

/**
 * Interruptor de suspensión.
 *
 * Exige motivo antes de accionarse: revocar el acceso de alguien es una
 * decisión que debe quedar explicada en la bitácora, no un clic suelto.
 */
export function InterruptorUsuario({
  id,
  nombre,
  activo,
  esUnoMismo,
}: {
  readonly id: string;
  readonly nombre: string;
  readonly activo: boolean;
  readonly esUnoMismo: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  if (esUnoMismo) {
    return (
      <span className="text-xs text-toga-400" title="No puede suspender su propia cuenta">
        Su cuenta
      </span>
    );
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
          activo
            ? "bg-validado-50 text-validado-700 ring-validado-700/20"
            : "bg-toga-100 text-toga-500 ring-toga-300"
        }`}
      >
        <span aria-hidden="true">{activo ? "●" : "○"}</span>
        {activo ? "Activo" : "Suspendido"}
      </button>
    );
  }

  return (
    <div className="min-w-[16rem] rounded-md border border-toga-300 bg-white p-3">
      <p className="text-xs font-medium text-toga-900">
        {activo ? `Suspender a ${nombre}` : `Reactivar a ${nombre}`}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-toga-500">
        {activo
          ? "Cierra sus sesiones al instante. Su historial de evaluaciones se conserva."
          : "Podrá volver a iniciar sesión con sus credenciales actuales."}
      </p>
      <textarea
        rows={2}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo (obligatorio)"
        className="mt-2 w-full rounded-md border border-toga-300 px-2 py-1.5 text-xs"
      />
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-balanza-700">
          {error}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            iniciar(async () => {
              const r = await cambiarEstado(id, activo ? "SUSPENDED" : "ACTIVE", motivo);
              if (r.ok) setConfirmando(false);
              else setError(r.error ?? "No se pudo cambiar");
            })
          }
          className="rounded-md bg-toga-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-toga-800 disabled:opacity-60"
        >
          {pendiente ? "…" : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirmando(false);
            setError(null);
          }}
          className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
