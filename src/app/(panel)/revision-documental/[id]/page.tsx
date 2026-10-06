import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ExpedienteDetalle } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { postulanteDesdeExpediente } from "@/lib/adaptar-revision-api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
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
    if (error instanceof NoAutorizado) await renovarYVolver(`/revision-documental/${id}`);
    if (error instanceof ErrorApi && error.status === 404) notFound();
    if (error instanceof ErrorApi) {
      return avisoCarga(error.message);
    }
    return avisoCarga("No se pudo contactar la API. Intente de nuevo en unos momentos.");
  }

  let historial: EventoHistorial[] = [];
  try {
    historial = await llamarApi<EventoHistorial[]>(`/internal/candidates/${id}/history`);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver(`/revision-documental/${id}`);
    // Historial no crítico: seguir sin él.
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

function avisoCarga(detalle: string) {
  return (
    <>
      <CabeceraPagina
        titulo="Documentos del postulante"
        descripcion="Revise los documentos cargados para este expediente enviado a revisión documental."
        ruta={[
          { href: "/revision-documental", texto: "Revisión documental" },
          { texto: "Expediente" },
        ]}
      />
      <div className="px-5 py-6 sm:px-8">
        <EstadoVacio
          titulo="No se pudo cargar este expediente"
          detalle={detalle}
          accion={
            <Link
              href="/revision-documental"
              className="inline-flex rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
            >
              Volver a la cola
            </Link>
          }
        />
      </div>
    </>
  );
}
