import type { Metadata } from "next";
import type { InformeListado } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { GenerarInforme, FichaInforme } from "@/components/gestion-informes";

export const metadata: Metadata = { title: "Informes" };

export default async function Informes() {
  const usuario = await exigirRol("SUPER_ADMIN", "PUBLISHER", "EVALUATOR");

  let informes: readonly InformeListado[];
  try {
    informes = await llamarApi<InformeListado[]>("/internal/reports");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/informes");
    throw error;
  }

  const puedeGenerar = usuario.roles.some((r) => r === "SUPER_ADMIN" || r === "PUBLISHER");

  return (
    <>
      <CabeceraPagina
        titulo="Informes finales"
        descripcion="Cada informe se genera a partir de evaluaciones aprobadas y se publica con su huella digital, para que cualquiera pueda comprobar que el documento no cambió."
      />

      <div className="space-y-8 px-5 py-6 sm:px-8">
        {puedeGenerar && <GenerarInforme />}

        <section aria-labelledby="listado">
          <h2 id="listado" className="text-base font-semibold text-toga-900">
            Informes generados
          </h2>

          {informes.length === 0 ? (
            <div className="mt-3">
              <EstadoVacio
                titulo="Todavía no se ha generado ningún informe"
                detalle="Un informe recoge el ranking, las causales de exclusión y el resumen de objeciones a una fecha de corte concreta."
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-4">
              {informes.map((informe) => (
                <li key={informe.id}>
                  <FichaInforme
                    informe={informe}
                    puedePublicar={puedeGenerar}
                    loGeneroElMismoUsuario={informe.preparedBy?.fullName === usuario.fullName}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
