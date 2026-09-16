import Link from "next/link";

/**
 * Paginación por enlaces GET (sin JS): conserva el resto de query params.
 * Siempre muestra el contador de página; los botones se habilitan según haya más.
 */
export function Paginacion({
  ruta,
  page,
  pageSize,
  total,
  params,
}: {
  readonly ruta: string;
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly params: Record<string, string | undefined>;
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function href(p: number) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) q.set(k, v);
    }
    q.set("page", String(p));
    return `${ruta}?${q}`;
  }

  return (
    <nav
      aria-label="Paginación"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-toga-500">
        Página <span className="cifra font-medium text-toga-900">{page}</span> de{" "}
        <span className="cifra font-medium text-toga-900">{totalPages}</span>
        <span className="text-toga-400"> · </span>
        <span className="cifra">{pageSize}</span> por página
        <span className="text-toga-400"> · </span>
        <span className="cifra">{total}</span> en total
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="rounded-md border border-toga-300 bg-white px-3 py-1.5 font-semibold text-toga-700 hover:bg-toga-50"
          >
            ← Anterior
          </Link>
        ) : (
          <span className="rounded-md border border-toga-100 px-3 py-1.5 text-toga-300">
            ← Anterior
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={href(page + 1)}
            className="rounded-md border border-toga-300 bg-white px-3 py-1.5 font-semibold text-toga-700 hover:bg-toga-50"
          >
            Siguiente →
          </Link>
        ) : (
          <span className="rounded-md border border-toga-100 px-3 py-1.5 text-toga-300">
            Siguiente →
          </span>
        )}
      </div>
    </nav>
  );
}
