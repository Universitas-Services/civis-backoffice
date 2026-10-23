import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FormularioLogin } from "@/components/formulario-login";

export const metadata: Metadata = { title: "Ingresar" };

/**
 * Acceso centrado en card: fondo institucional (azul + vino) y formulario
 * sobre lienzo claro. Sin scroll de página: todo cabe en el viewport, incluidos
 * los accesos a la autopostulación (por eso logo y espacios son compactos).
 */
export default async function Login({
  searchParams,
}: {
  readonly searchParams: Promise<{ passwordChanged?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="relative flex h-dvh items-center justify-center overflow-hidden px-4 py-4 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-toga-900"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 0% 0%, rgb(122 30 45 / 0.45), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 100%, rgb(122 30 45 / 0.35), transparent 50%),
            linear-gradient(160deg, #0f2a44 0%, #111827 55%, #0f2a44 100%)
          `,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 22px, #fff 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, #fff 22px 23px)",
        }}
      />

      <section
        id="contenido"
        className="relative w-full max-w-md rounded-xl border border-white/10 bg-toga-50 shadow-[0_24px_64px_rgb(0_0_0_/0.35)]"
      >
        <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-balanza-600 via-balanza-600 to-toga-800" />

        <div className="px-6 py-5 sm:px-8 sm:py-5">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/brand/logo-completo.png"
              alt="CIVIS — Consejo Independiente de Verificación de Credenciales"
              width={180}
              height={196}
              className="h-14 w-auto object-contain sm:h-16"
              priority
            />

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-toga-900">
              Ingresar al sistema
            </h1>
            <p className="mt-1 text-sm text-toga-500">Acceso restringido al personal autorizado.</p>
          </div>

          <div className="mt-4">
            {params.passwordChanged === "1" && (
              <p className="mb-3 rounded-md border border-validado-700/25 bg-validado-50 px-4 py-2.5 text-sm text-validado-700">
                Contraseña actualizada. Ingrese nuevamente.
              </p>
            )}
            <FormularioLogin />
          </div>

          <p className="mt-3 text-center text-xs leading-relaxed text-toga-500">
            Uso exclusivo del Consejo Independiente. Los intentos de acceso quedan registrados en la
            bitácora.
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 border-t border-toga-200 pt-3">
            <span className="text-xs text-toga-600">¿Desea postularse al TSJ?</span>
            <Link
              href="/postulacion/nueva"
              className="rounded-md border border-balanza-600 bg-white px-3 py-1 text-xs font-semibold text-balanza-700 hover:bg-balanza-50"
            >
              Postularme
            </Link>
            <Link
              href="/postulacion/reanudar"
              className="rounded-md border border-toga-300 bg-white px-3 py-1 text-xs font-medium text-toga-700 hover:bg-toga-50"
            >
              Reanudar mi postulación
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
