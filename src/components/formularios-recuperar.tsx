"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  pedirCodigoRecuperacion,
  reenviarCodigoRecuperacion,
  restablecerContrasena,
  type EstadoRecuperar,
} from "@/app/acciones-recuperar";
import { useToast } from "@/components/toast-provider";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2.5 text-sm text-toga-900 transition-colors placeholder:text-toga-400 focus:border-balanza-600 focus:ring-2 focus:ring-balanza-600/20";

function Boton({ children, enCurso }: { readonly children: string; readonly enCurso: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-md bg-balanza-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? enCurso : children}
    </button>
  );
}

function Error({ id, mensaje }: { readonly id: string; readonly mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p id={id} role="alert" className="mensaje-error-campo">
      {mensaje}
    </p>
  );
}

function Aviso({ mensaje }: { readonly mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
    >
      {mensaje}
    </p>
  );
}

function VolverAlIngreso() {
  return (
    <p className="text-center text-sm">
      <Link href="/login" className="font-medium text-balanza-700 hover:text-balanza-600">
        Volver a ingresar
      </Link>
    </p>
  );
}

/** Paso 1: el correo de la cuenta. */
export function FormularioPedirCodigo() {
  const [estado, accion] = useActionState<EstadoRecuperar, FormData>(pedirCodigoRecuperacion, {});
  return (
    <form action={accion} className="space-y-4" noValidate>
      <Aviso mensaje={estado.error} />
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-toga-600">
          Correo de su cuenta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={Boolean(estado.campos?.email)}
          aria-describedby={estado.campos?.email ? "email-error" : undefined}
          className={`${CAMPO}${estado.campos?.email ? " campo-con-error" : ""}`}
        />
        <Error id="email-error" mensaje={estado.campos?.email} />
      </div>
      <Boton enCurso="Enviando…">Enviarme un código</Boton>
      <VolverAlIngreso />
    </form>
  );
}

/** Paso 2: código recibido y contraseña nueva. */
export function FormularioRestablecer() {
  const toast = useToast();
  const [estado, accion] = useActionState<EstadoRecuperar, FormData>(restablecerContrasena, {});
  const [ver, setVer] = useState(false);
  const [reenviando, iniciar] = useTransition();
  const c = estado.campos ?? {};

  function reenviar() {
    iniciar(async () => {
      const r = await reenviarCodigoRecuperacion();
      if (r.error) toast.error(r.error);
      else if (r.exito) toast.exito(r.exito);
    });
  }

  return (
    <form action={accion} className="space-y-4" noValidate>
      <Aviso mensaje={estado.error} />
      <div>
        <label htmlFor="codigo" className="block text-xs font-medium text-toga-600">
          Código de 6 dígitos
        </label>
        <input
          id="codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          aria-invalid={Boolean(c.codigo)}
          aria-describedby={c.codigo ? "codigo-error" : undefined}
          className={`${CAMPO} codigo text-center text-lg tracking-[0.4em]${c.codigo ? " campo-con-error" : ""}`}
        />
        <Error id="codigo-error" mensaje={c.codigo} />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-toga-600">
          Contraseña nueva
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={ver ? "text" : "password"}
            autoComplete="new-password"
            required
            aria-invalid={Boolean(c.password)}
            aria-describedby={c.password ? "password-error" : "password-ayuda"}
            className={`${CAMPO} mt-0 pr-11${c.password ? " campo-con-error" : ""}`}
          />
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={ver}
            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md text-toga-500 hover:text-toga-800"
          >
            {ver ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {!c.password && (
          <p id="password-ayuda" className="mt-1 text-xs text-toga-500">
            Mínimo 12 caracteres, con mayúscula, minúscula y un número.
          </p>
        )}
        <Error id="password-error" mensaje={c.password} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-medium text-toga-600">
          Repita la contraseña nueva
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={ver ? "text" : "password"}
          autoComplete="new-password"
          required
          aria-invalid={Boolean(c.confirmPassword)}
          aria-describedby={c.confirmPassword ? "confirm-error" : undefined}
          className={`${CAMPO}${c.confirmPassword ? " campo-con-error" : ""}`}
        />
        <Error id="confirm-error" mensaje={c.confirmPassword} />
      </div>
      <Boton enCurso="Guardando…">Restablecer contraseña</Boton>
      <p className="text-center text-sm text-toga-600">
        ¿No le llegó?{" "}
        <button
          type="button"
          onClick={reenviar}
          disabled={reenviando}
          className="font-medium text-balanza-700 hover:text-balanza-600 disabled:opacity-60"
        >
          {reenviando ? "Enviando…" : "Enviar otro código"}
        </button>
      </p>
    </form>
  );
}
