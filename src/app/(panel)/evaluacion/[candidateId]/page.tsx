import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AjustesPortal, ExpedienteDetalle, RondaComiteAbierta } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { leerRondaAbierta, leerRondaEscalada } from "@/app/(panel)/comite/acciones";
import { PantallaElegibilidad } from "@/components/pantalla-elegibilidad";

export const metadata: Metadata = { title: "Elegibilidad" };

export default async function EvaluarElegibilidad({
  params,
}: {
  readonly params: Promise<{ candidateId: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");
  const { candidateId } = await params;
  const puedeResolverEscalada = usuario.roles.some(
    (r) => r === "SUPER_ADMIN" || r === "ADMIN",
  );
  const puedeVotarElegibilidad = usuario.roles.some(
    (r) => r === "SUPER_ADMIN" || r === "EVALUATOR",
  );
  const esSuperAdmin = usuario.roles.includes("SUPER_ADMIN");

  let expediente: ExpedienteDetalle;
  let modoComite = false;
  let yaActuoEnRondaElegibilidad = false;
  let rondaEscalada: RondaComiteAbierta | null = null;
  let rondaAbierta: RondaComiteAbierta | null = null;
  try {
    expediente = await llamarApi<ExpedienteDetalle>(`/internal/candidates/${candidateId}`);
    const portal = await llamarApi<AjustesPortal>("/public/portal");
    modoComite = portal.evaluationMode === "COMMITTEE";
    if (modoComite) {
      rondaAbierta = await leerRondaAbierta(candidateId);
      if (rondaAbierta?.kind === "ELIGIBILITY" && rondaAbierta.status === "OPEN") {
        const yo = rondaAbierta.participants.find((p) => p.evaluatorId === usuario.id);
        yaActuoEnRondaElegibilidad = yo !== undefined && yo.action !== "PENDING";
      } else {
        rondaEscalada = await leerRondaEscalada(candidateId);
      }
    }
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
      modoComite={modoComite}
      yaActuoEnRondaElegibilidad={yaActuoEnRondaElegibilidad}
      rondaEscalada={rondaEscalada}
      rondaAbierta={rondaAbierta}
      puedeResolverEscalada={puedeResolverEscalada}
      puedeVotarElegibilidad={puedeVotarElegibilidad}
      mostrarTallySuperAdmin={esSuperAdmin}
    />
  );
}
