"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EstadoVacio } from "@/components/cabecera-pagina";
import { listarElegibles, type DecisionElegibilidad } from "@/lib/elegibilidad";
import { ConTooltip, TooltipProvider } from "@/components/ui/tooltip";

/**
 * Listado de postulantes declarados elegibles (Paso 1) listos para baremo.
 */
export function ListaBaremo() {
  const [items, setItems] = useState<readonly DecisionElegibilidad[] | null>(null);

  useEffect(() => {
    setItems(listarElegibles());
  }, []);

  if (items === null) {
    return <p className="mt-6 text-sm text-toga-500">Cargando…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-6">
        <EstadoVacio
          titulo="No hay postulantes en baremo"
          detalle="Aparecerán aquí cuando un evaluador declare elegible un expediente en el Paso 1."
        />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <p className="mt-6 text-sm text-toga-500">
        <span className="cifra font-medium text-toga-800">{items.length}</span>{" "}
        {items.length === 1 ? "postulante elegible" : "postulantes elegibles"}
      </p>

      <div className="mt-3 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Postulantes en baremo</caption>
          <thead className="border-b-2 border-toga-300 bg-toga-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Expediente
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Postulante
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Sala
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Declarado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {items.map((d) => (
              <tr key={d.candidateId} className="hover:bg-toga-50">
                <th scope="row" className="codigo px-4 py-3 text-xs font-medium text-toga-600">
                  {d.resumen.fileNumber}
                </th>
                <td className="px-4 py-3">
                  <ConTooltip texto="Abrir baremo de puntuación">
                    <Link
                      href={`/baremo/${d.candidateId}`}
                      className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
                    >
                      {d.resumen.postulanteNombre}
                    </Link>
                  </ConTooltip>
                </td>
                <td className="px-4 py-3 text-toga-600">{d.resumen.salaLabel}</td>
                <td className="px-4 py-3 text-xs text-toga-500">
                  {new Date(d.actualizadoEn).toLocaleString("es-VE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 space-y-3 lg:hidden">
        {items.map((d) => (
          <li key={d.candidateId}>
            <Link
              href={`/baremo/${d.candidateId}`}
              className="block rounded-lg border border-toga-200 bg-white p-4 hover:bg-toga-50"
            >
              <p className="codigo text-xs text-toga-500">{d.resumen.fileNumber}</p>
              <p className="mt-0.5 font-medium text-toga-900">{d.resumen.postulanteNombre}</p>
              <p className="mt-1 text-xs text-toga-500">{d.resumen.salaLabel}</p>
            </Link>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
}
