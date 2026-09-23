import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ExpedienteDetalle } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { PantallaElegibilidad } from "@/components/pantalla-elegibilidad";

export const metadata: Metadata = { title: "Elegibilidad" };

export default async function EvaluarElegibilidad({
  params,
}: {
  readonly params: Promise<{ candidateId: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "EVALUATOR");
  const { candidateId } = await params;

  let expediente: ExpedienteDetalle;
  try {
    expediente = await llamarApi<ExpedienteDetalle>(`/internal/candidates/${candidateId}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/evaluacion");
    if (error instanceof ErrorApi && error.status === 404) notFound();
    if (error instanceof ErrorApi) {
      return (
        <div className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-xl rounded-lg border border-balanza-600/25 bg-balanza-50 p-6">
            <h1 className="text-base font-semibold text-toga-900">
              No se puede abrir la elegibilidad
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-toga-700">{error.message}</p>
          </div>
        </div>
      );
    }
    throw error;
  }

  const nombre = usuario.fullName?.trim() || usuario.email || "Evaluador";

  return (
    <PantallaElegibilidad
      expediente={expediente}
      evaluador={{ id: usuario.id, nombre }}
    />
  );
}
