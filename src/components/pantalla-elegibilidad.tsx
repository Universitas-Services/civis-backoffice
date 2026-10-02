"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ExpedienteDetalle, RondaComiteAbierta } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import {
  declararElegible,
  declararInelegible,
  generarInformeIaElegibilidad,
  leerInformeIaElegibilidad,
  recusarEnComite,
} from "@/app/(panel)/evaluacion/[candidateId]/acciones";
import { InformeIaSheet } from "@/components/informe-ia-sheet";
import { PanelResolucionEscalada } from "@/components/panel-resolucion-escalada";
import { PanelTallyComite } from "@/components/panel-tally-comite";
import { useToast } from "@/components/toast-provider";
import { VistaDocumentosFormulario } from "@/components/vista-documentos-formulario";
import { documentosVigentes } from "@/lib/documentos-vigentes";
import { esperarRetrasoInformeIa } from "@/lib/retraso-informe-ia";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";
import {
  BLOQUES_ELEGIBILIDAD,
  CAUSALES_INELEGIBILIDAD,
  checklistCompleto,
  checklistVacio,
  type BloqueElegibilidadId,
  type CausalInelegibilidadId,
  type ChecklistElegibilidad,
} from "@/lib/elegibilidad";

/**
 * Paso 1 — elegibilidad.
 * Documentos y formulario quedan fijos mientras la columna de elegibilidad
 * hace scroll. El Informe IA vive en una hoja lateral que abre un botón flotante.
 */
