import type { Metadata } from "next";
import type { ExpedienteListado } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { postulanteDesdeListado } from "@/lib/adaptar-revision-api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { ListaPostulantesRevision } from "@/components/revision-maqueta/lista-postulantes-revision";
import { Paginacion } from "@/components/paginacion";

export const metadata: Metadata = { title: "Revisión documental" };

const PAGE_SIZE = 20;

interface Respuesta {
  readonly items: readonly ExpedienteListado[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export default async function RevisionDocumental({
  searchParams,
}: {
  readonly searchParams: Promise<{ buscar?: string; page?: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "REVIEWER", "EVALUATOR");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    estado: "DOCUMENT_REVIEW",
  });
  if (params.buscar) query.set("buscar", params.buscar);

  let datos: Respuesta;
  try {
    datos = await llamarApi<Respuesta>(`/internal/candidates?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/revision-documental");
    if (error instanceof ErrorApi) throw error;
    throw error;
  }

  const postulantes = datos.items.map(postulanteDesdeListado);
  const pageSize = datos.pageSize || PAGE_SIZE;

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
              <span className="cifra font-medium text-toga-800">{datos.total}</span>{" "}
              {datos.total === 1 ? "postulante en revisión" : "postulantes en revisión"}
            </p>
            <ListaPostulantesRevision items={postulantes} />
            {datos.total > pageSize && (
              <div className="mt-4">
                <Paginacion
                  ruta="/revision-documental"
                  page={datos.page}
                  pageSize={pageSize}
                  total={datos.total}
                  params={{ buscar: params.buscar }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
