import type { Metadata } from "next";
import Link from "next/link";
import { FormularioLogin } from "@/components/formulario-login";
import { TarjetaAcceso } from "@/components/tarjeta-acceso";

export const metadata: Metadata = { title: "Ingresar" };

export default async function Login({
  searchParams,
}: {
  readonly searchParams: Promise<{ passwordChanged?: string; restablecida?: string }>;
}) {
  const params = await searchParams;
  const aviso =
    params.passwordChanged === "1"
      ? "Contraseña actualizada. Ingrese nuevamente."
      : params.restablecida === "1"
        ? "Contraseña restablecida. Ingrese con la nueva."
        : null;
  return (
    <TarjetaAcceso
      titulo="Ingresar al sistema"
      descripcion="Acceso restringido al personal autorizado."
      pie="Uso exclusivo del Consejo Independiente. Los intentos de acceso quedan registrados en la bitácora."
    >
      {aviso && (
        <p className="mb-3 rounded-md border border-validado-700/25 bg-validado-50 px-4 py-2.5 text-sm text-validado-700">
          {aviso}
        </p>
      )}
      <FormularioLogin />
      <p className="mt-3 text-center text-sm">
        <Link href="/recuperar" className="font-medium text-balanza-700 hover:text-balanza-600">
          ¿Olvidó su contraseña?
        </Link>
      </p>
    </TarjetaAcceso>
  );
}
