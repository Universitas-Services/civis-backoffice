"use client";

import Link from "next/link";
import { EstadoVacio } from "@/components/cabecera-pagina";

export type FilaBaremo = {
  readonly candidateId: string;
  readonly fileNumber: string;
  readonly postulanteNombre: string;
  readonly salaLabel: string;
  /** Posición en el ranking interno, si ya hay evaluación aprobada. */
  readonly ranking: number | null;
};

/**
 * Listado de postulantes en evaluación (Paso 1 superado), listos para baremo.
 */
export function ListaBaremo({ items }: { readonly items: readonly FilaBaremo[] }) {
  if (items.length === 0) {
    return (
      <div>
        <EstadoVacio
          titulo="No hay postulantes en baremo"
          detalle="Aparecerán aquí cuando un evaluador declare elegible un expediente en el Paso 1."
        />
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-toga-500">
        <span className="cifra font-medium text-toga-800">{items.length}</span>{" "}
        {items.length === 1 ? "postulante elegible" : "postulantes elegibles"}
      </p>

      <div className="mt-3 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Postulantes en baremo</caption>
          <thead className="border-b-2 border-toga-300 bg-toga-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-toga-700">
                Postulante
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Sala
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Ranking
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {items.map((d) => (
              <tr key={d.candidateId} className="hover:bg-toga-50">
                <th scope="row" className="px-4 py-3 text-left">
                  <p className="font-medium text-toga-900">{d.postulanteNombre}</p>
                  <p className="codigo mt-0.5 text-xs font-normal text-toga-500">{d.fileNumber}</p>
                </th>
                <td className="px-4 py-3 text-toga-600">{d.salaLabel}</td>
                <td className="cifra px-4 py-3 font-semibold text-toga-900">{d.ranking ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/baremo/${d.candidateId}`}
                    className="inline-flex rounded-md bg-balanza-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-balanza-700"
                  >
                    Aplicar baremo
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 space-y-3 lg:hidden">
        {items.map((d) => (
          <li key={d.candidateId}>
            <div className="rounded-lg border border-toga-200 bg-white p-4">
              <p className="font-medium text-toga-900">{d.postulanteNombre}</p>
              <p className="codigo mt-0.5 text-xs text-toga-500">{d.fileNumber}</p>
              <p className="mt-1 text-xs text-toga-500">
                {d.salaLabel} · Ranking <span className="cifra">{d.ranking ?? "—"}</span>
              </p>
              <Link
                href={`/baremo/${d.candidateId}`}
                className="mt-3 inline-flex rounded-md bg-balanza-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-balanza-700"
              >
                Aplicar baremo
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
