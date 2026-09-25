import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ExpedienteDetalle } from "@/contracts";
import {
  PantallaAplicarBaremo,
  type EvaluacionBaremoVista,
} from "@/components/pantalla-aplicar-baremo";
import { DeclararInelegible } from "@/components/declarar-inelegible";
import { InformeObjeciones } from "@/components/informe-objeciones";
import { ModalObjeciones, type ObjecionVista } from "@/components/modal-objeciones";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";

export const metadata: Metadata = { title: "Ajustar baremo" };

interface ResumenObjecion extends ObjecionVista {
  readonly status: string;
}

export default async function AjustarBaremo({
  params,
}: {
  readonly params: Promise<{ candidateId: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "EVALUATOR");
  const { candidateId } = await params;

  let expediente: ExpedienteDetalle;
  let resumen: { fullName: string; items: readonly ResumenObjecion[] };
  let historial: EvaluacionBaremoVista[];
  try {
    [expediente, resumen, historial] = await Promise.all([
      llamarApi<ExpedienteDetalle>(`/internal/candidates/${candidateId}`),
      llamarApi<{ fullName: string; items: readonly ResumenObjecion[] }>(
        `/internal/objections/candidate/${candidateId}/resumen`,
      ),
      llamarApi<EvaluacionBaremoVista[]>(`/internal/evaluations/history/${candidateId}`),
    ]);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/objeciones/baremo/${candidateId}`);
    if (error instanceof ErrorApi && error.status === 404) notFound();
    if (error instanceof ErrorApi) return aviso("No se puede ajustar el baremo", error.message);
    throw error;
  }

  if (resumen.items.length === 0) {
    return aviso(
      "No se puede ajustar el baremo",
      "La puntuación solo se modifica si el postulante tiene objeciones.",
    );
  }

  const evaluacion = historial.find((e) => e.status === "APPROVED" && e.baremoCongelado) ?? null;
  if (!evaluacion?.baremoCongelado) {
    return aviso(
      "No se puede ajustar el baremo",
      "Este postulante no tiene un baremo guardado para corregir.",
    );
  }

  return (
    <>
      <PantallaAplicarBaremo
        expediente={expediente}
        evaluacion={evaluacion}
        puedeEditar
        accionCabecera={
          <ModalObjeciones key="objeciones" nombre={resumen.fullName} items={resumen.items} />
        }
        accionExtra={
          <DeclararInelegible
            key="inelegible"
            evaluationId={evaluacion.id}
            nombre={resumen.fullName}
            yaInelegible={evaluacion.ineligible === true}
          />
        }
      />
      <InformeObjeciones candidateId={candidateId} nombrePostulante={resumen.fullName} />
    </>
  );
}

function aviso(titulo: string, detalle: string) {
  return (
    <div className="px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-xl rounded-lg border border-balanza-600/25 bg-balanza-50 p-6">
        <h1 className="text-base font-semibold text-toga-900">{titulo}</h1>
        <p className="mt-2 text-sm leading-relaxed text-toga-700">{detalle}</p>
      </div>
    </div>
  );
}
