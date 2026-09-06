import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioCambiarContrasena } from "@/components/formulario-cambiar-contrasena";
import { usuarioActual } from "@/lib/sesion";

export const metadata: Metadata = { title: "Cambiar contraseña" };

export default async function CambiarContrasenaPage() {
  const user = await usuarioActual();
  if (!user) redirect("/login");

  return (
    <main
      id="contenido"
      className="flex min-h-dvh items-center justify-center bg-toga-50 px-5 py-12"
    >
      <section className="w-full max-w-lg rounded-lg border border-toga-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wider text-balanza-700">
          Seguridad de la cuenta
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-toga-900">Cambiar contraseña</h1>
        <p className="mt-3 text-base leading-relaxed text-toga-600">
          Antes de continuar, establezca una contraseña personal. Al guardarla se cerrarán las demás
          sesiones y tendrá que ingresar nuevamente.
        </p>
        <div className="mt-7">
          <FormularioCambiarContrasena />
        </div>
      </section>
    </main>
  );
}
