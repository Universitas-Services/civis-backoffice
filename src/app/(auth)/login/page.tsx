import type { Metadata } from "next";
import { FormularioLogin } from "@/components/formulario-login";

export const metadata: Metadata = { title: "Ingresar" };

/**
 * Pantalla de acceso a dos paneles.
 *
 * Izquierda: fondo gris pizarra sólido, para el propósito institucional.
 * Derecha: el formulario sobre lienzo claro, donde va toda la atención.
 * En móvil el panel de marca se reduce a una franja superior.
 */
export default async function Login({
  searchParams,
}: {
  readonly searchParams: Promise<{ passwordChanged?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-dvh md:grid md:grid-cols-2">
      {/* ── Panel de marca ─────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-toga-900 px-6 py-8 md:px-10 md:py-12">
        {/* Marca de agua: retícula sobria que evoca la pauta de un documento. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 22px, #fff 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, #fff 22px 23px)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <svg
            viewBox="0 0 32 36"
            className="h-10 w-10 text-balanza-500"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M16 1.5 30 6v12c0 8.2-5.6 14.2-14 16.5C7.6 32.2 2 26.2 2 18V6l14-4.5Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M9 13h14M10.5 13v9M21.5 13v9M8 22h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M13 17.5l2.5 2.5 5-5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="leading-tight">
            <span className="block font-serif text-base font-semibold text-white">
              CONSEJO INDEPENDIENTE
            </span>
            <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-toga-400">
              Verificación de credenciales
            </span>
          </span>
        </div>

        <p className="relative mt-8 max-w-md font-serif text-lg leading-relaxed text-toga-200 md:mt-0 md:text-2xl">
          Plataforma de auditoría técnica y veeduría cívica para la conformación del Tribunal
          Supremo de Justicia.
        </p>

        <p className="relative mt-8 hidden text-sm text-toga-500 md:block">
          Toda operación queda registrada en la bitácora de auditoría.
        </p>
      </section>

      {/* ── Panel del formulario ───────────────────────────────────── */}
      <section
        id="contenido"
        className="flex items-center justify-center bg-toga-50 px-6 py-12 md:px-10"
      >
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight text-toga-900">
            Ingresar al sistema
          </h1>
          <p className="mt-1.5 text-sm text-toga-500">Acceso restringido al personal autorizado.</p>

          <div className="mt-7">
            {params.passwordChanged === "1" && (
              <p className="mb-4 rounded-md border border-validado-700/25 bg-validado-50 px-4 py-3 text-base text-validado-700">
                Contraseña actualizada. Ingrese nuevamente.
              </p>
            )}
            <FormularioLogin />
          </div>

          <p className="mt-8 border-t border-toga-200 pt-5 text-xs leading-relaxed text-toga-500">
            Sistema de uso exclusivo para el personal del Consejo. Los intentos de acceso, con éxito
            o sin él, quedan registrados.
          </p>
        </div>
      </section>
    </div>
  );
}
