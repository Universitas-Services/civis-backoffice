import type { Metadata } from "next";
import type { DocumentoEnRevision } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { FichaRevision } from "@/components/ficha-revision";

export const metadata: Metadata = { title: "Revisión documental" };

export default async function RevisionDocumental() {
  const usuario = await exigirRol("SUPER_ADMIN", "SECRETARY", "EVALUATOR", "PUBLISHER");

  let documentos: readonly DocumentoEnRevision[];
  try {
    documentos = await llamarApi<DocumentoEnRevision[]>("/internal/documents/review-queue");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/revision-documental");
    throw error;
  }

  // Sólo quien publica decide qué archivo se hace público. La pantalla lo
  // oculta al resto, pero la API es quien lo impide de verdad.
  const puedeClasificar = usuario.roles.some((r) => r === "SUPER_ADMIN" || r === "PUBLISHER");
  const puedeVerificar = usuario.roles.some(
    (r) => r === "SUPER_ADMIN" || r === "SECRETARY" || r === "EVALUATOR",
  );

  return (
    <>
      <CabeceraPagina
        titulo="Revisión documental"
        descripcion="Documentos cargados que esperan verificación. Aquí se comprueba que son legibles y corresponden a lo declarado, antes de que el expediente pase a evaluación."
      />

      <div className="px-5 py-6 sm:px-8">
        {documentos.length === 0 ? (
          <EstadoVacio
            titulo="No hay documentos pendientes de verificar"
            detalle="Aparecerán aquí en cuanto secretaría cargue documentos en un expediente que siga en borrador o en revisión."
          />
        ) : (
          <>
            <p className="text-sm text-toga-500">
              {documentos.length}{" "}
              {documentos.length === 1 ? "documento pendiente" : "documentos pendientes"}
            </p>
            <ul className="mt-4 space-y-4">
              {documentos.map((d) => (
                <li key={d.id}>
                  <FichaRevision
                    documento={d}
                    puedeVerificar={puedeVerificar}
                    puedeClasificar={puedeClasificar}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
