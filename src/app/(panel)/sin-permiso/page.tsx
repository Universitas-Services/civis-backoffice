import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sin permiso" };

export default function SinPermiso() {
  return (
    <div className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-lg rounded-lg border border-toga-200 bg-white p-8 text-center">
        <p className="text-3xl" aria-hidden="true">
          🔒
        </p>
        <h1 className="mt-3 text-lg font-semibold text-toga-900">
          Esta sección no corresponde a su rol
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-toga-600">
          Su cuenta no tiene permiso para ver esta pantalla. Si necesita acceso, solicítelo al
          administrador; el cambio de roles queda registrado en la bitácora.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-toga-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
