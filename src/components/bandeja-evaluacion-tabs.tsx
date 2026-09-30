"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, FileText } from "lucide-react";
import type {
  Chamber,
  ReopenCommitteeReason,
  RondaEscaladaLista,
  WorkflowStatus,
} from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import { reabrirRondaEscalada } from "@/app/(panel)/comite/acciones";
import { EstadoVacio } from "@/components/cabecera-pagina";
import { FichaDescalificacionVista } from "@/components/ficha-descalificacion";
import { InformeFichaDescalificacion } from "@/components/informe-ficha-descalificacion";
import { InsigniaEstado } from "@/components/insignias";
import { useToast } from "@/components/toast-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConTooltip, TooltipProvider } from "@/components/ui/tooltip";
import { type DecisionElegibilidad, type FichaDescalificacion } from "@/lib/elegibilidad";

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
  readonly reopenedReason?: ReopenCommitteeReason | null;
};

/**
 * Bandeja de evaluación: pendientes de elegibilidad e inelegibles.
 * Quien ya fue declarado elegible no se lista aquí: sigue en Baremo.
 */
export function BandejaEvaluacionTabs({
  pendientes,
  inelegibles,
  escaladas = [],
  puedeResolverEscaladas = false,
}: {
  readonly pendientes: readonly PendienteEvaluacion[];
  readonly inelegibles: readonly DecisionElegibilidad[];
  readonly escaladas?: readonly RondaEscaladaLista[];
  readonly puedeResolverEscaladas?: boolean;
}) {
  const [fichaAbierta, setFichaAbierta] = useState<FichaDescalificacion | null>(null);
  const [informeDe, setInformeDe] = useState<{
    readonly candidateId: string;
    readonly nombre: string;
  } | null>(null);

  const defaultTab =
    puedeResolverEscaladas && escaladas.length > 0 ? "escaladas" : "pendientes";

  return (
    <>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList aria-label="Bandejas de evaluación">
          <TabsTrigger value="pendientes">
            Pendientes por evaluar
            <span className="cifra ml-1.5 text-xs text-toga-500">({pendientes.length})</span>
          </TabsTrigger>
          {puedeResolverEscaladas && (
            <TabsTrigger value="escaladas">
              Escaladas
              <span className="cifra ml-1.5 text-xs text-toga-500">({escaladas.length})</span>
            </TabsTrigger>
          )}
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

        {puedeResolverEscaladas && (
          <TabsContent value="escaladas">
            {escaladas.length === 0 ? (
              <EstadoVacio
                titulo="No hay rondas escaladas"
                detalle="Aparecen aquí cuando hay empate en votos decisivos o vence el plazo sin resolverse el quorum. Solo se pueden reabrir (no hay dictamen administrativo)."
              />
            ) : (
              <TablaEscaladas items={escaladas} />
            )}
          </TabsContent>
        )}

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
              onInforme={(candidateId, nombre) => setInformeDe({ candidateId, nombre })}
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
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) setFichaAbierta(null);
          }}
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
            <FichaDescalificacionVista ficha={fichaAbierta} />
          </div>
        </div>
      )}

      {informeDe && (
        <InformeFichaDescalificacion
          candidateId={informeDe.candidateId}
          nombre={informeDe.nombre}
          onCerrar={() => setInformeDe(null)}
        />
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
  readonly onInforme: (candidateId: string, nombre: string) => void;
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
                      <ConTooltip texto="Ver el informe de descalificación">
                        <button
                          type="button"
                          onClick={() => onInforme(d.candidateId, d.resumen.postulanteNombre)}
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
            <li key={d.candidateId} className="rounded-lg border border-toga-200 bg-white p-4">
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
                  onClick={() => onInforme(d.candidateId, d.resumen.postulanteNombre)}
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
                <tr
                  key={c.id}
                  className={
                    c.reopenedReason
                      ? "bg-balanza-50/60 hover:bg-balanza-50"
                      : "hover:bg-toga-50"
                  }
                >
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
                    {c.reopenedReason ? (
                      <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-wide text-balanza-700">
                        {c.reopenedReason === "TIE"
                          ? "Reabierta — empate"
                          : "Reabierta — plazo"}
                      </span>
                    ) : null}
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
              className={`block rounded-lg border p-4 hover:bg-toga-50 ${
                c.reopenedReason
                  ? "border-balanza-600/40 bg-balanza-50/50"
                  : "border-toga-200 bg-white"
              }`}
            >
              <p className="codigo text-xs text-toga-500">{c.submissions[0]?.fileNumber ?? "—"}</p>
              <p className="mt-0.5 font-medium text-toga-900">
                {c.firstName} {c.lastName}
              </p>
              {c.reopenedReason ? (
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-balanza-700">
                  {c.reopenedReason === "TIE" ? "Reabierta — empate" : "Reabierta — plazo"}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-toga-500">{SALA_ETIQUETA[c.chamber] ?? c.chamber}</p>
            </Link>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
}

function reasonDeResult(result: unknown): ReopenCommitteeReason | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const reason = (result as { reason?: unknown }).reason;
  return reason === "TIE" || reason === "DEADLINE" ? reason : null;
}

function motivoCorto(result: unknown): string {
  const reason = reasonDeResult(result);
  if (reason === "TIE") return "Empate en votos decisivos";
  if (reason === "DEADLINE") return "Plazo vencido sin resolver el quorum";
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return "Requiere reapertura administrativa";
  }
  const motivo = (result as { motivo?: unknown }).motivo;
  return typeof motivo === "string" && motivo.trim()
    ? motivo
    : "Requiere reapertura administrativa";
}

function TablaEscaladas({ items }: { readonly items: readonly RondaEscaladaLista[] }) {
  const toast = useToast();
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  function reabrir(roundId: string, candidateId: string, reason: ReopenCommitteeReason) {
    iniciar(async () => {
      const r = await reabrirRondaEscalada(roundId, candidateId, reason);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo reabrir");
        return;
      }
      toast.exito(r.exito ?? "Ronda reabierta.");
      router.refresh();
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Rondas de elegibilidad escaladas</caption>
          <thead className="border-b-2 border-toga-300 bg-toga-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Expediente
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Postulante
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Motivo
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {items.map((r) => {
              const fileNumber = r.candidate.submissions[0]?.fileNumber ?? "—";
              const reason = reasonDeResult(r.result);
              return (
                <tr key={r.id} className="hover:bg-toga-50">
                  <th scope="row" className="codigo px-4 py-3 text-xs font-medium text-toga-600">
                    {fileNumber}
                  </th>
                  <td className="px-4 py-3 font-medium text-toga-900">
                    {r.candidate.firstName} {r.candidate.lastName}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-left text-xs text-toga-600">
                    {motivoCorto(r.result)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Link
                        href={`/evaluacion/${r.candidateId}`}
                        className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-medium text-toga-700 hover:bg-toga-50"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        disabled={pendiente || reason === "DEADLINE"}
                        onClick={() => reabrir(r.id, r.candidateId, "TIE")}
                        className="rounded-md border border-balanza-600/40 px-3 py-1.5 text-xs font-semibold text-balanza-700 hover:bg-balanza-50 disabled:opacity-40"
                      >
                        Reabrir por empate
                      </button>
                      <button
                        type="button"
                        disabled={pendiente || reason === "TIE"}
                        onClick={() => reabrir(r.id, r.candidateId, "DEADLINE")}
                        className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-50 disabled:opacity-40"
                      >
                        Reabrir por plazo
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {items.map((r) => {
          const reason = reasonDeResult(r.result);
          return (
            <li key={r.id} className="rounded-lg border border-toga-200 bg-white p-4">
              <p className="codigo text-xs text-toga-500">
                {r.candidate.submissions[0]?.fileNumber ?? "—"}
              </p>
              <p className="mt-0.5 font-medium text-toga-900">
                {r.candidate.firstName} {r.candidate.lastName}
              </p>
              <p className="mt-1 text-xs text-toga-600">{motivoCorto(r.result)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/evaluacion/${r.candidateId}`}
                  className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-medium text-toga-700"
                >
                  Ver
                </Link>
                <button
                  type="button"
                  disabled={pendiente || reason === "DEADLINE"}
                  onClick={() => reabrir(r.id, r.candidateId, "TIE")}
                  className="rounded-md border border-balanza-600/40 px-3 py-1.5 text-xs font-semibold text-balanza-700 disabled:opacity-40"
                >
                  Empate
                </button>
                <button
                  type="button"
                  disabled={pendiente || reason === "TIE"}
                  onClick={() => reabrir(r.id, r.candidateId, "DEADLINE")}
                  className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 disabled:opacity-40"
                >
                  Plazo
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </TooltipProvider>
  );
}
