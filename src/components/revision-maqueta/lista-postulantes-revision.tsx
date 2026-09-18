"use client";

import Link from "next/link";
import {
  conteoDocsRevision,
  type PostulanteRevisionMock,
} from "@/lib/maqueta-revision-documental";
import { InsigniaEstado } from "@/components/insignias";
import { ConTooltip, TooltipProvider } from "@/components/ui/tooltip";

export function ListaPostulantesRevision({
  items,
}: {
  readonly items: readonly PostulanteRevisionMock[];
}) {
  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop */}
      <div className="mt-3 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Postulantes en revisión documental</caption>
          <thead className="border-b-2 border-toga-300 bg-toga-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Número de expediente del postulante">
                  <button type="button" className="cursor-help font-semibold">
                    Expediente
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Nombre completo del postulante">
                  <button type="button" className="cursor-help font-semibold">
                    Postulante
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Sala a la que se postula">
                  <button type="button" className="cursor-help font-semibold">
                    Sala
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Documentos pendientes de verificar / total cargados">
                  <button type="button" className="cursor-help font-semibold">
                    Docs.
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Etapa del flujo interno">
                  <button type="button" className="cursor-help font-semibold">
                    Etapa
                  </button>
                </ConTooltip>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {items.map((p) => {
              const { total, pendientes } = conteoDocsRevision(p);
              return (
                <tr key={p.id} className="hover:bg-toga-50">
                  <th scope="row" className="codigo px-4 py-3 text-xs font-medium text-toga-600">
                    <ConTooltip texto={`Expediente ${p.fileNumber}`}>
                      <span className="cursor-default">{p.fileNumber}</span>
                    </ConTooltip>
                  </th>
                  <td className="px-4 py-3">
                    <ConTooltip texto={`Revisar documentos de ${p.nombre} ${p.apellido}`}>
                      <Link
                        href={`/revision-documental/${p.id}`}
                        className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
                      >
                        {p.nombre} {p.apellido}
                      </Link>
                    </ConTooltip>
                  </td>
                  <td className="px-4 py-3 text-toga-600">
                    <ConTooltip texto={p.salaLabel}>
                      <span className="cursor-default">{p.salaLabel}</span>
                    </ConTooltip>
                  </td>
                  <td className="cifra px-4 py-3 text-toga-600">
                    <ConTooltip
                      texto={`${pendientes} pendiente${pendientes === 1 ? "" : "s"} de ${total}`}
                    >
                      <span className="cursor-default">
                        <span
                          className={
                            pendientes > 0 ? "font-semibold text-balanza-700" : "text-toga-600"
                          }
                        >
                          {pendientes}
                        </span>
                        <span className="text-toga-400"> / {total}</span>
                      </span>
                    </ConTooltip>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex justify-center">
                      <InsigniaEstado estado="DOCUMENT_REVIEW" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <ul className="mt-3 space-y-3 lg:hidden">
        {items.map((p) => {
          const { total, pendientes } = conteoDocsRevision(p);
          return (
            <li key={p.id}>
              <Link
                href={`/revision-documental/${p.id}`}
                className="block rounded-lg border border-toga-200 bg-white p-4 transition-colors hover:bg-toga-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="codigo text-xs text-toga-500">{p.fileNumber}</p>
                    <p className="mt-0.5 font-medium text-toga-900">
                      {p.nombre} {p.apellido}
                    </p>
                    <p className="mt-1 text-xs text-toga-500">{p.salaLabel}</p>
                  </div>
                  <InsigniaEstado estado="DOCUMENT_REVIEW" />
                </div>
                <p className="mt-3 text-xs text-toga-500">
                  Docs. pendientes:{" "}
                  <span className="cifra font-medium text-toga-800">
                    {pendientes}/{total}
                  </span>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </TooltipProvider>
  );
}
