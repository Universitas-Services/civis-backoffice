"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { iniciarSesion, type EstadoLogin } from "@/app/acciones-auth";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-toga-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-toga-800 disabled:opacity-60"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
        <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {pending ? "Verificando…" : "Ingresar al sistema"}
    </button>
  );
}

export function FormularioLogin() {
  const [estado, accion] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});

  const claseCampo =
    "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2.5 text-sm text-toga-900 transition-colors placeholder:text-toga-400 focus:border-balanza-600";

  return (
    <form action={accion} className="space-y-4" noValidate>
      {estado.error && (
        <p
          role="alert"
          className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {estado.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-toga-600">
          Correo institucional
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={claseCampo}
        />
        {estado.campos?.email && (
          <p role="alert" className="mt-1 text-xs font-medium text-balanza-700">
            {estado.campos.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-toga-600">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={claseCampo}
        />
        {estado.campos?.password && (
          <p role="alert" className="mt-1 text-xs font-medium text-balanza-700">
            {estado.campos.password}
          </p>
        )}
      </div>

      <Boton />
    </form>
  );
}
