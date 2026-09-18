import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirRol } from "@/lib/rutas";
import { obtenerPostulanteRevision } from "@/lib/maqueta-revision-documental";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { DetalleRevisionPostulante } from "@/components/revision-maqueta/detalle-revision-postulante";

export const metadata: Metadata = { title: "Revisión del postulante" };

export default async function RevisionDocumentalPostulante({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "SECRETARY", "EVALUATOR", "PUBLISHER");
  const { id } = await params;
  const postulante = obtenerPostulanteRevision(id);
  if (!postulante) notFound();

  return (
    <>
      <CabeceraPagina
        titulo="Documentos del postulante"
        descripcion="Revise los documentos cargados para este expediente enviado a revisión documental."
        ruta={[
          { href: "/revision-documental", texto: "Revisión documental" },
          { texto: `${postulante.nombre} ${postulante.apellido}` },
        ]}
      />
      <div className="px-5 py-6 sm:px-8">
        <DetalleRevisionPostulante postulante={postulante} />
      </div>
    </>
  );
}
