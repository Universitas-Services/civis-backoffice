import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ExpedienteDetalle } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { postulanteDesdeExpediente } from "@/lib/adaptar-revision-api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { DetalleRevisionPostulante } from "@/components/revision-maqueta/detalle-revision-postulante";
import { HojaHistorialExpediente, type EventoHistorial } from "@/components/historial-expediente";

export const metadata: Metadata = { title: "Revisión del postulante" };

export default async function RevisionDocumentalPostulante({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "REVIEWER");
  const { id } = await params;

  let expediente: ExpedienteDetalle;
  try {
    expediente = await llamarApi<ExpedienteDetalle>(`/internal/candidates/${id}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/revision-documental/${id}`);
    if (error instanceof ErrorApi && error.status === 404) notFound();
    throw error;
  }

  let historial: EventoHistorial[] = [];
  try {
    historial = await llamarApi<EventoHistorial[]>(`/internal/candidates/${id}/history`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/revision-documental/${id}`);
  }

  if (expediente.workflowStatus !== "DOCUMENT_REVIEW") {
    notFound();
  }

  const postulante = postulanteDesdeExpediente(expediente);

  return (
    <>
      <CabeceraPagina
        titulo="Documentos del postulante"
        descripcion="Revise los documentos cargados para este expediente enviado a revisión documental."
        ruta={[
          { href: "/revision-documental", texto: "Revisión documental" },
          { texto: `${postulante.nombre} ${postulante.apellido}` },
        ]}
        acciones={<HojaHistorialExpediente eventos={historial} />}
      />
      <div className="space-y-6 px-5 py-6 sm:px-8">
        <DetalleRevisionPostulante postulante={postulante} />
      </div>
    </>
  );
}
