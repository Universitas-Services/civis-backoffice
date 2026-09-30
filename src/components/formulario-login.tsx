"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { iniciarSesion, type EstadoLogin } from "@/app/acciones-auth";
import { reiniciarSidebar } from "@/lib/sidebar-panel";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-balanza-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-balanza-700 disabled:opacity-60"
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
  const [verContrasena, setVerContrasena] = useState(false);

  useEffect(() => {
    reiniciarSidebar();
  }, []);

  const claseCampo =
    "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2.5 text-sm text-toga-900 transition-colors placeholder:text-toga-400 focus:border-balanza-600 focus:ring-2 focus:ring-balanza-600/20";

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
          aria-invalid={Boolean(estado.campos?.email)}
          aria-describedby={estado.campos?.email ? "email-error" : undefined}
          className={`${claseCampo}${estado.campos?.email ? " campo-con-error" : ""}`}
        />
        {estado.campos?.email && (
          <p id="email-error" role="alert" className="mensaje-error-campo">
            {estado.campos.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-toga-600">
          Contraseña
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={verContrasena ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(estado.campos?.password)}
            aria-describedby={estado.campos?.password ? "password-error" : undefined}
            className={`w-full rounded-md border border-toga-300 bg-white py-2.5 pr-11 pl-3 text-sm text-toga-900 transition-colors placeholder:text-toga-400 focus:border-balanza-600 focus:ring-2 focus:ring-balanza-600/20${
              estado.campos?.password ? " campo-con-error" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setVerContrasena((v) => !v)}
            aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={verContrasena}
            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md text-toga-500 transition-colors hover:text-toga-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-balanza-600"
          >
            {verContrasena ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {estado.campos?.password && (
          <p id="password-error" role="alert" className="mensaje-error-campo">
            {estado.campos.password}
          </p>
        )}
      </div>

      <Boton />
    </form>
  );
}
