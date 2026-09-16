import type { Metadata } from "next";
import Image from "next/image";
import { FormularioLogin } from "@/components/formulario-login";

export const metadata: Metadata = { title: "Ingresar" };

/**
 * Acceso centrado en card: fondo institucional (azul + vino) y formulario
 * sobre lienzo claro. Sin scroll de página: todo cabe en el viewport.
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

        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/brand/logo-completo.png"
              alt="CIVIS — Consejo Independiente de Verificación de Credenciales"
              width={180}
              height={196}
              className="h-20 w-auto object-contain sm:h-24"
              priority
            />

            <h1 className="mt-4 text-xl font-semibold tracking-tight text-toga-900">
              Ingresar al sistema
            </h1>
            <p className="mt-1 text-sm text-toga-500">
              Acceso restringido al personal autorizado.
            </p>
          </div>

          <div className="mt-5">
            {params.passwordChanged === "1" && (
              <p className="mb-3 rounded-md border border-validado-700/25 bg-validado-50 px-4 py-2.5 text-sm text-validado-700">
                Contraseña actualizada. Ingrese nuevamente.
              </p>
            )}
            <FormularioLogin />
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-toga-500">
            Uso exclusivo del Consejo Independiente. Los intentos de acceso quedan
            registrados en la bitácora.
          </p>
        </div>
      </section>
    </div>
  );
}
