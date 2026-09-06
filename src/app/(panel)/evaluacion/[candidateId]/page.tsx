import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CriterioBaremo, Evaluacion, ExpedienteDetalle } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { PantallaEvaluacion } from "@/components/pantalla-evaluacion";

export const metadata: Metadata = { title: "Evaluación" };

interface Baremo {
  readonly version: string;
  readonly criteria: readonly CriterioBaremo[];
}

export default async function Evaluar({
  params,
}: {
  readonly params: Promise<{ candidateId: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "EVALUATOR");
  const { candidateId } = await params;

  let expediente: ExpedienteDetalle;
  let evaluacion: Evaluacion & { rubric: Baremo };
  try {
    expediente = await llamarApi<ExpedienteDetalle>(`/internal/candidates/${candidateId}`);
    // Abre el borrador o recupera el existente. Falla si el expediente no
    // pasó la revisión documental: esa regla vive en la API, no aquí.
    evaluacion = await llamarApi<Evaluacion & { rubric: Baremo }>(
      `/internal/evaluations/candidate/${candidateId}/draft`,
      { method: "POST" },
    );
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/evaluacion");
    if (error instanceof ErrorApi && error.status === 404) notFound();
    if (error instanceof ErrorApi) {
      return (
        <div className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-xl rounded-lg border border-balanza-600/25 bg-balanza-50 p-6">
            <h1 className="text-base font-semibold text-toga-900">No se puede evaluar todavía</h1>
            <p className="mt-2 text-sm leading-relaxed text-toga-700">{error.message}</p>
          </div>
        </div>
      );
    }
    throw error;
  }

  return (
    <PantallaEvaluacion
      expediente={expediente}
      evaluacion={evaluacion}
      criterios={evaluacion.rubric.criteria ?? []}
      usuarioId={usuario.id}
    />
  );
}
