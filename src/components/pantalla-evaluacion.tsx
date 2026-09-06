"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CriterioBaremo, Evaluacion, ExpedienteDetalle } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import {
  aprobarEvaluacion,
  enviarEvaluacion,
  guardarPuntajes,
} from "@/app/(panel)/evaluacion/[candidateId]/acciones";
import { InsigniaBanda } from "./insignias";
import { VisorPdf } from "./visor-pdf";

const DIMENSIONES: Record<string, string> = {
  ACADEMIC: "Formación académica",
  TEACHING: "Docencia universitaria",
  RESEARCH: "Producción científica",
  EXPERIENCE: "Trayectoria profesional",
  INCOMPATIBILITY: "Incompatibilidades absolutas",
};

interface ValorCriterio {
  valor: number;
  justificacion: string;
  documentoId: string | null;
  pagina: number | null;
}

/**
 * Pantalla de evaluación a dos columnas.
 *
 * Izquierda el expediente, derecha el baremo. El totalizador muestra SIEMPRE
 * el total que devolvió el servidor: aquí no se suma nada. Mientras hay
 * cambios sin guardar, el totalizador lo dice en lugar de mostrar una cifra
 * calculada en el navegador que podría no coincidir con la real.
 */
export function PantallaEvaluacion({
  expediente,
  evaluacion,
  criterios,
  usuarioId,
}: {
  readonly expediente: ExpedienteDetalle;
  readonly evaluacion: Evaluacion;
  readonly criterios: readonly CriterioBaremo[];
  readonly usuarioId: string;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  const iniciales = useMemo(() => {
    const mapa = new Map<string, ValorCriterio>();
    for (const s of evaluacion.scores) {
      mapa.set(s.criterion.key, {
        valor: Number(s.value),
        justificacion: s.justification ?? "",
        documentoId: s.evidenceDocumentId,
        pagina: s.evidencePage,
      });
    }
    return mapa;
  }, [evaluacion.scores]);

  const [valores, setValores] = useState<Map<string, ValorCriterio>>(iniciales);
  const [servidor, setServidor] = useState({
    total: Number(evaluacion.totalPoints),
    banda: evaluacion.band,
    inhabilitado: evaluacion.ineligible,
    motivos: evaluacion.ineligibilityReasons,
    estado: evaluacion.status,
  });
  const [sucio, setSucio] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);
  const [motivoAprobacion, setMotivoAprobacion] = useState("");

  const porDimension = useMemo(() => {
    const grupos = new Map<string, CriterioBaremo[]>();
    for (const c of [...criterios].sort((a, b) => a.order - b.order)) {
      const lista = grupos.get(c.dimensionKey) ?? [];
      lista.push(c);
      grupos.set(c.dimensionKey, lista);
    }
    return grupos;
  }, [criterios]);

  const editable = servidor.estado === "DRAFT" && evaluacion.evaluatorId === usuarioId;

  function actualizar(clave: string, cambio: Partial<ValorCriterio>) {
    setValores((previo) => {
      const mapa = new Map(previo);
      const actual = mapa.get(clave) ?? {
        valor: 0,
        justificacion: "",
        documentoId: null,
        pagina: null,
      };
      mapa.set(clave, { ...actual, ...cambio });
      return mapa;
    });
    setSucio(true);
  }

  function guardar() {
    setMensaje(null);
    const scores = [...valores.entries()]
      // Sólo se envía lo que tiene valor o justificación: enviar ceros vacíos
      // dispararía la exigencia de justificación de la API sin motivo.
      .filter(([, v]) => v.valor > 0 || v.justificacion.trim().length > 0)
      .map(([criterionKey, v]) => ({
        criterionKey,
        value: v.valor,
        justification: v.justificacion.trim() || undefined,
        evidenceDocumentId: v.documentoId,
        evidencePage: v.pagina,
      }));

    if (scores.length === 0) {
      setMensaje({ texto: "Asigne al menos un criterio antes de guardar.", error: true });
      return;
    }

    iniciar(async () => {
      const r = await guardarPuntajes(evaluacion.id, scores);
      if (r.ok && r.evaluacion) {
        setServidor({
          total: Number(r.evaluacion.totalPoints),
          banda: r.evaluacion.band,
          inhabilitado: r.evaluacion.ineligible,
          motivos: r.evaluacion.ineligibilityReasons,
          estado: r.evaluacion.status,
        });
        setSucio(false);
        setMensaje({ texto: "Puntajes guardados. El total lo calculó el servidor.", error: false });
      } else {
        setMensaje({ texto: r.error ?? "No se pudo guardar", error: true });
      }
    });
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* ── Barra superior con el totalizador fijo ─────────────────── */}
      <header className="shrink-0 border-b border-toga-200 bg-white px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <nav aria-label="Ruta" className="text-xs text-toga-500">
              <Link href="/evaluacion" className="hover:text-toga-900">
                Evaluación
              </Link>
              <span className="mx-1.5" aria-hidden="true">
                /
              </span>
              <span className="codigo">{expediente.submissions[0]?.fileNumber}</span>
            </nav>
            <h1 className="truncate text-lg font-semibold tracking-tight text-toga-900">
              {expediente.firstName} {expediente.lastName}
            </h1>
            <p className="text-xs text-toga-500">{SALA_ETIQUETA[expediente.chamber]}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[0.65rem] uppercase tracking-wider text-toga-500">
                Total calculado por el servidor
              </p>
              {sucio ? (
                <p className="text-lg font-semibold text-balanza-700">Cambios sin guardar</p>
              ) : (
                <p className="cifra text-3xl font-semibold leading-none tracking-tight text-toga-900">
                  {servidor.total}
                  <span className="ml-1 text-sm font-normal text-toga-500">/ 100</span>
                </p>
              )}
            </div>
            {!sucio && (
              <InsigniaBanda
                banda={servidor.inhabilitado ? "INELIGIBLE" : (servidor.banda as never)}
              />
            )}
          </div>
        </div>

        {servidor.inhabilitado && !sucio && (
          <p className="mt-2 rounded-md bg-toga-800 px-3 py-2 text-xs text-toga-100">
            <span aria-hidden="true" className="mr-1.5">
              ✕
            </span>
            Inhabilitado: {servidor.motivos.join(" · ")}
          </p>
        )}
      </header>

      {/* ── Dos columnas: expediente | baremo ──────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-rows-2 lg:grid-cols-[3fr_2fr] lg:grid-rows-1">
        {/* Visor documental */}
        <section
          aria-label="Documentos del expediente"
          className="min-h-0 overflow-hidden border-b border-toga-200 lg:border-b-0 lg:border-r"
        >
          <VisorPdf documentos={expediente.submissions[0]?.documents ?? []} />
        </section>

        {/* Matriz del baremo */}
        <section
          aria-label="Baremo de evaluación"
          className="min-h-0 overflow-y-auto bg-toga-50 p-5"
        >
          {!editable && (
            <p className="mb-4 rounded-md border border-toga-300 bg-white px-4 py-3 text-sm text-toga-600">
              {servidor.estado === "DRAFT"
                ? "Este borrador pertenece a otro evaluador: puede consultarlo pero no modificarlo."
                : `La evaluación está en ${servidor.estado} y ya no admite cambios. Para corregirla, registre un ajuste trazable.`}
            </p>
          )}

          {mensaje && (
            <p
              role={mensaje.error ? "alert" : "status"}
              className={`mb-4 rounded-md px-4 py-3 text-sm ${
                mensaje.error
                  ? "border border-balanza-600/25 bg-balanza-50 text-balanza-700"
                  : "border border-validado-700/20 bg-validado-50 text-validado-700"
              }`}
            >
              {mensaje.texto}
            </p>
          )}

          {[...porDimension.entries()].map(([dimension, lista]) => (
            <fieldset
              key={dimension}
              className="mb-5 rounded-lg border border-toga-200 bg-white p-4"
            >
              <legend className="px-2 text-sm font-semibold text-toga-900">
                {DIMENSIONES[dimension] ?? dimension}
              </legend>

              <div className="space-y-4">
                {lista.map((c) => {
                  const v = valores.get(c.key) ?? {
                    valor: 0,
                    justificacion: "",
                    documentoId: null,
                    pagina: null,
                  };
                  const esBandera = c.rule.kind === "DISQUALIFYING_FLAG";
                  const necesitaJustificacion = v.valor > 0 && !v.justificacion.trim();

                  return (
                    <div
                      key={c.id}
                      className="border-t border-toga-100 pt-3 first:border-0 first:pt-0"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <label htmlFor={`c-${c.key}`} className="text-sm font-medium text-toga-900">
                          {c.label}
                          {c.isExcluding && (
                            <span className="ml-2 rounded bg-objetado-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-objetado-600">
                              excluyente
                            </span>
                          )}
                        </label>
                        <span className="shrink-0 text-xs text-toga-500">
                          {Number(c.maxPoints) > 0
                            ? `máx. ${Number(c.maxPoints)} pts`
                            : "sin puntos"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-toga-500">
                        {c.description}
                      </p>
                      {c.legalBasis && (
                        <p className="mt-0.5 text-xs font-medium text-balanza-700">
                          {c.legalBasis}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {esBandera ? (
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-toga-700">
                            <input
                              id={`c-${c.key}`}
                              type="checkbox"
                              checked={v.valor > 0}
                              disabled={!editable}
                              onChange={(e) =>
                                actualizar(c.key, { valor: e.target.checked ? 1 : 0 })
                              }
                            />
                            Comprobada
                          </label>
                        ) : (
                          <>
                            <input
                              id={`c-${c.key}`}
                              type="number"
                              min={0}
                              step={1}
                              value={v.valor || ""}
                              disabled={!editable}
                              onChange={(e) =>
                                actualizar(c.key, { valor: Number(e.target.value) || 0 })
                              }
                              className="cifra w-24 rounded-md border border-toga-300 px-3 py-1.5 text-sm"
                            />
                            <span className="text-xs text-toga-500">
                              {c.rule.unitLabel ?? "unidades"}
                              {c.rule.threshold !== undefined &&
                                ` (puntúa desde ${c.rule.threshold + 1})`}
                              {c.minimumRequired &&
                                ` · mínimo exigido: ${Number(c.minimumRequired)}`}
                            </span>
                          </>
                        )}
                      </div>

                      {(v.valor > 0 || v.justificacion) && (
                        <div className="mt-2">
                          <label
                            htmlFor={`j-${c.key}`}
                            className="block text-xs font-medium text-toga-600"
                          >
                            Justificación <span className="text-balanza-700">*</span>
                          </label>
                          <textarea
                            id={`j-${c.key}`}
                            rows={2}
                            value={v.justificacion}
                            disabled={!editable}
                            placeholder="Qué documento lo respalda y en qué página."
                            onChange={(e) => actualizar(c.key, { justificacion: e.target.value })}
                            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
                              necesitaJustificacion ? "border-balanza-600" : "border-toga-300"
                            }`}
                          />
                          {necesitaJustificacion && (
                            <p className="mt-1 text-xs font-medium text-balanza-700">
                              La API rechazará el guardado sin justificación.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {/* ── Acciones ─────────────────────────────────────────── */}
          {editable && (
            <div className="sticky bottom-0 space-y-3 rounded-lg border-2 border-toga-300 bg-white p-4">
              <button
                type="button"
                onClick={guardar}
                disabled={pendiente}
                className="w-full rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800 disabled:opacity-60"
              >
                {pendiente ? "Guardando…" : "Guardar y recalcular"}
              </button>
              <button
                type="button"
                disabled={pendiente || sucio}
                onClick={() =>
                  iniciar(async () => {
                    const r = await enviarEvaluacion(evaluacion.id, expediente.id);
                    if (r.ok) router.refresh();
                    else setMensaje({ texto: r.error ?? "No se pudo enviar", error: true });
                  })
                }
                className="w-full rounded-md border border-toga-300 px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-50"
              >
                Enviar a revisión
              </button>
              {sucio && (
                <p className="text-xs text-toga-500">Guarde los cambios antes de enviar.</p>
              )}
            </div>
          )}

          {servidor.estado === "SUBMITTED" && evaluacion.evaluatorId !== usuarioId && (
            <div className="sticky bottom-0 space-y-3 rounded-lg border-2 border-toga-300 bg-white p-4">
              <label htmlFor="motivo" className="block text-xs font-medium text-toga-600">
                Motivo de la aprobación <span className="text-balanza-700">*</span>
              </label>
              <textarea
                id="motivo"
                rows={2}
                value={motivoAprobacion}
                onChange={(e) => setMotivoAprobacion(e.target.value)}
                placeholder="Qué revisó antes de aprobar."
                className="w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={pendiente}
                onClick={() =>
                  iniciar(async () => {
                    const r = await aprobarEvaluacion(
                      evaluacion.id,
                      expediente.id,
                      motivoAprobacion,
                    );
                    if (r.ok) router.refresh();
                    else setMensaje({ texto: r.error ?? "No se pudo aprobar", error: true });
                  })
                }
                className="w-full rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800 disabled:opacity-60"
              >
                Aprobar evaluación
              </button>
            </div>
          )}

          {servidor.estado === "SUBMITTED" && evaluacion.evaluatorId === usuarioId && (
            <p className="rounded-md border border-toga-200 bg-white px-4 py-3 text-sm text-toga-600">
              <span aria-hidden="true" className="mr-1.5">
                🛈
              </span>
              Evaluación enviada. Debe aprobarla otra persona: la revisión por un segundo par de
              ojos es lo que sostiene el proceso.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
