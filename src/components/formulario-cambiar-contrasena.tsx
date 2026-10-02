"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { cambiarContrasena, type EstadoCambioContrasena } from "@/app/acciones-auth";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-balanza-600 px-5 py-3 text-base font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Actualizando…" : "Cambiar contraseña"}
    </button>
  );
}

function CampoContrasena({
  id,
  name,
  label,
  autoComplete,
  error,
  ver,
  onToggle,
  ayuda,
}: {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly autoComplete: string;
  readonly error?: string;
  readonly ver: boolean;
  readonly onToggle: () => void;
  readonly ayuda?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-medium text-toga-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={ver ? "text" : "password"}
          autoComplete={autoComplete}
          className={`w-full rounded-md border border-toga-300 bg-white py-2.5 pr-11 pl-3 text-base text-toga-900${
            error ? " campo-con-error" : ""
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={ver}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md text-toga-500 transition-colors hover:text-toga-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-balanza-600"
        >
          {ver ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {ayuda ? <p className="mt-1 text-sm text-toga-500">{ayuda}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mensaje-error-campo text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormularioCambiarContrasena() {
  const [state, action] = useActionState<EstadoCambioContrasena, FormData>(cambiarContrasena, {});
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmacion, setVerConfirmacion] = useState(false);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-balanza-600/25 bg-balanza-50 p-4 text-base text-balanza-700"
        >
          {state.error}
        </p>
      )}
      <CampoContrasena
        id="currentPassword"
        name="currentPassword"
        label="Contraseña actual"
        autoComplete="current-password"
        error={state.campos?.currentPassword}
        ver={verActual}
        onToggle={() => setVerActual((v) => !v)}
      />
      <CampoContrasena
        id="newPassword"
        name="newPassword"
        label="Contraseña nueva"
        autoComplete="new-password"
        error={state.campos?.newPassword}
        ver={verNueva}
        onToggle={() => setVerNueva((v) => !v)}
        ayuda="Mínimo 12 caracteres, con mayúscula, minúscula y número."
      />
      <CampoContrasena
        id="confirmPassword"
        name="confirmPassword"
        label="Confirmar contraseña nueva"
        autoComplete="new-password"
        error={state.campos?.confirmPassword}
        ver={verConfirmacion}
        onToggle={() => setVerConfirmacion((v) => !v)}
      />
      <BotonGuardar />
    </form>
  );
}
