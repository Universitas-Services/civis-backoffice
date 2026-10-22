import type { Metadata } from "next";
import type { ResultadoRanking } from "@/contracts";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { RankingInterno } from "@/components/ranking-interno";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { llamarApi, NoAutorizado } from "@/lib/api";

export const metadata: Metadata = { title: "Ranking interno" };

export default async function PaginaRankingInterno() {
  const usuario = await exigirRol("SUPER_ADMIN", "EVALUATOR", "ADMIN", "VIEWER");
  let ranking: ResultadoRanking;
  try {
    ranking = await llamarApi<ResultadoRanking>("/internal/ranking");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/ranking");
    throw error;
  }

  const esVisualizador = usuario.roles.includes("VIEWER");
  const visibles = ranking.entries.filter((e) => !e.ineligible);

  return (
    <>
      <CabeceraPagina
        titulo="Ranking interno"
        descripcion={
          esVisualizador
            ? "Postulantes con baremo guardado, por puntaje. Desde la ficha de cada uno puede dejar una opinión o presentar una objeción formal."
            : "Postulantes con baremo guardado, por puntaje. Los visualizadores opinan y objetan desde aquí; sus objeciones llegan a la bandeja de Objeciones."
        }
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
          <RankingInterno entries={visibles} esVisualizador={esVisualizador} />
        )}
      </div>
    </>
  );
}
