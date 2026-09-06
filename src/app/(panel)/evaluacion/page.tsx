import Link from "next/link";
import type { Metadata } from "next";
import type { Chamber, WorkflowStatus } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { InsigniaEstado } from "@/components/insignias";

export const metadata: Metadata = { title: "Evaluación" };

interface Bandeja {
  readonly pendientes: readonly {
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
  }[];
  readonly misEvaluaciones: readonly {
    readonly id: string;
    readonly status: string;
    readonly totalPoints: string;
    readonly candidate: {
      readonly id: string;
      readonly firstName: string;
      readonly lastName: string;
    };
  }[];
}

export default async function BandejaEvaluacion() {
  await exigirRol("SUPER_ADMIN", "EVALUATOR");

  let bandeja: Bandeja;
  try {
    bandeja = await llamarApi<Bandeja>("/internal/evaluations/inbox");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/evaluacion");
    throw error;
  }

  const conObjeciones = bandeja.pendientes.filter((c) => c._count.objections > 0);

  return (
    <>
      <CabeceraPagina
        titulo="Casos asignados"
        descripcion="Expedientes que pasaron la revisión documental y esperan evaluación técnica."
      />

      <div className="space-y-8 px-5 py-6 sm:px-8">
        {/* Alerta de objeciones: obliga a mirarlas antes de calificar. */}
        {conObjeciones.length > 0 && (
          <section
            aria-labelledby="alertas"
            className="rounded-lg border border-balanza-600/25 bg-balanza-50 p-5"
          >
            <h2 id="alertas" className="text-sm font-semibold text-toga-900">
              <span aria-hidden="true" className="mr-1.5">
                ⚑
              </span>
              {conObjeciones.length}{" "}
              {conObjeciones.length === 1 ? "expediente tiene" : "expedientes tienen"} objeciones
              ciudadanas
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-toga-700">
              Revise la objeción antes de emitir la calificación. Recuerde que una objeción no
              cambia el puntaje por sí sola: requiere resolución motivada y aprobada.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {conObjeciones.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/objeciones?candidato=${c.id}`}
                    className="inline-flex items-center gap-2 rounded-md border border-balanza-600/30 bg-white px-3 py-1.5 text-sm text-toga-800 hover:bg-toga-50"
                  >
                    {c.firstName} {c.lastName}
                    <span className="cifra rounded-full bg-balanza-600 px-1.5 text-xs font-semibold text-white">
                      {c._count.objections}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Evaluaciones propias en curso */}
        {bandeja.misEvaluaciones.length > 0 && (
          <section aria-labelledby="mias">
            <h2 id="mias" className="text-base font-semibold text-toga-900">
              Mis evaluaciones en curso
            </h2>
            <ul className="mt-3 space-y-2">
              {bandeja.misEvaluaciones.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/evaluacion/${e.candidate.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-toga-200 bg-white px-4 py-3 hover:bg-toga-50"
                  >
                    <span className="font-medium text-toga-900">
                      {e.candidate.firstName} {e.candidate.lastName}
                    </span>
                    <span className="flex items-center gap-3 text-sm">
                      <span className="cifra text-toga-600">{Number(e.totalPoints)} pts</span>
                      <span className="rounded-full bg-toga-100 px-2.5 py-1 text-xs font-medium text-toga-600">
                        {e.status === "DRAFT" ? "Borrador" : "Enviada"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Bandeja priorizada: lo más antiguo primero */}
        <section aria-labelledby="pendientes">
          <h2 id="pendientes" className="text-base font-semibold text-toga-900">
            Pendientes por evaluar
          </h2>
          <p className="mt-1 text-sm text-toga-500">
            Ordenados por antigüedad: un expediente sin atender envejece mal.
          </p>

          {bandeja.pendientes.length === 0 ? (
            <div className="mt-3">
              <EstadoVacio
                titulo="No hay expedientes esperando evaluación"
                detalle="Aparecerán aquí cuando secretaría los envíe y pasen la revisión documental."
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {bandeja.pendientes.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/evaluacion/${c.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-toga-200 bg-white px-4 py-3 hover:bg-toga-50"
                  >
                    <span className="codigo text-xs text-toga-500">
                      {c.submissions[0]?.fileNumber ?? "—"}
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-toga-900">
                      {c.firstName} {c.lastName}
                      {c._count.objections > 0 && (
                        <span
                          className="ml-2 text-balanza-700"
                          title={`${c._count.objections} objeciones`}
                        >
                          <span aria-hidden="true">⚑</span>
                          <span className="sr-only">
                            {c._count.objections} objeciones pendientes de revisar
                          </span>
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-toga-600">{SALA_ETIQUETA[c.chamber]}</span>
                    <span className="cifra text-xs text-toga-500">
                      {c.submissions[0]?._count.documents ?? 0} docs.
                    </span>
                    <InsigniaEstado estado={c.workflowStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
