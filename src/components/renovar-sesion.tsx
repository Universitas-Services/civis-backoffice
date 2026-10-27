"use client";

import { useEffect } from "react";

/**
 * Lleva al navegador, con una carga completa, al handler que renueva la sesión.
 *
 * `replace` y no `assign`: la pantalla intermedia no debe quedar en el
 * historial, o «Atrás» volvería a disparar la renovación.
 */
export function RenovarSesion({ destino }: { readonly destino: string }) {
  useEffect(() => {
    window.location.replace(destino);
  }, [destino]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-toga-50 px-5"
    >
      <div className="flex items-center gap-3 text-base text-toga-700">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-toga-300 border-t-balanza-600"
        />
        Renovando su sesión…
      </div>
    </div>
  );
}
