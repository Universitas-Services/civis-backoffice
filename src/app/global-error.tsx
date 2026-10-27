"use client";

import { mono, sans, serif } from "@/lib/fuentes";
import { destinoDeDigest } from "@/lib/recarga-sesion";
import { RenovarSesion } from "@/components/renovar-sesion";
import "@/styles/globals.css";

/**
 * Última red: un fallo en el layout raíz o en un layout de grupo, que
 * `(panel)/error.tsx` no alcanza a envolver.
 *
 * Reemplaza al layout raíz, así que trae su propio `<html>`, fuentes y estilos.
 * Sin este archivo, Next muestra su 500 genérico, en inglés y sin salida.
 */
export default function GlobalError({
  error,
  retry,
}: {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
}) {
  const destino = destinoDeDigest(error.digest);

  return (
    <html lang="es-VE" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <title>Error · Panel interno</title>
        {destino ? (
          <RenovarSesion destino={destino} />
        ) : (
          <main className="flex min-h-dvh items-center justify-center bg-toga-50 px-5 py-16">
            <div className="w-full max-w-lg rounded-lg border border-balanza-600/25 bg-balanza-50 p-8">
              <h1 className="text-lg font-semibold text-toga-900">El panel no pudo cargarse</h1>
              <p className="mt-2 text-base leading-relaxed text-toga-700">
                Ocurrió un error inesperado. Puede reintentar o recargar la página; si se repite,
                comunique la referencia a quien administra el panel.
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
                {/* Enlace normal, no <Link>: aquí el enrutador puede estar roto. */}
                <a
                  href="/inicio"
                  className="rounded-md border border-toga-300 bg-white px-5 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
                >
                  Volver al panel
                </a>
              </div>
            </div>
          </main>
        )}
      </body>
    </html>
  );
}
