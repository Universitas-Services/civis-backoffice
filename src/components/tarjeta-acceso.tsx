import Image from "next/image";

/**
 * Acceso centrado en card: fondo institucional (azul + vino) y formulario
 * sobre lienzo claro. Lo comparten el ingreso y la recuperación de contraseña.
 */
export function TarjetaAcceso({
  titulo,
  descripcion,
  children,
  pie,
}: {
  readonly titulo: string;
  readonly descripcion: string;
  readonly children: React.ReactNode;
  readonly pie?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-4 sm:px-6">
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
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-toga-900">{titulo}</h1>
            <p className="mt-1 text-sm text-toga-500">{descripcion}</p>
          </div>

          <div className="mt-4">{children}</div>

          {pie && (
            <div className="mt-3 text-center text-xs leading-relaxed text-toga-500">{pie}</div>
          )}
        </div>
      </section>
    </div>
  );
}
