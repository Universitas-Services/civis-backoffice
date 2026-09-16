"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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

export function FormularioCambiarContrasena() {
  const [state, action] = useActionState<EstadoCambioContrasena, FormData>(cambiarContrasena, {});
  const inputClass =
    "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2.5 text-base text-toga-900";

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
      <div>
        <label htmlFor="currentPassword" className="block text-base font-medium text-toga-700">
          Contraseña actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className={`${inputClass}${state.campos?.currentPassword ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(state.campos?.currentPassword)}
          aria-describedby={state.campos?.currentPassword ? "currentPassword-error" : undefined}
          required
        />
        {state.campos?.currentPassword && (
          <p id="currentPassword-error" role="alert" className="mensaje-error-campo text-sm">
            {state.campos.currentPassword}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-base font-medium text-toga-700">
          Contraseña nueva
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className={`${inputClass}${state.campos?.newPassword ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(state.campos?.newPassword)}
          aria-describedby={state.campos?.newPassword ? "newPassword-error" : undefined}
          required
        />
        <p className="mt-1 text-sm text-toga-500">
          Mínimo 12 caracteres, con mayúscula, minúscula y número.
        </p>
        {state.campos?.newPassword && (
          <p id="newPassword-error" role="alert" className="mensaje-error-campo text-sm">
            {state.campos.newPassword}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-base font-medium text-toga-700">
          Confirmar contraseña nueva
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={`${inputClass}${state.campos?.confirmPassword ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(state.campos?.confirmPassword)}
          aria-describedby={state.campos?.confirmPassword ? "confirmPassword-error" : undefined}
          required
        />
        {state.campos?.confirmPassword && (
          <p id="confirmPassword-error" role="alert" className="mensaje-error-campo text-sm">
            {state.campos.confirmPassword}
          </p>
        )}
      </div>
      <BotonGuardar />
    </form>
  );
}
