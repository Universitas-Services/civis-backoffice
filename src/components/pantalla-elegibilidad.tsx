"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileStack, FileText, Sparkles, Trash2 } from "lucide-react";
import type { DocumentoExpediente, ExpedienteDetalle } from "@/contracts";
import { CATEGORIA_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import {
  declararElegible,
  declararInelegible,
  generarInformeIaElegibilidad,
} from "@/app/(panel)/evaluacion/[candidateId]/acciones";
import { useToast } from "@/components/toast-provider";
import { VisorDocumentoRevision } from "@/components/revision-maqueta/visor-documento-revision";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";
import {
  borrarTextoInformeIaElegibilidad,
  guardarTextoInformeIaElegibilidad,
  informeIaElegibilidadYaUsado,
  leerTextoInformeIaElegibilidad,
  marcarInformeIaElegibilidadUsado,
} from "@/lib/ia-cupo-sesion";
import {
  BLOQUES_ELEGIBILIDAD,
  CAUSALES_INELEGIBILIDAD,
  checklistCompleto,
  checklistVacio,
  documentosPorPestana,
  guardarDecision,
  PESTANAS_VISOR,
  type BloqueElegibilidadId,
  type CausalInelegibilidadId,
  type ChecklistElegibilidad,
  type DecisionElegibilidad,
  type PestanaVisorId,
} from "@/lib/elegibilidad";

type PestanaId = PestanaVisorId | "otros";

/**
 * Paso 1 — elegibilidad.
 * Mismo modelo de scroll que revisión documental: la página hace scroll;
 * el visor tiene altura fija y sticky; formulario e Informe IA fluyen sin
 * paneles anidados con overflow propio.
 */
export function PantallaElegibilidad({
  expediente,
  evaluador,
}: {
  readonly expediente: ExpedienteDetalle;
  readonly evaluador: { readonly id: string; readonly nombre: string };
}) {
  const router = useRouter();
  const toast = useToast();
  const [pendiente, iniciar] = useTransition();
  const [generandoIa, setGenerandoIa] = useState(false);
  const docs = expediente.submissions[0]?.documents ?? [];
  const fileNumber = expediente.submissions[0]?.fileNumber ?? "—";
  const salaLabel = SALA_ETIQUETA[expediente.chamber] ?? String(expediente.chamber);

  const pestanasConDocs = useMemo(() => {
    const cubiertas = PESTANAS_VISOR.map((p) => ({
      ...p,
      docs: documentosPorPestana(docs, p.id),
    })).filter((p) => p.docs.length > 0);

    const idsCubiertos = new Set(cubiertas.flatMap((p) => p.docs.map((d) => d.id)));
    const huerfanos = docs.filter((d) => !idsCubiertos.has(d.id));
    if (huerfanos.length === 0) {
      return cubiertas as readonly {
        readonly id: PestanaId;
        readonly etiqueta: string;
        readonly docs: DocumentoExpediente[];
      }[];
    }

    return [
      ...cubiertas,
      { id: "otros" as const, etiqueta: "Otros", docs: huerfanos },
    ];
  }, [docs]);

  const [pestanaActiva, setPestanaActiva] = useState<PestanaId | null>(null);
  const [documentoId, setDocumentoId] = useState<string | null>(null);
  const [cupoIaUsado, setCupoIaUsado] = useState(false);
  const [informeIa, setInformeIa] = useState("");

  useEffect(() => {
    setCupoIaUsado(informeIaElegibilidadYaUsado(expediente.id));
    setInformeIa(leerTextoInformeIaElegibilidad(expediente.id));
  }, [expediente.id]);

  // Comprimir sidebar apenas se entra al expediente.
  useEffect(() => {
    marcarSidebarDocumentoAbierto(true);
    return () => marcarSidebarDocumentoAbierto(false);
  }, []);

  const docsDePestana = useMemo(() => {
    if (!pestanaActiva) return [] as DocumentoExpediente[];
    return pestanasConDocs.find((p) => p.id === pestanaActiva)?.docs ?? [];
  }, [pestanaActiva, pestanasConDocs]);

  const documentoSeleccionado = useMemo(() => {
    if (!documentoId) return null;
    return docs.find((d) => d.id === documentoId) ?? null;
  }, [docs, documentoId]);

  const formularioRevision = useMemo(() => {
    if (!documentoSeleccionado?.reviewData) return [] as { clave: string; valor: string }[];
    return Object.entries(documentoSeleccionado.reviewData)
      .filter(([k]) => !k.startsWith("_") && k !== "es_documento" && k !== "calidad_legibilidad")
      .map(([clave, valor]) => ({
        clave,
        valor:
          valor === null || valor === undefined
            ? "—"
            : typeof valor === "boolean"
              ? valor
                ? "Sí"
                : "No"
              : String(valor),
      }))
      .filter((c) => c.valor.trim() !== "");
  }, [documentoSeleccionado]);

  const [checklist, setChecklist] = useState<ChecklistElegibilidad>(checklistVacio);
  const [motivo, setMotivo] = useState("");
  const [confirmandoElegible, setConfirmandoElegible] = useState(false);
  const [panelInelegible, setPanelInelegible] = useState(false);
  const [causales, setCausales] = useState<Set<CausalInelegibilidadId>>(new Set());

  const completo = checklistCompleto(checklist);

  function seleccionarPestana(id: PestanaId) {
    setPestanaActiva(id);
    setDocumentoId(null);
  }

  function seleccionarDocumento(id: string) {
    setDocumentoId(id);
  }

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

  function onCambiarInformeIa(texto: string) {
    setInformeIa(texto);
    guardarTextoInformeIaElegibilidad(expediente.id, texto);
  }

  function onBorrarInformeIa() {
    setInformeIa("");
    borrarTextoInformeIaElegibilidad(expediente.id);
  }

  function onGenerarInformeIa() {
    if (cupoIaUsado || generandoIa) return;
    setGenerandoIa(true);
    void (async () => {
      const r = await generarInformeIaElegibilidad(expediente.id);
      setGenerandoIa(false);
      if (!r.ok || !r.texto) {
        toast.error(r.error ?? "No se pudo generar el Informe IA.");
        return;
      }
      marcarInformeIaElegibilidadUsado(expediente.id);
      setCupoIaUsado(true);
      onCambiarInformeIa(r.texto);
      toast.exito("Informe IA generado. Puede editarlo antes de dictaminar.");
    })();
  }

  function construirDecisionBase(
    resultado: DecisionElegibilidad["resultado"],
  ): DecisionElegibilidad {
    const actualizadoEn = new Date().toISOString();
    const resumen = {
      fileNumber,
      postulanteNombre: `${expediente.firstName} ${expediente.lastName}`,
      nationalId: expediente.nationalId,
      salaLabel,
      evaluadorNombre: evaluador.nombre,
      evaluadorId: evaluador.id,
    };
    return {
      candidateId: expediente.id,
      resultado,
      checklist,
      motivo: motivo.trim(),
      resumen,
      actualizadoEn,
      ficha:
        resultado === "INELEGIBLE"
          ? {
              ...resumen,
              causales: [...causales],
              motivo: motivo.trim(),
              fechaIso: actualizadoEn,
            }
          : null,
    };
  }

  function onDeclararElegible() {
    if (!completo) {
      toast.error("Debe marcar los seis requisitos del checklist.");
      return;
    }
    setConfirmandoElegible(true);
  }

  function confirmarElegible() {
    const decision = construirDecisionBase("ELEGIBLE");
    guardarDecision(decision);
    iniciar(async () => {
      const r = await declararElegible(expediente.id, {
        checklist,
        motivo: motivo.trim() || undefined,
      });
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo registrar la elegibilidad.");
        setConfirmandoElegible(false);
        return;
      }
      toast.exito("Postulante declarado elegible. Continúe en Baremo.");
      router.push("/baremo");
      router.refresh();
    });
  }

  function onAbrirInelegible() {
    if (!motivo.trim()) {
      toast.error("Indique el motivo fundamentado de la inelegibilidad.");
      return;
    }
    setPanelInelegible(true);
  }

  function confirmarInelegible() {
    if (causales.size === 0) {
      toast.error("Marque al menos una causal de inelegibilidad.");
      return;
    }
    if (!motivo.trim()) {
      toast.error("El motivo es obligatorio.");
      return;
    }
    const decision = construirDecisionBase("INELEGIBLE");
    guardarDecision(decision);
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
      toast.exito("Dictamen de inelegibilidad registrado.");
      router.push("/evaluacion");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
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
            En revisión de elegibilidad — Paso 1
          </span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <section
          aria-label="Visualización y formulario del revisor"
          className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6"
        >
          <div
            role="tablist"
            aria-label="Clasificación de documentos"
            className="-mx-5 -mt-5 mb-4 flex overflow-x-auto border-b border-toga-200 bg-toga-50 sm:-mx-6 sm:-mt-6"
          >
            {pestanasConDocs.length === 0 ? (
              <p className="px-4 py-2.5 text-sm text-toga-500">Sin documentos en el expediente.</p>
            ) : (
              pestanasConDocs.map((p) => (
                <button
                  key={p.id}
                  role="tab"
                  type="button"
                  aria-selected={pestanaActiva === p.id}
                  onClick={() => seleccionarPestana(p.id)}
                  className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    pestanaActiva === p.id
                      ? "border-balanza-600 bg-white text-toga-900"
                      : "border-transparent text-toga-500 hover:text-toga-900"
                  }`}
                >
                  {p.etiqueta}
                  <span className="cifra ml-1.5 text-xs text-toga-400">({p.docs.length})</span>
                </button>
              ))
            )}
          </div>

          {pestanaActiva && docsDePestana.length > 0 && (
            <div
              className="mb-4 flex flex-wrap gap-2"
              role="list"
              aria-label="Documentos de la clasificación"
            >
              {docsDePestana.map((d) => {
                const activo = documentoSeleccionado?.id === d.id;
                const etiqueta =
                  d.originalName?.trim() ||
                  CATEGORIA_ETIQUETA[d.category] ||
                  String(d.category);
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="listitem"
                    title={etiqueta}
                    onClick={() => seleccionarDocumento(d.id)}
                    className={`inline-flex max-w-[16rem] items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                      activo
                        ? "border-balanza-600 bg-balanza-50 text-toga-900"
                        : "border-toga-200 bg-white text-toga-700 hover:border-toga-300"
                    }`}
                  >
                    <FileText
                      className={`h-3.5 w-3.5 shrink-0 ${activo ? "text-balanza-700" : "text-toga-400"}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 truncate font-medium">{etiqueta}</span>
                  </button>
                );
              })}
            </div>
          )}

          {documentoSeleccionado ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-toga-900">
                Visualización y formulario
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <VisorDocumentoRevision
                  key={documentoSeleccionado.id}
                  documentId={documentoSeleccionado.id}
                  nombreArchivo={documentoSeleccionado.originalName}
                  sizeKb={Math.max(1, Math.round(documentoSeleccionado.sizeBytes / 1024))}
                  titulo={
                    CATEGORIA_ETIQUETA[documentoSeleccionado.category] ??
                    String(documentoSeleccionado.category)
                  }
                />
                <div>
                  <h3 className="text-sm font-semibold text-toga-900">
                    Formulario del revisor
                  </h3>
                  <p className="mt-1 text-xs text-toga-500">
                    Datos capturados en revisión documental
                  </p>
                  {formularioRevision.length === 0 ? (
                    <p className="mt-4 text-sm text-toga-500">
                      Este documento no tiene formulario de revisión guardado.
                    </p>
                  ) : (
                    <dl className="mt-4 space-y-3">
                      {formularioRevision.map((c) => (
                        <div key={c.clave}>
                          <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-toga-400">
                            {etiquetaCampoRevision(c.clave)}
                          </dt>
                          <dd className="mt-0.5 whitespace-pre-wrap text-sm text-toga-800">
                            {c.valor}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-toga-700">
                Ningún documento seleccionado
              </p>
              <p className="mt-1 max-w-sm text-xs text-toga-500">
                Elija una clasificación y un documento. Se mostrarán el archivo cargado y el
                formulario que llenó el revisor.
              </p>
            </div>
          )}
        </section>

        <aside aria-label="Informe IA y elegibilidad" className="space-y-4 lg:sticky lg:top-4">
          <div className="rounded-lg border border-toga-200 bg-white p-4">
            <div className="flex items-start gap-2">
              <Sparkles
                className="mt-0.5 h-4 w-4 shrink-0 text-balanza-700"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-toga-900">Informe IA</h2>
                <p className="mt-1 text-xs text-toga-500">
                  Resumen editable. Solo una generación por sesión.
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={cupoIaUsado || generandoIa}
                onClick={onGenerarInformeIa}
                title={
                  cupoIaUsado
                    ? "Ya generado en esta sesión"
                    : "Generar informe con IA (una vez por sesión)"
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {generandoIa ? "Generando…" : "Generar"}
              </button>
              <button
                type="button"
                disabled={!informeIa.trim()}
                onClick={onBorrarInformeIa}
                className="inline-flex items-center gap-1.5 rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Borrar
              </button>
            </div>
            {cupoIaUsado && (
              <p className="mt-2 text-xs text-toga-500">
                Ya generado en esta sesión. Puede editar o borrar el texto.
              </p>
            )}
            <label htmlFor="informe-ia-elegibilidad" className="sr-only">
              Texto del Informe IA
            </label>
            <textarea
              id="informe-ia-elegibilidad"
              rows={5}
              value={informeIa}
              onChange={(e) => onCambiarInformeIa(e.target.value)}
              placeholder="El Informe IA aparecerá aquí tras generarlo."
              className="mt-3 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400 focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20"
            />
          </div>

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
                      onChange={() => toggleBloque(b.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-toga-300 text-balanza-600 focus:ring-balanza-600/30"
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
              <p className="mt-1 text-xs text-toga-500">Obligatoria si declara inelegible.</p>
              <textarea
                id="motivo-elegibilidad"
                rows={4}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Fundamentación jurídica del dictamen…"
                className="mt-2 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400 focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20"
              />
            </div>

            <div className="mt-4">
              {panelInelegible ? (
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
                      disabled={pendiente}
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
                    ¿Confirma declarar elegible a{" "}
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
                      {pendiente ? "Registrando…" : "Confirmar y pasar al baremo"}
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
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={onAbrirInelegible}
                    className="w-full rounded-md border border-balanza-600 bg-white px-3 py-2.5 text-sm font-semibold text-balanza-700 hover:bg-balanza-50 disabled:opacity-60"
                  >
                    Declarar inelegible
                  </button>
                  <button
                    type="button"
                    disabled={pendiente || !completo}
                    onClick={onDeclararElegible}
                    className="w-full rounded-md bg-balanza-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Declarar elegible y pasar al baremo
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function etiquetaCampoRevision(clave: string): string {
  if (clave === "advertencias" || clave === "advertencia") return "Nota";
  return clave.replace(/_/g, " ");
}
