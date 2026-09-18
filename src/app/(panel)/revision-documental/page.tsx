import type { Metadata } from "next";
import { exigirRol } from "@/lib/rutas";
import { listarPostulantesRevision } from "@/lib/maqueta-revision-documental";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { ListaPostulantesRevision } from "@/components/revision-maqueta/lista-postulantes-revision";

export const metadata: Metadata = { title: "Revisión documental" };

export default async function RevisionDocumental() {
  await exigirRol("SUPER_ADMIN", "SECRETARY", "EVALUATOR", "PUBLISHER");
  const postulantes = listarPostulantesRevision();

  return (
    <>
      <CabeceraPagina
        titulo="Revisión documental"
        descripcion="Postulantes enviados a revisión documental. Elija un expediente para ver y revisar sus documentos."
      />

      <div className="px-5 py-6 sm:px-8">
        {postulantes.length === 0 ? (
          <EstadoVacio
            titulo="No hay postulantes en revisión"
            detalle="Aparecerán aquí cuando secretaría envíe un expediente a revisión documental."
          />
        ) : (
          <>
            <p className="text-sm text-toga-500">
              <span className="cifra font-medium text-toga-800">{postulantes.length}</span>{" "}
              {postulantes.length === 1
                ? "postulante en revisión"
                : "postulantes en revisión"}
            </p>
            <ListaPostulantesRevision items={postulantes} />
          </>
        )}
      </div>
    </>
  );
}
