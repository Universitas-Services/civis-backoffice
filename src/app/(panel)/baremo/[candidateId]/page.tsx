import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AjustesPortal, BaremoDetalle, ExpedienteDetalle, RondaComiteAbierta } from "@/contracts";
import {
  PantallaAplicarBaremo,
  type EvaluacionBaremoVista,
} from "@/components/pantalla-aplicar-baremo";
import { PanelRondaComite } from "@/components/panel-ronda-comite";
import { detallarBaremoCongelado } from "@/lib/detallar-baremo";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";

export const metadata: Metadata = { title: "Aplicar baremo" };

export default async function BaremoDetalle({
  params,
}: {
  readonly params: Promise<{ candidateId: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");
  const { candidateId } = await params;
  const puedeCalificar = usuario.roles.some(
    (rol) => rol === "SUPER_ADMIN" || rol === "ADMIN" || rol === "EVALUATOR",
  );
  /** Abrir borrador / puntuar: no ADMIN puro (solo gestiona la ronda). */
  const puedeAbrirBorrador = usuario.roles.some(
    (rol) => rol === "SUPER_ADMIN" || rol === "EVALUATOR",
  );
  const puedeAbrirRonda = usuario.roles.some((rol) => rol === "SUPER_ADMIN" || rol === "ADMIN");

  let expediente: ExpedienteDetalle;
  let portal: AjustesPortal = {
    objectionsOpen: false,
    evaluationMode: "INDIVIDUAL",
    maxActiveEvaluators: 7,
    quorumThreshold: 5,
    roundDeadlineDays: 5,
  };
  try {
    [expediente, portal] = await Promise.all([
      llamarApi<ExpedienteDetalle>(`/internal/candidates/${candidateId}`),
      llamarApi<AjustesPortal>("/public/portal").catch(() => portal),
    ]);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/baremo/${candidateId}`);
    if (error instanceof ErrorApi && error.status === 404) notFound();
    if (error instanceof ErrorApi) return aviso("No se puede abrir el baremo", error.message);
    throw error;
  }

  const modoComite = portal.evaluationMode === "COMMITTEE";
  const enEvaluacion = expediente.workflowStatus === "EVALUATION_IN_PROGRESS";
  const yaEvaluado = expediente.workflowStatus === "EVALUATED";
  if (!enEvaluacion && !yaEvaluado) {
    return aviso(
      "No se puede abrir el baremo",
      "El baremo está disponible cuando el postulante fue declarado elegible.",
    );
  }

  let elegible = false;
  try {
    const ficha = await llamarApi<{ decision?: string } | null>(
      `/internal/evaluations/candidate/${candidateId}/eligibility`,
    );
    elegible = ficha?.decision === "ELIGIBLE";
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/baremo/${candidateId}`);
    if (error instanceof ErrorApi) return aviso("No se puede abrir el baremo", error.message);
    throw error;
  }
  if (!elegible) {
    return aviso(
      "No se puede abrir el baremo",
      "Primero declare elegible al postulante en Evaluación.",
    );
  }

  let historial: EvaluacionBaremoVista[];
  try {
    historial = await llamarApi<EvaluacionBaremoVista[]>(
      `/internal/evaluations/history/${candidateId}`,
    );
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/baremo/${candidateId}`);
    if (error instanceof ErrorApi) return aviso("No se puede abrir el baremo", error.message);
    throw error;
  }

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

  const enviada = historial.find((e) => e.status === "SUBMITTED" && e.baremoCongelado);
  const aprobada = historial.find((e) => e.status === "APPROVED" && e.baremoCongelado);
  const miPropia =
    historial.find(
      (e) =>
        e.evaluatorId === usuario.id &&
        e.baremoCongelado &&
        (e.status === "DRAFT" || e.status === "SUBMITTED"),
    ) ?? null;

  // Individual: borrador propio o enviada/aprobada compartida.
  // Comité: nunca mostrar SUBMITTED ajena; si no hay propia y la ronda SCORING
  // está abierta (o aún no hay consolidada), abrir borrador del evaluador.
  let evaluacion: EvaluacionBaremoVista | null = null;

  if (modoComite) {
    if (miPropia) {
      evaluacion = miPropia;
    } else if (
      puedeAbrirBorrador &&
      enEvaluacion &&
      (ronda?.kind === "SCORING" || (!ronda && !aprobada))
    ) {
      try {
        evaluacion = await llamarApi<EvaluacionBaremoVista>(
          `/internal/evaluations/candidate/${candidateId}/draft`,
          { method: "POST" },
        );
      } catch (error) {
        if (error instanceof NoAutorizado) renovarYVolver(`/baremo/${candidateId}`);
        if (error instanceof ErrorApi) return aviso("No se puede abrir el baremo", error.message);
        throw error;
      }
    } else {
      // Ronda cerrada / consulta ADMIN: consolidada o APPROVED (solo lectura).
      evaluacion = aprobada;
    }
  } else {
    evaluacion = miPropia ?? enviada ?? aprobada ?? null;
    if (!evaluacion && puedeAbrirBorrador && enEvaluacion) {
      try {
        evaluacion = await llamarApi<EvaluacionBaremoVista>(
          `/internal/evaluations/candidate/${candidateId}/draft`,
          { method: "POST" },
        );
      } catch (error) {
        if (error instanceof NoAutorizado) renovarYVolver(`/baremo/${candidateId}`);
        if (error instanceof ErrorApi) return aviso("No se puede abrir el baremo", error.message);
        throw error;
      }
    }
  }

  if (!evaluacion?.baremoCongelado) {
    return aviso(
      "No se puede abrir el baremo",
      puedeCalificar
        ? "No hay un baremo activo para abrir esta evaluación."
        : "La nota la abre un evaluador.",
    );
  }

  let activo: BaremoDetalle | null = null;
  try {
    activo = await llamarApi<BaremoDetalle | null>("/internal/baremos/active");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/baremo/${candidateId}`);
    activo = null;
  }

  const evaluacionConDetalle: EvaluacionBaremoVista = {
    ...evaluacion,
    baremoCongelado: detallarBaremoCongelado(evaluacion.baremoCongelado, activo),
  };

  const abstuvo =
    modoComite &&
    ronda?.participants.find((p) => p.evaluatorId === usuario.id)?.action === "ABSTAINED";

  const puedeEditar = modoComite
    ? !abstuvo &&
      !yaEvaluado &&
      (evaluacion.status === "DRAFT" || evaluacion.status === "SUBMITTED") &&
      evaluacion.evaluatorId === usuario.id
    : (evaluacion.status === "DRAFT" || evaluacion.status === "SUBMITTED") &&
      (evaluacion.evaluatorId === usuario.id ||
        usuario.roles.includes("SUPER_ADMIN") ||
        usuario.roles.includes("ADMIN"));

  // Abrir ronda solo si aún hay que puntuar; con EVALUATED el CTA engaña.
  const puedeAbrirRondaActiva = puedeAbrirRonda && enEvaluacion && !yaEvaluado;

  return (
    <PantallaAplicarBaremo
      expediente={expediente}
      evaluacion={evaluacionConDetalle}
      puedeEditar={puedeEditar}
      modoComite={modoComite}
      panelComite={
        modoComite ? (
          <PanelRondaComite
            key="panel-ronda-scoring"
            candidateId={candidateId}
            kindEsperado="SCORING"
            ronda={ronda}
            usuarioId={usuario.id}
            puedeAbrir={puedeAbrirRondaActiva}
            puedeForzarCierre={puedeAbrirRondaActiva}
            consolidada={yaEvaluado}
            rutaRevalidate={`/baremo/${candidateId}`}
          />
        ) : null
      }
    />
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
