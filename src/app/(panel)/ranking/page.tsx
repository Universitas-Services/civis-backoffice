import type { Metadata } from "next";
import type { ResultadoRanking } from "@/contracts";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { RankingConEnvio } from "@/components/acciones-ranking";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { llamarApi, NoAutorizado } from "@/lib/api";

export const metadata: Metadata = { title: "Ranking interno" };

export default async function RankingInterno() {
  const usuario = await exigirRol("SUPER_ADMIN", "EVALUATOR", "ADMIN");
  let ranking: ResultadoRanking;
  try {
    ranking = await llamarApi<ResultadoRanking>("/internal/ranking");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/ranking");
    throw error;
  }

  const puedePublicar = usuario.roles.some((r) => r === "SUPER_ADMIN" || r === "ADMIN");
  const visibles = ranking.entries.filter((e) => !e.ineligible);

  return (
    <>
      <CabeceraPagina
        titulo="Ranking interno"
        descripcion="Quienes tienen baremo guardado. Arriba, los que la ciudadanía todavía no ve. Abajo, los ya publicados."
        meta={
          <p className="text-sm text-toga-500">
            <span className="cifra font-medium text-toga-800">{ranking.eligibleCount}</span> en
            competencia ·{" "}
            <span className="cifra font-medium text-toga-800">{ranking.ineligibleCount}</span>{" "}
            inhabilitados
          </p>
        }
      />

      <div className="px-5 py-6 sm:px-8">
        {visibles.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hay ranking"
            detalle="Aparecerá cuando se guarde el baremo de un postulante."
          />
        ) : (
          <RankingConEnvio entries={visibles} puedePublicar={puedePublicar} />
        )}
      </div>
    </>
  );
}
