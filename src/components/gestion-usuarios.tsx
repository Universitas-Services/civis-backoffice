"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { Role } from "@/contracts";
import { etiquetaRol, rolesAsignablesPara } from "@/contracts";
import {
  cambiarEstado,
  cambiarRoles,
  crearUsuario,
  type EstadoUsuarios,
} from "@/app/(panel)/usuarios/acciones";
import { useToast } from "@/components/toast-provider";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";

export function CrearUsuario({ rolesActor }: { readonly rolesActor: readonly Role[] }) {
  const [abierto, setAbierto] = useState(false);
  const [clave, setClave] = useState<string | null>(null);
  const [estado, accion] = useActionState<EstadoUsuarios, FormData>(crearUsuario, {});
  useToastDesdeEstado(estado);
  const claveVista = useRef<string | null>(null);
  const toast = useToast();
  const rolesDisponibles = rolesAsignablesPara(rolesActor);

  useEffect(() => {
    if (!estado.contrasenaTemporal || estado.contrasenaTemporal === claveVista.current) return;
    claveVista.current = estado.contrasenaTemporal;
    setClave(estado.contrasenaTemporal);
    setAbierto(true);
  }, [estado.contrasenaTemporal]);

  function cerrar() {
    setAbierto(false);
    setClave(null);
  }

  async function copiarClave() {
    if (!clave) return;
    try {
      await navigator.clipboard.writeText(clave);
      toast.exito("Clave copiada.");
    } catch {
      toast.error("No se pudo copiar. Seleccione la clave y cópiela a mano.");
    }
  }

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => {
          setClave(null);
          setAbierto(true);
        }}
        className="rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
      >
        Crear usuario
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-toga-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-crear-usuario"
          onClick={(evento) => {
            if (clave) return;
            if (evento.target === evento.currentTarget) cerrar();
          }}
        >
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg border border-toga-200 bg-white p-5 shadow-lg sm:p-6">
            {clave ? (
              <>
                <h2 id="titulo-crear-usuario" className="text-base font-semibold text-toga-900">
                  {estado.exito ?? "Usuario creado."}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-toga-700">
                  Ésta es la contraseña temporal. <strong>Se muestra una sola vez</strong> y no
                  queda registrada en ninguna parte. Cópiela y transmítala por un canal seguro; la
                  persona deberá cambiarla en su primer ingreso.
                </p>
                <p className="codigo mt-4 select-all rounded-md border border-toga-300 bg-toga-50 px-4 py-3 text-center text-lg font-semibold tracking-wider text-toga-900">
                  {clave}
                </p>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void copiarClave()}
                    className="rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
                  >
                    Copiar clave
                  </button>
                  <button
                    type="button"
                    onClick={cerrar}
                    className="rounded-md border border-toga-300 px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <form action={accion}>
                <h2 id="titulo-crear-usuario" className="text-base font-semibold text-toga-900">
                  Crear usuario
                </h2>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-medium text-toga-600">
                      Nombre completo <span className="text-balanza-700">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      required
                      autoFocus
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
                    Rol <span className="text-balanza-700">*</span>
                  </legend>
                  <p className="mt-1 text-xs text-toga-500">Solo un rol por usuario al crearlo.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rolesDisponibles.map((r) => (
                      <label
                        key={r}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-toga-200 px-3 py-2 text-sm hover:bg-toga-50"
                      >
                        <input type="radio" name="roles" value={r} required />
                        {etiquetaRol(r)}
                      </label>
                    ))}
                  </div>
                  {rolesDisponibles.length === 0 && (
                    <p className="mt-2 text-xs text-toga-500">Su cuenta no puede asignar roles.</p>
                  )}
                </fieldset>

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={cerrar}
                    className="rounded-md border border-toga-300 px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
                  >
                    Cancelar
                  </button>
                  <BotonCrear disabled={rolesDisponibles.length === 0} />
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BotonCrear({ disabled }: { readonly disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Creando…" : "Crear usuario"}
    </button>
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
  const [pendiente, iniciar] = useTransition();
  const toast = useToast();

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
    <div className="mx-auto min-w-[16rem] rounded-md border border-toga-300 bg-white p-3">
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
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            iniciar(async () => {
              const r = await cambiarEstado(id, activo ? "SUSPENDED" : "ACTIVE", motivo);
              if (r.ok) {
                setConfirmando(false);
                toast.exito(activo ? `${nombre} suspendido.` : `${nombre} reactivado.`);
              } else {
                toast.error(r.error ?? "No se pudo cambiar");
              }
            })
          }
          className="rounded-md bg-balanza-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
        >
          {pendiente ? "…" : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

/**
 * Editor de rol.
 *
 * Un usuario queda con un solo rol. El conjunto anterior se reemplaza.
 * Exige motivo porque cambia quién puede qué. Al guardar, la API cierra las
 * sesiones abiertas de esa persona.
 */
export function EditorRoles({
  id,
  nombre,
  rolesActuales,
  rolesActor,
  esUnoMismo,
}: {
  readonly id: string;
  readonly nombre: string;
  readonly rolesActuales: readonly Role[];
  readonly rolesActor: readonly Role[];
  readonly esUnoMismo: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [estado, accion] = useActionState<EstadoUsuarios, FormData>(
    cambiarRoles.bind(null, id),
    {},
  );
  useToastDesdeEstado(estado);
  const rolesDisponibles = rolesAsignablesPara(rolesActor);
  const esSuper = rolesActor.includes("SUPER_ADMIN");
  const objetivoElevado = rolesActuales.some((r) => r === "SUPER_ADMIN" || r === "ADMIN");
  // ADMIN no gestiona cuentas SUPER_ADMIN ni otras ADMIN.
  const puedeEditar = esSuper || !objetivoElevado;
  const rolActual = rolesActuales.length === 1 ? rolesActuales[0] : undefined;

  useEffect(() => {
    if (estado.exito) setAbierto(false);
  }, [estado.exito]);

  if (esUnoMismo) {
    return (
      <span
        className="text-xs text-toga-400"
        title="No puede cambiar los roles de su propia cuenta"
      >
        Su cuenta
      </span>
    );
  }

  if (!puedeEditar) {
    return (
      <span className="text-xs text-toga-400" title="Solo Universitas puede modificar esta cuenta">
        —
      </span>
    );
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-xs font-medium text-balanza-700 hover:underline"
      >
        Cambiar rol
      </button>
    );
  }

  return (
    <div className="mx-auto min-w-[18rem] rounded-md border border-toga-300 bg-white p-3">
      <p className="text-xs font-medium text-toga-900">Rol de {nombre}</p>
      <p className="mt-1 text-xs text-toga-500">Solo un rol. El que tenía queda reemplazado.</p>

      <form action={accion} className="mt-2 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {rolesDisponibles.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-toga-200 px-2 py-1 text-xs hover:bg-toga-50"
            >
              <input
                type="radio"
                name="roles"
                value={r}
                required
                defaultChecked={rolActual === r}
              />
              {etiquetaRol(r)}
            </label>
          ))}
        </div>
        <textarea
          name="reason"
          rows={2}
          required
          minLength={10}
          placeholder="Motivo del cambio (obligatorio)"
          className="w-full rounded-md border border-toga-300 px-2 py-1.5 text-xs"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-balanza-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-balanza-700"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