export function PantallaElegibilidad({
  expediente,
  modoComite = false,
  yaActuoEnRondaElegibilidad = false,
  rondaEscalada = null,
  rondaAbierta = null,
  puedeResolverEscalada = false,
  puedeVotarElegibilidad = true,
  mostrarTallySuperAdmin = false,
}: {
  readonly expediente: ExpedienteDetalle;
  readonly evaluador: { readonly id: string; readonly nombre: string };
  readonly modoComite?: boolean;
  readonly yaActuoEnRondaElegibilidad?: boolean;
  readonly rondaEscalada?: RondaComiteAbierta | null;
  readonly rondaAbierta?: RondaComiteAbierta | null;
  readonly puedeResolverEscalada?: boolean;
  readonly puedeVotarElegibilidad?: boolean;
  readonly mostrarTallySuperAdmin?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pendiente, iniciar] = useTransition();
  const [preparandoIa, setPreparandoIa] = useState(false);
  const [informeGuardado, setInformeGuardado] = useState("");
  const [informeVisible, setInformeVisible] = useState("");
  const [revelado, setRevelado] = useState(false);
  const docs = documentosVigentes(expediente.submissions[0]?.documents ?? []);
  const fileNumber = expediente.submissions[0]?.fileNumber ?? "—";
  const salaLabel = SALA_ETIQUETA[expediente.chamber] ?? String(expediente.chamber);

  // Indicador del botón: GET silencioso (sin retraso ni toast de error).
  useEffect(() => {
    if (!puedeVotarElegibilidad) return;
    let cancelado = false;
    void (async () => {
      const r = await leerInformeIaElegibilidad(expediente.id);
      if (cancelado || !r.ok) return;
      if (r.texto.trim()) setInformeGuardado(r.texto);
    })();
    return () => {
      cancelado = true;
    };
  }, [expediente.id, puedeVotarElegibilidad]);

  // Comprimir sidebar apenas se entra al expediente.
  useEffect(() => {
    marcarSidebarDocumentoAbierto(true);
    return () => marcarSidebarDocumentoAbierto(false);
  }, []);

  const [checklist, setChecklist] = useState<ChecklistElegibilidad>(checklistVacio);
  const [motivo, setMotivo] = useState("");
  const [confirmandoElegible, setConfirmandoElegible] = useState(false);
  const [panelInelegible, setPanelInelegible] = useState(false);
  const [panelRecusacion, setPanelRecusacion] = useState(false);
  const [motivoRecusacion, setMotivoRecusacion] = useState("");
  const [causales, setCausales] = useState<Set<CausalInelegibilidadId>>(new Set());

  const completo = checklistCompleto(checklist);
  const enEscalada = Boolean(rondaEscalada && rondaEscalada.status === "ESCALATED");
  const reopenReason =
    rondaAbierta?.result &&
    typeof rondaAbierta.result === "object" &&
    !Array.isArray(rondaAbierta.result) &&
    ((rondaAbierta.result as { reopenedReason?: string }).reopenedReason === "TIE" ||
      (rondaAbierta.result as { reopenedReason?: string }).reopenedReason === "DEADLINE")
      ? (rondaAbierta.result as { reopenedReason: "TIE" | "DEADLINE" }).reopenedReason
      : null;
  const bloqueoVotoComite =
    !puedeVotarElegibilidad ||
    (modoComite && yaActuoEnRondaElegibilidad) ||
    (enEscalada && !puedeResolverEscalada);
  const puedeEmitirVotoComite =
    puedeVotarElegibilidad && modoComite && !yaActuoEnRondaElegibilidad && !enEscalada;

  function toggleBloque(id: BloqueElegibilidadId) {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleCausal(id: CausalInelegibilidadId) {
    setCausales((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /**
   * Al abrir o al pulsar Generar: GET; si hay texto → retraso simulado;
   * si vacío → POST una vez (409 → re-GET). No se regenera ni edita.
   */
  function cargarOGenerarInformeIa() {
    if (preparandoIa) return;
    if (revelado && informeVisible.trim()) return;

    setPreparandoIa(true);
    void (async () => {
      try {
        const leido = await leerInformeIaElegibilidad(expediente.id);
        let texto = leido.ok ? leido.texto.trim() : "";

        if (!texto) {
          const gen = await generarInformeIaElegibilidad(expediente.id);
          if (!gen.ok || !gen.texto?.trim()) {
            if (!leido.ok) {
              toast.error(leido.error ?? "No se pudo cargar el Informe IA.");
            } else {
              toast.error(gen.error ?? "No se pudo generar el Informe IA.");
            }
            return;
          }
          texto = gen.texto.trim();
        }

        await esperarRetrasoInformeIa();
        setInformeGuardado(texto);
        setInformeVisible(texto);
        setRevelado(true);
      } finally {
        setPreparandoIa(false);
      }
    })();
  }

  function errorMotivo(): string | null {
    const texto = motivo.trim();
    if (texto.length < 20) {
      return "La fundamentación es obligatoria (mínimo 20 caracteres).";
    }
    if (texto.length > 3000) {
      return "La fundamentación no puede superar 3000 caracteres.";
    }
    return null;
  }

  function onDeclararElegible() {
    if (!completo) {
      toast.error("Debe marcar los seis requisitos del checklist.");
      return;
    }
    const falloMotivo = errorMotivo();
    if (falloMotivo) {
      toast.error(falloMotivo);
      return;
    }
    setPanelInelegible(false);
    setPanelRecusacion(false);
    setConfirmandoElegible(true);
  }

  function confirmarElegible() {
    const falloMotivo = errorMotivo();
    if (falloMotivo) {
      toast.error(falloMotivo);
      return;
    }
    iniciar(async () => {
      const r = await declararElegible(expediente.id, {
        checklist,
        motivo: motivo.trim(),
      });
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo registrar la elegibilidad.");
        setConfirmandoElegible(false);
        return;
      }
      if (r.votoComite) {
        toast.exito("Voto de elegibilidad registrado. El veredicto se cierra al alcanzar el quorum.");
        router.push("/evaluacion");
      } else {
        toast.exito("Postulante declarado elegible. Continúe en Baremo.");
        router.push("/baremo");
      }
      router.refresh();
    });
  }

  function onAbrirInelegible() {
    if (completo) {
      toast.error("Con el checklist completo el dictamen es de elegibilidad.");
      return;
    }
    const falloMotivo = errorMotivo();
    if (falloMotivo) {
      toast.error(falloMotivo);
      return;
    }
    setConfirmandoElegible(false);
    setPanelRecusacion(false);
    setPanelInelegible(true);
  }

  function onAbrirRecusacion() {
    setConfirmandoElegible(false);
    setPanelInelegible(false);
    setPanelRecusacion(true);
  }

  function confirmarRecusacion() {
    const razon = motivoRecusacion.trim();
    if (razon.length < 10) {
      toast.error("El motivo de la recusación debe tener al menos 10 caracteres.");
      return;
    }
    iniciar(async () => {
      const r = await recusarEnComite(expediente.id, razon);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo registrar la recusación.");
        return;
      }
      toast.exito(
        "Recusación registrada. No cuenta como voto en contra del postulante.",
      );
      router.push("/evaluacion");
      router.refresh();
    });
  }

  function confirmarInelegible() {
    if (completo) {
      toast.error("Con el checklist completo el dictamen es de elegibilidad.");
      return;
    }
    if (causales.size === 0) {
      toast.error("Marque al menos una causal de inelegibilidad.");
      return;
    }
    const falloMotivo = errorMotivo();
    if (falloMotivo) {
      toast.error(falloMotivo);
      return;
    }
    iniciar(async () => {
      const r = await declararInelegible(expediente.id, {
        checklist,
        motivo: motivo.trim(),
        causales: [...causales],
      });
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo registrar la inelegibilidad.");
        return;
      }
      toast.exito(
        r.votoComite
          ? "Voto de inelegibilidad registrado. El veredicto se cierra al alcanzar el quorum."
          : "Dictamen de inelegibilidad registrado.",
      );
      router.push("/evaluacion");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6">
        <Link
          href="/evaluacion"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-balanza-700 hover:text-balanza-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a evaluación
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="codigo text-xs text-toga-500">{fileNumber}</p>
            <h1 className="mt-0.5 text-lg font-semibold text-toga-900">
              {expediente.firstName} {expediente.lastName}
            </h1>
            <p className="mt-1 text-sm text-toga-500">{salaLabel}</p>
          </div>
          <span className="inline-flex rounded-full bg-toga-100 px-2.5 py-1 text-xs font-medium text-toga-700">
            {enEscalada
              ? "Comité — ronda escalada"
              : modoComite
                ? "Comité — voto de elegibilidad (voto oculto)"
                : "En revisión de elegibilidad — Paso 1"}
          </span>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.9fr)]">
        <div className="xl:sticky xl:top-4 xl:z-10 xl:max-h-[calc(100dvh-1.5rem)] xl:self-start xl:overflow-y-auto">
          <VistaDocumentosFormulario documentos={docs} anclarVisor={false} ampliar />
        </div>

        <aside aria-label="Elegibilidad" className="space-y-4">
          {enEscalada && rondaEscalada && puedeResolverEscalada ? (
            <PanelResolucionEscalada candidateId={expediente.id} ronda={rondaEscalada} />
          ) : null}
          {mostrarTallySuperAdmin &&
          rondaAbierta?.kind === "ELIGIBILITY" &&
          rondaAbierta.status === "OPEN" ? (
            <PanelTallyComite candidateId={expediente.id} ronda={rondaAbierta} />
          ) : null}
          {reopenReason && !enEscalada ? (
            <div
              className="rounded-lg border border-balanza-600/30 bg-balanza-50 p-4 text-sm leading-relaxed text-toga-800"
              role="status"
            >
              <p className="font-semibold text-toga-900">
                {reopenReason === "TIE"
                  ? "Ronda reabierta por empate"
                  : "Ronda reabierta por plazo vencido"}
              </p>
              <p className="mt-1">
                Debe volver a emitir su voto o recusación en esta nueva ronda. Los votos
                anteriores quedaron en historial.
              </p>
            </div>
          ) : null}
          {enEscalada && !puedeResolverEscalada ? (
            <div
              className="rounded-lg border border-balanza-600/25 bg-balanza-50/60 p-4 text-sm leading-relaxed text-toga-800"
              role="status"
            >
              <p className="font-semibold text-toga-900">En espera de resolución administrativa</p>
              <p className="mt-1">
                Esta ronda quedó escalada (empate o plazo sin quorum). Un administrador debe
                reabrirla. Puede revisar documentos; no puede votar hasta entonces.
              </p>
            </div>
          ) : null}
          {!enEscalada && !puedeVotarElegibilidad ? (
            <div
              className="rounded-lg border border-toga-200 bg-toga-50/80 p-4 text-sm leading-relaxed text-toga-800"
              role="status"
            >
              <p className="font-semibold text-toga-900">Consulta administrativa</p>
              <p className="mt-1">
                Puede revisar el expediente. El voto de elegibilidad corresponde a los
                evaluadores; las rondas escaladas se resuelven desde la pestaña Escaladas.
              </p>
            </div>
          ) : null}
          {bloqueoVotoComite && !enEscalada && puedeVotarElegibilidad ? (
            <div
              className="rounded-lg border border-balanza-600/25 bg-balanza-50/60 p-4 text-sm leading-relaxed text-toga-800"
              role="status"
            >
              <p className="font-semibold text-toga-900">Voto ya registrado</p>
              <p className="mt-1">
                Ya emitió su actuación en esta ronda de elegibilidad. No puede volver a votar ni
                cambiar recusación hasta que cierre el quorum. Puede revisar documentos; el
                veredicto y el paso a baremo se definirán al cerrar la ronda.
              </p>
            </div>
          ) : null}
          {enEscalada && puedeResolverEscalada ? null : !puedeVotarElegibilidad && !enEscalada ? null : (
          <div className="rounded-lg border border-toga-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-toga-900">Lista de verificación</h2>
            <p className="mt-1 text-xs text-toga-500">
              Marque cada requisito tras constatar el soporte.
            </p>
            <ul className="mt-3 space-y-2">
              {BLOQUES_ELEGIBILIDAD.map((b) => (
                <li key={b.id}>
                  <label className="flex cursor-pointer gap-2.5 rounded-md border border-toga-200 bg-toga-50/50 px-2.5 py-2.5 hover:bg-toga-50">
                    <input
                      type="checkbox"
                      checked={checklist[b.id]}
                      disabled={bloqueoVotoComite}
                      onChange={() => toggleBloque(b.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-toga-300 text-balanza-600 focus:ring-balanza-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-toga-900">
                          {b.orden}. {b.tituloCorto}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium ${
                            b.estatus === "EXCLUYENTE"
                              ? "bg-balanza-50 text-balanza-700 ring-1 ring-inset ring-balanza-600/20"
                              : "bg-toga-100 text-toga-600"
                          }`}
                        >
                          {b.estatus === "EXCLUYENTE" ? "Excluyente" : "Obligatorio"}
                        </span>
                      </span>
                      <span className="mt-1 block text-[0.7rem] leading-relaxed text-toga-600">
                        {b.criterio}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <label
                htmlFor="motivo-elegibilidad"
                className="block text-sm font-semibold text-toga-900"
              >
                Fundamentación
              </label>
              <p className="mt-1 text-xs text-toga-500">
                Obligatoria en ambos dictámenes (entre 20 y 3000 caracteres).
              </p>
              <textarea
                id="motivo-elegibilidad"
                rows={4}
                value={motivo}
                disabled={bloqueoVotoComite}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Fundamentación jurídica del dictamen…"
                className="mt-2 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400 focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20 disabled:cursor-not-allowed disabled:bg-toga-50 disabled:opacity-70"
              />
            </div>

            <div className="mt-4">
              {bloqueoVotoComite ? null : panelInelegible ? (
                <div className="space-y-3 rounded-lg border border-balanza-600/30 bg-balanza-50/40 p-3">
                  <h3 className="text-sm font-semibold text-toga-900">
                    Causales de inelegibilidad
                  </h3>
                  <ul className="space-y-2">
                    {CAUSALES_INELEGIBILIDAD.map((c) => (
                      <li key={c.id}>
                        <label className="flex cursor-pointer gap-2 text-xs text-toga-800">
                          <input
                            type="checkbox"
                            checked={causales.has(c.id)}
                            onChange={() => toggleCausal(c.id)}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-toga-300 text-balanza-600"
                          />
                          <span>
                            <span className="font-medium">Causal {c.orden}.</span> {c.texto}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={pendiente || completo}
                      onClick={confirmarInelegible}
                      className="rounded-md bg-balanza-700 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-800 disabled:opacity-60"
                    >
                      {pendiente ? "Registrando…" : "Confirmar inelegibilidad"}
                    </button>
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() => setPanelInelegible(false)}
                      className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : confirmandoElegible ? (
                <div className="space-y-3 rounded-lg border border-balanza-600/25 bg-balanza-50/40 p-3">
                  <p className="text-sm text-toga-800">
                    ¿Confirma {modoComite ? "votar elegible a" : "declarar elegible a"}{" "}
                    <span className="font-semibold">
                      {expediente.firstName} {expediente.lastName}
                    </span>
                    ?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={confirmarElegible}
                      className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
                    >
                      {pendiente
                        ? "Registrando…"
                        : modoComite
                          ? "Confirmar voto elegible"
                          : "Confirmar y pasar al baremo"}
                    </button>
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() => setConfirmandoElegible(false)}
                      className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : panelRecusacion ? (
                <div className="space-y-3 rounded-lg border border-toga-300 bg-toga-50/50 p-3">
                  <h3 className="text-sm font-semibold text-toga-900">Recusación</h3>
                  <p className="text-xs text-toga-600">
                    Indique el motivo (conflicto de interés u otra causa). No cuenta como
                    voto en contra del postulante. Mínimo 10 caracteres.
                  </p>
                  <label htmlFor="motivo-recusacion" className="block text-sm">
                    <span className="font-medium text-toga-800">Motivo de la recusación</span>
                    <textarea
                      id="motivo-recusacion"
                      rows={3}
                      value={motivoRecusacion}
                      disabled={pendiente}
                      onChange={(e) => setMotivoRecusacion(e.target.value)}
                      placeholder="Describa el motivo de apartarse de este expediente…"
                      className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400 focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20 disabled:opacity-60"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={pendiente || motivoRecusacion.trim().length < 10}
                      onClick={confirmarRecusacion}
                      className="rounded-md bg-balanza-700 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-800 disabled:opacity-60"
                    >
                      {pendiente ? "Registrando…" : "Confirmar recusación"}
                    </button>
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() => {
                        setPanelRecusacion(false);
                        setMotivoRecusacion("");
                      }}
                      className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={pendiente || completo || bloqueoVotoComite}
                    onClick={onAbrirInelegible}
                    className="w-full rounded-md border border-balanza-600 bg-white px-3 py-2.5 text-sm font-semibold text-balanza-700 hover:bg-balanza-50 disabled:opacity-60"
                  >
                    {modoComite ? "Votar inelegible" : "Declarar inelegible"}
                  </button>
                  <button
                    type="button"
                    disabled={pendiente || !completo || bloqueoVotoComite}
                    onClick={onDeclararElegible}
                    className="w-full rounded-md bg-balanza-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {modoComite
                      ? "Votar elegible"
                      : "Declarar elegible y pasar al baremo"}
                  </button>
                  {modoComite && puedeEmitirVotoComite && (
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={onAbrirRecusacion}
                      className="w-full rounded-md border border-toga-300 bg-white px-3 py-2.5 text-sm font-medium text-toga-700 hover:bg-toga-50 disabled:opacity-60"
                    >
                      Apartarme de este expediente (recusación)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          )}
        </aside>
      </div>

      {puedeVotarElegibilidad ? (
        <InformeIaSheet
          nombrePostulante={`${expediente.firstName} ${expediente.lastName}`}
          informe={informeVisible}
          generando={preparandoIa}
          disponible={informeGuardado.trim().length > 0 || informeVisible.trim().length > 0}
          soloLectura
          descripcion={`Resumen del expediente de ${expediente.firstName} ${expediente.lastName}. Es un apoyo: el dictamen lo decide usted. El texto es el mismo para todo el comité y no se puede editar.`}
          onAbrir={cargarOGenerarInformeIa}
          onGenerar={cargarOGenerarInformeIa}
          onCambiar={() => undefined}
          onBorrar={() => undefined}
        />
      ) : null}
    </div>
  );
}
