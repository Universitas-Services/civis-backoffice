"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import type { Chamber, WorkflowStatus } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import { EstadoVacio } from "@/components/cabecera-pagina";
import {
  FichaDescalificacionVista,
  imprimirFichaDescalificacion,
} from "@/components/ficha-descalificacion";
import { InsigniaEstado } from "@/components/insignias";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConTooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
  type DecisionElegibilidad,
  type FichaDescalificacion,
} from "@/lib/elegibilidad";

export type PendienteEvaluacion = {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly chamber: Chamber;
  readonly workflowStatus: WorkflowStatus;
  readonly receivedAt: string;
  readonly submissions: readonly {
    readonly fileNumber: string;
    readonly _count: { readonly documents: number };
  }[];
  readonly _count: { readonly objections: number };
};

/**
 * Bandeja de evaluación: pendientes de elegibilidad e inelegibles.
 * Quien ya fue declarado elegible no se lista aquí: sigue en Baremo.
 */
export function BandejaEvaluacionTabs({
  pendientes,
  inelegibles,
}: {
  readonly pendientes: readonly PendienteEvaluacion[];
  readonly inelegibles: readonly DecisionElegibilidad[];
}) {
  const [fichaAbierta, setFichaAbierta] = useState<FichaDescalificacion | null>(null);

  return (
    <>
      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList aria-label="Bandejas de evaluación">
          <TabsTrigger value="pendientes">
            Pendientes por evaluar
            <span className="cifra ml-1.5 text-xs text-toga-500">({pendientes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="inelegibles">
            Inelegibles
            <span className="cifra ml-1.5 text-xs text-toga-500">({inelegibles.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes">
          {pendientes.length === 0 ? (
            <EstadoVacio
              titulo="No hay expedientes esperando evaluación"
              detalle="Aparecerán aquí cuando pasen la revisión documental."
            />
          ) : (
            <TablaPendientes items={pendientes} />
          )}
        </TabsContent>

        <TabsContent value="inelegibles">
          {inelegibles.length === 0 ? (
            <EstadoVacio
              titulo="No hay dictámenes de inelegibilidad"
              detalle="Cuando declare inelegible a un postulante en el Paso 1, el dictamen aparecerá aquí."
            />
          ) : (
            <TablaInelegibles
              items={inelegibles}
              onVerFicha={(f) => setFichaAbierta(f)}
              onInforme={(f) => imprimirFichaDescalificacion(f)}
            />
          )}
        </TabsContent>
      </Tabs>

      {fichaAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-toga-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-ficha-inelegible"
        >
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-lg border border-toga-200 bg-white p-5 shadow-lg sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="titulo-ficha-inelegible" className="sr-only">
                Detalle de inelegibilidad
              </h2>
              <button
                type="button"
                onClick={() => setFichaAbierta(null)}
                className="ml-auto rounded-md border border-toga-300 px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50"
              >
                Cerrar
              </button>
            </div>
            <FichaDescalificacionVista
              ficha={fichaAbierta}
              onGenerarInforme={() => imprimirFichaDescalificacion(fichaAbierta)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function TablaInelegibles({
  items,
  onVerFicha,
  onInforme,
}: {
  readonly items: readonly DecisionElegibilidad[];
  readonly onVerFicha: (f: FichaDescalificacion) => void;
  readonly onInforme: (f: FichaDescalificacion) => void;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Postulantes declarados inelegibles</caption>
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
                Dictamen
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {items.map((d) => {
              const ficha = d.ficha;
              if (!ficha) return null;
              return (
                <tr key={d.candidateId} className="hover:bg-toga-50">
                  <th scope="row" className="codigo px-4 py-3 text-xs font-medium text-toga-600">
                    {d.resumen.fileNumber}
                  </th>
                  <td className="px-4 py-3 font-medium text-toga-900">
                    {d.resumen.postulanteNombre}
                  </td>
                  <td className="px-4 py-3 text-toga-600">{d.resumen.salaLabel}</td>
                  <td className="px-4 py-3 text-xs text-toga-500">
                    {new Date(d.actualizadoEn).toLocaleString("es-VE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex flex-wrap justify-center gap-1">
                      <ConTooltip texto="Ver detalle de inelegibilidad">
                        <button
                          type="button"
                          onClick={() => onVerFicha(ficha)}
                          className="inline-flex items-center gap-1 rounded-md border border-toga-300 bg-white px-2.5 py-1.5 text-xs font-medium text-toga-700 hover:bg-toga-50"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Detalle
                        </button>
                      </ConTooltip>
                      <ConTooltip texto="Generar informe del dictamen">
                        <button
                          type="button"
                          onClick={() => onInforme(ficha)}
                          className="inline-flex items-center gap-1 rounded-md border border-toga-300 bg-white px-2.5 py-1.5 text-xs font-medium text-toga-700 hover:bg-toga-50"
                        >
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          Informe
                        </button>
                      </ConTooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {items.map((d) => {
          const ficha = d.ficha;
          if (!ficha) return null;
          return (
            <li
              key={d.candidateId}
              className="rounded-lg border border-toga-200 bg-white p-4"
            >
              <p className="codigo text-xs text-toga-500">{d.resumen.fileNumber}</p>
              <p className="mt-0.5 font-medium text-toga-900">{d.resumen.postulanteNombre}</p>
              <p className="mt-1 text-xs text-toga-500">{d.resumen.salaLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onVerFicha(ficha)}
                  className="inline-flex items-center gap-1 rounded-md border border-toga-300 px-3 py-1.5 text-xs font-medium text-toga-700"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Detalle
                </button>
                <button
                  type="button"
                  onClick={() => onInforme(ficha)}
                  className="inline-flex items-center gap-1 rounded-md border border-toga-300 px-3 py-1.5 text-xs font-medium text-toga-700"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Informe
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </TooltipProvider>
  );
}

function TablaPendientes({ items }: { readonly items: readonly PendienteEvaluacion[] }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Expedientes pendientes por evaluar</caption>
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
                Docs.
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Obj.
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Etapa
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {items.map((c) => {
              const fileNumber = c.submissions[0]?.fileNumber ?? "—";
              const docs = c.submissions[0]?._count.documents ?? 0;
              const objs = c._count.objections;

              return (
                <tr key={c.id} className="hover:bg-toga-50">
                  <th scope="row" className="codigo px-4 py-3 text-xs font-medium text-toga-600">
                    {fileNumber}
                  </th>
                  <td className="px-4 py-3">
                    <Link
                      href={`/evaluacion/${c.id}`}
                      className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
                    >
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-toga-600">
                    {SALA_ETIQUETA[c.chamber] ?? c.chamber}
                  </td>
                  <td className="cifra px-4 py-3 text-toga-600">{docs}</td>
                  <td className="cifra px-4 py-3">
                    {objs > 0 ? (
                      <span className="font-semibold text-balanza-700">{objs}</span>
                    ) : (
                      <span className="text-toga-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex justify-center">
                      <InsigniaEstado estado={c.workflowStatus} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {items.map((c) => (
          <li key={c.id}>
            <Link
              href={`/evaluacion/${c.id}`}
              className="block rounded-lg border border-toga-200 bg-white p-4 hover:bg-toga-50"
            >
              <p className="codigo text-xs text-toga-500">
                {c.submissions[0]?.fileNumber ?? "—"}
              </p>
              <p className="mt-0.5 font-medium text-toga-900">
                {c.firstName} {c.lastName}
              </p>
              <p className="mt-1 text-xs text-toga-500">
                {SALA_ETIQUETA[c.chamber] ?? c.chamber}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
}
