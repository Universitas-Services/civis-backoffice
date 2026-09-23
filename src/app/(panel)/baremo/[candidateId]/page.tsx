import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CriterioBaremo, Evaluacion, ExpedienteDetalle } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { PantallaEvaluacion } from "@/components/pantalla-evaluacion";
import { GuardBaremoElegible } from "@/components/guard-baremo-elegible";

export const metadata: Metadata = { title: "Baremo — puntuación" };

interface Baremo {
  readonly version: string;
  readonly criteria: readonly CriterioBaremo[];
}

export default async function BaremoDetalle({
  params,
}: {
  readonly params: Promise<{ candidateId: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");
  const { candidateId } = await params;

  let expediente: ExpedienteDetalle;
  let evaluacion: Evaluacion & { rubric: Baremo };
  try {
    expediente = await llamarApi<ExpedienteDetalle>(`/internal/candidates/${candidateId}`);
    evaluacion = await llamarApi<Evaluacion & { rubric: Baremo }>(
      `/internal/evaluations/candidate/${candidateId}/draft`,
      { method: "POST" },
    );
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/baremo");
    if (error instanceof ErrorApi && error.status === 404) notFound();
    if (error instanceof ErrorApi) {
      return (
        <div className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-xl rounded-lg border border-balanza-600/25 bg-balanza-50 p-6">
            <h1 className="text-base font-semibold text-toga-900">No se puede abrir el baremo</h1>
            <p className="mt-2 text-sm leading-relaxed text-toga-700">{error.message}</p>
          </div>
        </div>
      );
    }
    throw error;
  }

  return (
    <GuardBaremoElegible candidateId={candidateId}>
      <PantallaEvaluacion
        expediente={expediente}
        evaluacion={evaluacion}
        criterios={evaluacion.rubric.criteria ?? []}
        usuarioId={usuario.id}
      />
    </GuardBaremoElegible>
  );
}
