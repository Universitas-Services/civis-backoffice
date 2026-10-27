"use client";

import Link from "next/link";
import { RenovarSesion } from "@/components/renovar-sesion";
import { destinoDeDigest } from "@/lib/recarga-sesion";

/**
 * Red de seguridad del panel.
 *
 * Muestra el identificador de correlación cuando la API lo devolvió: es lo
 * que permite a quien administra encontrar en la bitácora exactamente qué
 * ocurrió en esa petición.
 *
 * También recibe `RecargaSesion` (lanzado por `renovarYVolver`): en ese caso
 * no es un fallo, sino la petición de renovar el token con una carga completa.
 */
export default function ErrorPanel({
  error,
  retry,
}: {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
}) {
  const destino = destinoDeDigest(error.digest);
  if (destino) return <RenovarSesion destino={destino} />;

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
            onClick={retry}
            className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Reintentar
          </button>
          <Link
            href="/inicio"
            className="rounded-md border border-toga-300 bg-white px-5 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
