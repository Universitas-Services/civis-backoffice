import type { Metadata } from "next";
import type { AjustesPortal, ResultadoRanking } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { fechaHora, fechaLarga } from "@/lib/plazos";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { InterruptoresPortal, type Interruptor } from "@/components/interruptores-portal";
import { ConfiguracionPlazos } from "@/components/configuracion-plazos";
import { RetiroRankingPublico } from "@/components/retiro-ranking-publico";

export const metadata: Metadata = { title: "Configuración del proceso" };

/**
 * Configuración del proceso, sólo superadministración: cierre de
 * postulaciones, lapsos de objeciones, ranking público y el calendario con
 * los plazos legales.
 */
export default async function ConfiguracionDelProceso() {
  await exigirRol("SUPER_ADMIN");

  let ajustes: AjustesPortal;
  let ranking: ResultadoRanking;
  try {
    [ajustes, ranking] = await Promise.all([
      llamarApi<AjustesPortal>("/internal/portal"),
      llamarApi<ResultadoRanking>("/internal/ranking"),
    ]);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/configuracion");
    throw error;
  }

  const lapso = ajustes.calendario.periodos.find((p) => p.clave === "LAPSO_OBJECIONES");
  const finLapso = ajustes.calendario.finLapsoObjeciones;
  // Los cierres los aplica la API sola según el calendario; aquí sólo se informan.
  const lapsoTerminado = finLapso !== null && new Date(finLapso).getTime() < Date.now();
  const lapsoEmpezado =
    lapso !== undefined && new Date(`${lapso.inicio}T04:00:00Z`).getTime() <= Date.now();
  const abrirCierraPostulaciones = ajustes.applicationsClosed
    ? undefined
    : "Al abrir las objeciones se cierran también las postulaciones: nadie podrá crear expedientes ni enviar uno por primera vez, y el calendario se calcula desde el día hábil siguiente. ¿Continuar?";

  const postulaciones: Interruptor[] = [
    {
      ajuste: "applicationsClosed",
      titulo: "Postulaciones cerradas",
      encendido: `Ni la secretaría ni el portal del postulante crean expedientes nuevos ni hacen un primer envío. Los expedientes devueltos por la revisión sí se pueden corregir y reenviar.${
        ajustes.applicationsClosedAt
          ? ` Cerradas el ${fechaHora(ajustes.applicationsClosedAt).replace(/\.?$/, ".")}`
          : ""
      }`,
      apagado:
        "La secretaría y el portal del postulante reciben postulaciones. Se cierran solas al abrirse el lapso de objeciones.",
      valor: ajustes.applicationsClosed,
      confirmarAlEncender:
        "¿Cerrar el periodo de postulaciones? Nadie podrá crear expedientes ni enviar uno por primera vez, y se calculará el calendario del proceso desde el día hábil siguiente.",
    },
  ];

  const objeciones: Interruptor[] = [
    {
      ajuste: "viewerObjectionsOpen",
      titulo: "Objeciones de los visualizadores",
      encendido:
        "Los visualizadores ven «Objetar» en el ranking interno. Sus objeciones llegan sólo al comité, que se pronuncia sobre su admisión.",
      apagado: "Los visualizadores sólo consultan y opinan; no pueden objetar.",
      valor: ajustes.viewerObjectionsOpen,
      confirmarAlEncender: abrirCierraPostulaciones,
    },
    {
      ajuste: "objectionsOpen",
      titulo: "Objeciones públicas en la landing",
      encendido:
        "La landing muestra «Objetar» en los postulantes enviados al ranking público. Úselo sólo si se decide abrir las objeciones a la ciudadanía.",
      apagado: "Las objeciones son cerradas: sólo las presentan los visualizadores desde el panel.",
      valor: ajustes.objectionsOpen,
      confirmarAlEncender: abrirCierraPostulaciones,
    },
  ];

  const publicados = ranking.entries.filter((e) => e.published === true).length;

  const interruptoresRanking: Interruptor[] = [
    {
      ajuste: "publicRefreshEnabled",
      titulo: "«Actualizar en el ranking público» para admin y evaluadores",
      encendido:
        "Administradores y evaluadores pueden actualizar en el ranking público la nota de un postulante ya publicado (por ejemplo, tras una re-evaluación por objeción).",
      apagado: "Sólo usted actualiza las notas del ranking público.",
      valor: ajustes.publicRefreshEnabled,
    },
  ];

  return (
    <>
      <CabeceraPagina
        titulo="Configuración del proceso"
        descripcion="Cierre de postulaciones, lapsos de objeciones, ranking público y el calendario de plazos legales del procedimiento de objeciones (LOTSJ arts. 71 y 72)."
      />

      <div className="space-y-10 px-5 py-6 sm:px-8">
        <InterruptoresPortal
          id="ajustes-postulaciones"
          titulo="Postulaciones"
          items={postulaciones}
        />

        <div className="space-y-3">
          <InterruptoresPortal id="ajustes-objeciones" titulo="Objeciones" items={objeciones} />
          {lapso && (
            <p className="text-sm text-toga-600">
              Lapso de objeciones según el calendario: del {fechaLarga(`${lapso.inicio}T16:00:00Z`)}{" "}
              al {fechaLarga(`${lapso.fin}T16:00:00Z`)}.{" "}
              {lapsoTerminado
                ? "Ya terminó: las objeciones se cerraron solas y no se pueden reabrir sin cambiar el calendario."
                : lapsoEmpezado
                  ? "Está en curso: las postulaciones quedaron cerradas y las objeciones se cierran solas al terminar."
                  : "Al empezar se cierran solas las postulaciones, y al terminar, las objeciones."}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <InterruptoresPortal
            id="ajustes-ranking-publico"
            titulo="Ranking público"
            items={interruptoresRanking}
          />
          <RetiroRankingPublico publicados={publicados} />
        </div>

        <section aria-labelledby="plazos" className="space-y-3">
          <div>
            <h2 id="plazos" className="text-base font-semibold text-toga-900">
              Calendario y plazos
            </h2>
            <p className="mt-1 text-sm text-toga-600">
              Si un periodo debe alargarse por un inconveniente, cambie sus días y guarde: el
              calendario se recalcula. Los plazos de descargo y comprobación ya notificados no
              cambian.
            </p>
          </div>
          <ConfiguracionPlazos ajustes={ajustes} />
        </section>
      </div>
    </>
  );
}
