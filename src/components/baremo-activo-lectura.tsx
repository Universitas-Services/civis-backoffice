import type { BaremoDetalle } from "@/contracts";
import { puntosBaremo } from "@/contracts";

/** Árbol del baremo activo, sin acciones de configuración. */
export function BaremoActivoLectura({ baremo }: { readonly baremo: BaremoDetalle | null }) {
  if (!baremo) {
    return (
      <section className="rounded-lg border border-toga-200 bg-white px-5 py-4">
        <h2 className="text-sm font-semibold text-toga-900">Baremo activo</h2>
        <p className="mt-1 text-sm text-toga-500">Todavía no hay un baremo activo.</p>
      </section>
    );
  }

  const criterios = [...baremo.criterios].sort((a, b) => a.order - b.order);

  return (
    <section className="rounded-lg border border-toga-200 bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-balanza-700">Baremo activo</p>
          <h2 className="mt-0.5 text-base font-semibold text-toga-900">{baremo.title}</h2>
          {baremo.description && (
            <p className="mt-1 max-w-prose text-sm text-toga-600">{baremo.description}</p>
          )}
        </div>
        <p className="cifra text-sm font-semibold text-toga-800">
          {puntosBaremo(baremo.totalPoints)} pts
        </p>
      </div>
      {criterios.length === 0 ? (
        <p className="mt-3 text-sm text-toga-500">Este baremo no tiene criterios.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {criterios.map((criterio) => (
            <li
              key={criterio.id}
              className="rounded-md border border-toga-100 bg-toga-50 px-3 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-toga-900">{criterio.name}</p>
                <p className="cifra text-xs text-toga-600">{puntosBaremo(criterio.points)} pts</p>
              </div>
              {criterio.description && (
                <p className="mt-1 text-xs text-toga-500">{criterio.description}</p>
              )}
              {criterio.rangos.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {[...criterio.rangos]
                    .sort((a, b) => a.order - b.order)
                    .map((rango) => (
                      <li key={rango.id} className="text-xs text-toga-700">
                        {rango.title}
                        <span className="cifra text-toga-500">
                          {" "}
                          · {puntosBaremo(rango.minPoints)}–{puntosBaremo(rango.maxPoints)}
                        </span>
                        {rango.description && (
                          <span className="mt-0.5 block text-toga-500">{rango.description}</span>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
