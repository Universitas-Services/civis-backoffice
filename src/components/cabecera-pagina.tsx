import Link from "next/link";

/** Cabecera común de las pantallas del panel, con ruta de navegación. */
export function CabeceraPagina({
  titulo,
  descripcion,
  ruta,
  acciones,
}: {
  readonly titulo: string;
  readonly descripcion?: string;
  readonly ruta?: readonly { readonly href?: string; readonly texto: string }[];
  readonly acciones?: React.ReactNode;
}) {
  return (
    <header className="border-b border-toga-200 bg-white px-5 py-6 sm:px-8">
      {ruta && ruta.length > 0 && (
        <nav aria-label="Ruta" className="mb-3 text-sm text-toga-500">
          {ruta.map((r, i) => (
            <span key={r.texto}>
              {i > 0 && (
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
              )}
              {r.href ? (
                <Link href={r.href} className="hover:text-toga-900">
                  {r.texto}
                </Link>
              ) : (
                <span className="text-toga-700">{r.texto}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-toga-900 sm:text-2xl">
            {titulo}
          </h1>
          {descripcion && (
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-toga-600">{descripcion}</p>
          )}
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
      </div>
    </header>
  );
}

export function EstadoVacio({
  titulo,
  detalle,
  accion,
}: {
  readonly titulo: string;
  readonly detalle: string;
  readonly accion?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-toga-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-toga-700">{titulo}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-toga-500">{detalle}</p>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}
