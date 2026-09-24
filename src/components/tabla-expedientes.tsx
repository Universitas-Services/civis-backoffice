"use client";

import Link from "next/link";
import type { ExpedienteListado, SuitabilityBand, WorkflowStatus } from "@/contracts";
import { ESTADO_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { InsigniaEstado } from "@/components/insignias";
import { ConTooltip, TooltipProvider } from "@/components/ui/tooltip";

const BANDA_CORTA: Record<SuitabilityBand, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
  INELIGIBLE: "Inhab.",
};

const BANDA_LARGA: Record<SuitabilityBand, string> = {
  HIGH: "Altamente idóneo",
  MEDIUM: "Idóneo medio",
  LOW: "Insuficiente",
  INELIGIBLE: "Inhabilitado",
};

export function TablaExpedientes({ items }: { readonly items: readonly ExpedienteListado[] }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="mt-3 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Expedientes registrados</caption>
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
                <ConTooltip texto="Sala del Tribunal Supremo a la que se postula">
                  <button type="button" className="cursor-help font-semibold">
                    Sala
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Etapa actual del flujo interno">
                  <button type="button" className="cursor-help font-semibold">
                    Etapa
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Cantidad de documentos cargados en el expediente">
                  <button type="button" className="cursor-help font-semibold">
                    Docs.
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Objeciones asociadas a este postulante">
                  <button type="button" className="cursor-help font-semibold">
                    Obj.
                  </button>
                </ConTooltip>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <ConTooltip texto="Puntaje total y banda de idoneidad de la evaluación vigente">
                  <button type="button" className="cursor-help font-semibold">
                    Evaluación
                  </button>
                </ConTooltip>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {items.map((e) => {
              const evaluacion = e.evaluations[0];
              const banda: SuitabilityBand | null = evaluacion
                ? evaluacion.ineligible
                  ? "INELIGIBLE"
                  : (evaluacion.band as SuitabilityBand)
                : null;
              const docs = e.submissions[0]?._count.documents ?? 0;
              const objs = e._count.objections;
              const fileNumber = e.submissions[0]?.fileNumber ?? "—";

              return (
                <tr key={e.id} className="hover:bg-toga-50">
                  <th scope="row" className="codigo px-4 py-3 text-xs font-medium text-toga-600">
                    <ConTooltip texto={`Expediente ${fileNumber}`}>
                      <span className="cursor-default">{fileNumber}</span>
                    </ConTooltip>
                  </th>
                  <td className="px-4 py-3">
                    <ConTooltip texto={`Abrir ficha de ${e.firstName} ${e.lastName}`}>
                      <Link
                        href={`/expedientes/${e.id}`}
                        className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
                      >
                        {e.firstName} {e.lastName}
                      </Link>
                    </ConTooltip>
                  </td>
                  <td className="px-4 py-3 text-toga-600">
                    <ConTooltip texto={SALA_ETIQUETA[e.chamber] ?? String(e.chamber)}>
                      <span className="cursor-default">
                        {SALA_ETIQUETA[e.chamber] ?? e.chamber}
                      </span>
                    </ConTooltip>
                  </td>
                  <td className="px-4 py-3">
                    <ConTooltip
                      texto={`Etapa: ${ESTADO_ETIQUETA[e.workflowStatus as WorkflowStatus] ?? e.workflowStatus}`}
                    >
                      <span className="inline-flex cursor-default justify-center">
                        <InsigniaEstado estado={e.workflowStatus as WorkflowStatus} />
                      </span>
                    </ConTooltip>
                  </td>
                  <td className="cifra px-4 py-3 text-toga-600">
                    <ConTooltip
                      texto={docs === 1 ? "1 documento cargado" : `${docs} documentos cargados`}
                    >
                      <span className="cursor-default">{docs}</span>
                    </ConTooltip>
                  </td>
                  <td className="cifra px-4 py-3">
                    <ConTooltip
                      texto={
                        objs === 0
                          ? "Sin objeciones"
                          : objs === 1
                            ? "1 objeción"
                            : `${objs} objeciones`
                      }
                    >
                      <span className="cursor-default">
                        {objs > 0 ? (
                          <span className="font-semibold text-balanza-700">{objs}</span>
                        ) : (
                          <span className="text-toga-400">—</span>
                        )}
                      </span>
                    </ConTooltip>
                  </td>
                  <td className="px-4 py-3">
                    {evaluacion && banda ? (
                      <ConTooltip
                        texto={`${Number(evaluacion.totalPoints)} puntos · ${BANDA_LARGA[banda]}`}
                      >
                        <span className="inline-flex cursor-default flex-col items-center leading-tight">
                          <span className="cifra text-base font-semibold text-toga-900">
                            {Number(evaluacion.totalPoints)}
                          </span>
                          <span className="text-[0.7rem] font-medium text-toga-500">
                            {BANDA_CORTA[banda]}
                          </span>
                        </span>
                      </ConTooltip>
                    ) : (
                      <ConTooltip texto="Aún no hay evaluación vigente">
                        <span className="cursor-default text-xs text-toga-400">—</span>
                      </ConTooltip>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
