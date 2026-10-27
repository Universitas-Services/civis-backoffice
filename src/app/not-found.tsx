import Link from "next/link";

export const metadata = { title: "Página no encontrada" };

/** Ruta inexistente o expediente que ya no se encuentra. */
export default function NoEncontrada() {
  return (
    <main
      id="contenido"
      className="flex min-h-dvh items-center justify-center bg-toga-50 px-5 py-16"
    >
      <div className="w-full max-w-lg rounded-lg border border-toga-200 bg-white p-8">
        <p className="codigo text-xs text-toga-500">404</p>
        <h1 className="mt-1 text-lg font-semibold text-toga-900">No encontramos esta página</h1>
        <p className="mt-2 text-base leading-relaxed text-toga-700">
          La dirección no existe o el registro ya no está disponible. Revise el enlace o vuelva al
          panel para buscarlo desde su sección.
        </p>
        <div className="mt-6">
          <Link
            href="/inicio"
            className="inline-block rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </main>
  );
}
