import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AjustesPortal, ExpedienteDetalle, RondaComiteAbierta } from "@/contracts";
import {
  PantallaAplicarBaremo,
  type EvaluacionBaremoVista,
} from "@/components/pantalla-aplicar-baremo";
import { DeclararInelegible } from "@/components/declarar-inelegible";
import { InformeObjeciones } from "@/components/informe-objeciones";
import { ModalObjeciones, type ObjecionVista } from "@/components/modal-objeciones";
import { PanelRondaComite } from "@/components/panel-ronda-comite";
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
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");
  const { candidateId } = await params;
  const puedeAbrirRonda = usuario.roles.some((rol) => rol === "SUPER_ADMIN" || rol === "ADMIN");

  let expediente: ExpedienteDetalle;
  let resumen: { fullName: string; items: readonly ResumenObjecion[] };
  let historial: EvaluacionBaremoVista[];
  let portal: AjustesPortal = {
    objectionsOpen: false,
    evaluationMode: "INDIVIDUAL",
    maxActiveEvaluators: 7,
    quorumThreshold: 5,
    roundDeadlineDays: 5,
  };
  try {
    [expediente, resumen, historial, portal] = await Promise.all([
      llamarApi<ExpedienteDetalle>(`/internal/candidates/${candidateId}`),
      llamarApi<{ fullName: string; items: readonly ResumenObjecion[] }>(
        `/internal/objections/candidate/${candidateId}/resumen`,
      ),
      llamarApi<EvaluacionBaremoVista[]>(`/internal/evaluations/history/${candidateId}`),
      llamarApi<AjustesPortal>("/public/portal").catch(() => portal),
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

  const modoComite = portal.evaluationMode === "COMMITTEE";

  let ronda: RondaComiteAbierta | null = null;
  if (modoComite) {
    try {
      ronda = await llamarApi<RondaComiteAbierta | null>(
        `/internal/committee/rounds/${candidateId}/open`,
      );
    } catch {
      ronda = null;
    }
  }

  // Individual: edita la APPROVED. Comité: borrador/enviado propio en ronda OBJECTION.
  let evaluacion =
    historial.find((e) => e.status === "APPROVED" && e.baremoCongelado) ?? null;

  if (modoComite) {
    const mio =
      historial.find(
        (e) =>
          e.evaluatorId === usuario.id &&
          e.baremoCongelado &&
          (e.status === "DRAFT" || e.status === "SUBMITTED"),
      ) ?? null;
    if (mio) {
      evaluacion = mio;
    } else if (ronda?.kind === "OBJECTION") {
      try {
        evaluacion = await llamarApi<EvaluacionBaremoVista>(
          `/internal/evaluations/candidate/${candidateId}/draft`,
          { method: "POST" },
        );
      } catch (error) {
        if (error instanceof ErrorApi) {
          return aviso("No se puede ajustar el baremo", error.message);
        }
        throw error;
      }
    }
  }

  if (!evaluacion?.baremoCongelado) {
    return aviso(
      "No se puede ajustar el baremo",
      modoComite
        ? "Abra la ronda de objeción (ADMIN) o espere a que exista un baremo consolidado."
        : "Este postulante no tiene un baremo guardado para corregir.",
    );
  }

  const abstuvo =
    modoComite &&
    ronda?.participants.find((p) => p.evaluatorId === usuario.id)?.action === "ABSTAINED";

  const puedeEditar = modoComite
    ? !abstuvo &&
      (evaluacion.status === "DRAFT" || evaluacion.status === "SUBMITTED") &&
      evaluacion.evaluatorId === usuario.id
    : true;

  return (
    <>
      <PantallaAplicarBaremo
        expediente={expediente}
        evaluacion={evaluacion}
        puedeEditar={puedeEditar}
        modoComite={modoComite}
        rutaTrasComite="/objeciones"
        panelComite={
          modoComite ? (
            <PanelRondaComite
              key="panel-ronda-objection"
              candidateId={candidateId}
              kindEsperado="OBJECTION"
              ronda={ronda}
              usuarioId={usuario.id}
              puedeAbrir={puedeAbrirRonda}
              puedeForzarCierre={puedeAbrirRonda}
              rutaRevalidate={`/objeciones/baremo/${candidateId}`}
            />
          ) : null
        }
        accionCabecera={
          <ModalObjeciones key="objeciones" nombre={resumen.fullName} items={resumen.items} />
        }
        accionExtra={
          !modoComite ? (
            <DeclararInelegible
              key="inelegible"
              evaluationId={evaluacion.id}
              nombre={resumen.fullName}
              yaInelegible={evaluacion.ineligible === true}
            />
          ) : null
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
