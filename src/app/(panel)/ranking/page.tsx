import type { Metadata } from "next";
import type { AjustesPortal, ResultadoRanking } from "@/contracts";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { RankingInterno } from "@/components/ranking-interno";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { InterruptoresPortal, type Interruptor } from "@/components/interruptores-portal";
import { PublicacionRanking } from "@/components/publicacion-ranking";
import { llamarApi, NoAutorizado } from "@/lib/api";

export const metadata: Metadata = { title: "Ranking interno" };

export default async function PaginaRankingInterno() {
  const usuario = await exigirRol("SUPER_ADMIN", "EVALUATOR", "ADMIN", "VIEWER");
  let ranking: ResultadoRanking;
  let portal: AjustesPortal;
  try {
    [ranking, portal] = await Promise.all([
      llamarApi<ResultadoRanking>("/internal/ranking"),
      llamarApi<AjustesPortal>("/internal/portal"),
    ]);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/ranking");
    throw error;
  }

  const esSuper = usuario.roles.includes("SUPER_ADMIN");
  const esAdmin = usuario.roles.includes("ADMIN");
  const esVisualizador = usuario.roles.includes("VIEWER");
  const visibles = ranking.entries.filter((e) => !e.ineligible);

  // Enviar al ranking público: solo SUPER_ADMIN. Actualizar a un publicado:
  // SUPER_ADMIN siempre; ADMIN y evaluadores si SUPER_ADMIN lo habilitó.
  const puedeEnviar = esSuper;
  const puedeActualizar =
    esSuper ||
    (portal.publicRefreshEnabled && usuario.roles.some((r) => r === "ADMIN" || r === "EVALUATOR"));

  const interruptores: Interruptor[] = [];
  if (esSuper || esAdmin) {
    interruptores.push({
      ajuste: "viewerObjectionsOpen",
      titulo: "Objeciones de los visualizadores",
      encendido:
        "Los visualizadores ven «Objetar» en el ranking interno. Sus objeciones llegan al comité, que espera el descargo del postulante antes de enviarlas al Consejo.",
      apagado: "Los visualizadores solo consultan y opinan; no pueden objetar.",
      valor: portal.viewerObjectionsOpen,
    });
  }
  if (esSuper) {
    interruptores.push(
      {
        ajuste: "objectionsOpen",
        titulo: "Objeciones públicas en la landing",
        encendido:
          "La landing muestra «Objetar» en los postulantes enviados al ranking público. Úselo solo si se decide abrir las objeciones a la ciudadanía.",
        apagado:
          "Las objeciones son cerradas: solo las presentan los visualizadores desde el panel.",
        valor: portal.objectionsOpen,
      },
      {
        ajuste: "publicRefreshEnabled",
        titulo: "«Actualizar en el ranking público» para admin y evaluadores",
        encendido:
          "Administradores y evaluadores pueden actualizar en el ranking público la nota de un postulante ya publicado (por ejemplo, tras una re-evaluación por objeción).",
        apagado: "Solo usted actualiza las notas del ranking público.",
        valor: portal.publicRefreshEnabled,
      },
    );
  }

  return (
    <>
      <CabeceraPagina
        titulo="Ranking interno"
        descripcion={
          esVisualizador
            ? "Postulantes con baremo guardado, por puntaje. Desde la ficha de cada uno puede dejar una opinión o presentar una objeción formal."
            : "Postulantes con baremo guardado, por puntaje. Los visualizadores opinan y, si está habilitado, objetan desde aquí; sus objeciones llegan primero al comité."
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

      <div className="space-y-8 px-5 py-6 sm:px-8">
        <InterruptoresPortal items={interruptores} />

        {visibles.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hay ranking"
            detalle="Aparecerá cuando se guarde el baremo de un postulante."
          />
        ) : (
          <>
            <RankingInterno
              entries={visibles}
              esVisualizador={esVisualizador}
              puedeObjetar={esVisualizador && portal.viewerObjectionsOpen}
            />
            {(puedeEnviar || puedeActualizar) && (
              <section aria-labelledby="ranking-publico" className="border-t border-toga-200 pt-6">
                <h2 id="ranking-publico" className="text-lg font-semibold text-toga-900">
                  Ranking público
                </h2>
                <p className="mt-1 text-sm text-toga-500">
                  Lo que ve la ciudadanía en la landing. Una re-evaluación cambia la nota interna,
                  no la pública: para llevarla al sitio use «Actualizar».
                </p>
                <div className="mt-4">
                  <PublicacionRanking
                    entries={visibles}
                    puedeEnviar={puedeEnviar}
                    puedeActualizar={puedeActualizar}
                  />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
