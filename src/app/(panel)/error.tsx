"use client";

import Link from "next/link";

/**
 * Red de seguridad del panel.
 *
 * Muestra el identificador de correlación cuando la API lo devolvió: es lo
 * que permite a quien administra encontrar en la bitácora exactamente qué
 * ocurrió en esa petición.
 */
export default function ErrorPanel({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <div className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-lg rounded-lg border border-balanza-600/25 bg-balanza-50 p-8">
        <h1 className="text-lg font-semibold text-toga-900">No se pudo cargar esta pantalla</h1>
        <p className="mt-2 text-sm leading-relaxed text-toga-700">
          {error.message || "Ocurrió un error inesperado."}
        </p>
        {error.digest && (
          <p className="codigo mt-3 text-xs text-toga-500">Referencia: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-toga-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="rounded-md border border-toga-300 bg-white px-5 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
