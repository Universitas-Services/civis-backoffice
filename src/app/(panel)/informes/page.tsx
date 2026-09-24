import type { Metadata } from "next";
import type { InformeListado } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { EstadoVacio } from "@/components/cabecera-pagina";
import { MarcoInformes, FichaInforme } from "@/components/gestion-informes";

export const metadata: Metadata = { title: "Informes" };

export default async function Informes() {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");

  let informes: readonly InformeListado[];
  try {
    informes = await llamarApi<InformeListado[]>("/internal/reports");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/informes");
    throw error;
  }

  const puedeGenerar = usuario.roles.some((r) => r === "SUPER_ADMIN" || r === "ADMIN");

  return (
    <MarcoInformes puedeGenerar={puedeGenerar}>
      <div className="space-y-8">
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
    </MarcoInformes>
  );
}
