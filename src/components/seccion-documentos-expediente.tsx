"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileStack, FileText } from "lucide-react";
import {
  CATEGORIA_ETIQUETA,
  categoryDesdeSlotKey,
  slotKeyDesdeCategory,
  type DocumentoExpediente,
  type WorkflowStatus,
} from "@/contracts";
import { enviarARevision } from "@/app/(panel)/expedientes/nuevo/acciones";
import { useToast } from "@/components/toast-provider";
import { InsigniaAnalisis, InsigniaClasificacion } from "@/components/insignias";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarChecklistDocumentos } from "@/components/expediente-maqueta/sidebar-checklist-documentos";
import {
  SlotDocumentoPdf,
  type ArchivoGuardado,
} from "@/components/expediente-maqueta/slot-documento-pdf";
import { iconoParaSlot } from "@/components/expediente-maqueta/iconos-documento";
import { construirSlotsVisibles } from "@/lib/maqueta-expediente-documentos";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";

function sembrarGuardados(
  documentos: readonly DocumentoExpediente[],
): Record<string, ArchivoGuardado[]> {
  const out: Record<string, ArchivoGuardado[]> = {};
  for (const d of documentos) {
    const slotKey = slotKeyDesdeCategory(d.category) ?? String(d.category).toLowerCase();
    const item: ArchivoGuardado = {
      id: d.id,
      name: d.originalName,
      size: d.sizeBytes,
    };
    out[slotKey] = [...(out[slotKey] ?? []), item];
  }
  return out;
}

/**
 * Documentos del expediente en el detalle: checklist + slot (como en nuevo)
 * cuando se puede cargar; lista simple en solo lectura.
 */
export function SeccionDocumentosExpediente({
  candidateId,
  submissionId,
  workflowStatus,
  documentos,
  puedeCargar,
}: {
  readonly candidateId: string;
  readonly submissionId: string | null;
  readonly workflowStatus: WorkflowStatus;
  readonly documentos: readonly DocumentoExpediente[];
  readonly puedeCargar: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const esBorrador = workflowStatus === "DRAFT";
  const mostrarEnvio = puedeCargar && esBorrador;

  const [pendientes, setPendientes] = useState<Record<string, File | null>>({});
  const [guardados, setGuardados] = useState<Record<string, ArchivoGuardado[]>>(() =>
    sembrarGuardados(documentos),
  );
  const [activo, setActivo] = useState<string | undefined>();
  const [guardando, setGuardando] = useState(false);
  const [enviandoRevision, setEnviandoRevision] = useState(false);
  const [confirmandoRevision, setConfirmandoRevision] = useState(false);

  const slots = useMemo(() => construirSlotsVisibles(), []);
  const slotActivo = slots.find((s) => s.slotKey === activo);

  useEffect(() => {
    setGuardados(sembrarGuardados(documentos));
  }, [documentos]);

  useEffect(() => {
    if (!puedeCargar) return;
    marcarSidebarDocumentoAbierto(Boolean(activo));
    return () => marcarSidebarDocumentoAbierto(false);
  }, [activo, puedeCargar]);

  const slotsConGuardados = useMemo(() => {
    const set = new Set<string>();
    for (const [key, list] of Object.entries(guardados)) {
      if (list.length > 0) set.add(key);
    }
    return set;
  }, [guardados]);

  function seleccionar(slotKey: string) {
    if (enviandoRevision) return;
    setActivo(slotKey);
  }

  function setPendiente(slotKey: string, file: File | null) {
    setPendientes((prev) => ({ ...prev, [slotKey]: file }));
  }

  async function guardarDocumento(slotKey: string) {
    const file = pendientes[slotKey];
    const slot = slots.find((s) => s.slotKey === slotKey);
    if (!file || !slot || !submissionId || enviandoRevision) return;
    if (!slot.multiple && (guardados[slotKey]?.length ?? 0) > 0) return;

    const category = categoryDesdeSlotKey(slotKey);
    if (!category) {
      toast.error("Tipo de documento no reconocido.");
      return;
    }

    setGuardando(true);
    try {
      const cuerpo = new FormData();
      cuerpo.append("category", category);
      cuerpo.append("file", file);

      const respuesta = await fetch(`/api/documentos/${submissionId}`, {
        method: "POST",
        body: cuerpo,
      });
      const datosResp = (await respuesta.json()) as {
        id?: string;
        originalName?: string;
        sizeBytes?: number;
        message?: string;
      };

      if (!respuesta.ok || !datosResp.id) {
        toast.error(datosResp.message ?? "No se pudo cargar el documento.");
        return;
      }

      const nuevo: ArchivoGuardado = {
        id: datosResp.id,
        name: datosResp.originalName ?? file.name,
        size: datosResp.sizeBytes ?? file.size,
      };
      setGuardados((prev) => ({
        ...prev,
        [slotKey]: [...(prev[slotKey] ?? []), nuevo],
      }));
      setPendientes((prev) => ({ ...prev, [slotKey]: null }));
      toast.exito(`Documento guardado: ${slot.titulo}`);
      router.refresh();
    } catch {
      toast.error("Fallo de conexión al cargar el documento.");
    } finally {
      setGuardando(false);
    }
  }

  function quitarGuardado(slotKey: string, id: string) {
    if (enviandoRevision) return;
    setGuardados((prev) => ({
      ...prev,
      [slotKey]: (prev[slotKey] ?? []).filter((g) => g.id !== id),
    }));
  }

  function pedirConfirmacionEnvio() {
    if (!submissionId || enviandoRevision) return;
    setConfirmandoRevision(true);
  }

  function confirmarEnviarRevision() {
    if (!submissionId) return;
    setConfirmandoRevision(false);
    setEnviandoRevision(true);
    setActivo(undefined);
    void enviarARevision(candidateId).then((r) => {
      if (r.ok) {
        toast.exito("Expediente enviado a revisión documental");
        router.refresh();
      } else {
        toast.error(r.error ?? "No se pudo enviar");
        setEnviandoRevision(false);
      }
    });
  }

  if (!puedeCargar) {
    return (
      <Card>
        <CardHeader>
          <CardTitle id="documentos" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-toga-500" aria-hidden="true" />
            Documentos del expediente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-toga-300 bg-toga-50 p-8 text-center text-sm text-toga-500">
              Este expediente todavía no tiene documentos cargados.
            </p>
          ) : (
            <ul className="space-y-3">
              {documentos.map((d) => (
                <li key={d.id} className="rounded-lg border border-toga-200 bg-toga-50/50 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate font-medium text-toga-900">
                      {d.originalName}
                    </span>
                    <span className="shrink-0 text-xs text-toga-500">
                      {(CATEGORIA_ETIQUETA as Record<string, string>)[d.category] ?? d.category} ·{" "}
                      {Math.round(d.sizeBytes / 1024)} KB
                      {d.version > 1 && ` · versión ${d.version}`}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <InsigniaClasificacion valor={d.classification} />
                    <InsigniaAnalisis valor={d.scanStatus} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }

  const bloqueado = enviandoRevision;

  return (
    <Card>
      <CardHeader>
        <CardTitle id="documentos" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-toga-500" aria-hidden="true" />
          Documentos del expediente
        </CardTitle>
        {mostrarEnvio && (
          <CardDescription>
            Seleccione un recaudo del listado para cargarlo. Puede enviar a revisión documental
            cuando corresponda.
          </CardDescription>
        )}
        {!mostrarEnvio && puedeCargar && (
          <CardDescription>
            Puede cargar documentos adicionales mientras el expediente esté en revisión
            documental.
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
          <div className="space-y-4">
            <div className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
              {slotActivo ? (
                <SlotDocumentoPdf
                  slotKey={slotActivo.slotKey}
                  titulo={slotActivo.titulo}
                  ayuda={slotActivo.ayuda}
                  Icono={iconoParaSlot(slotActivo)}
                  multiple={slotActivo.multiple}
                  notaMultiple={slotActivo.notaMultiple}
                  etiquetaAnadir={slotActivo.etiquetaAnadir}
                  pendiente={pendientes[slotActivo.slotKey] ?? null}
                  guardados={guardados[slotActivo.slotKey] ?? []}
                  bloqueado={bloqueado || !submissionId}
                  guardando={guardando}
                  onPendiente={(f) => setPendiente(slotActivo.slotKey, f)}
                  onGuardar={() => void guardarDocumento(slotActivo.slotKey)}
                  onQuitarGuardado={(id) => quitarGuardado(slotActivo.slotKey, id)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                  <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-toga-700">
                    Seleccione un documento del listado
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-toga-500">
                    Al elegir un ítem se abre aquí la tarjeta para adjuntar el PDF o la imagen y
                    guardarlo.
                  </p>
                </div>
              )}
            </div>

            {mostrarEnvio && (
              <div className="rounded-lg border border-toga-200 bg-white px-5 py-4 sm:px-6">
                {confirmandoRevision ? (
                  <div className="space-y-3">
                    <p className="text-sm text-toga-700">
                      ¿Confirma enviar a revisión documental? Después el expediente pasará a la
                      cola de revisión.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={confirmarEnviarRevision}
                        disabled={enviandoRevision || !submissionId}
                        className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
                      >
                        {enviandoRevision ? "Enviando…" : "Confirmar envío a revisión"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmandoRevision(false)}
                        disabled={enviandoRevision}
                        className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {!submissionId && (
                      <p className="mr-auto text-xs text-toga-500">
                        No hay consignación activa para cargar ni enviar.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={pedirConfirmacionEnvio}
                      disabled={!submissionId || enviandoRevision}
                      className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Enviar a revisión documental
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <SidebarChecklistDocumentos
            slots={slots}
            guardados={slotsConGuardados}
            activo={activo}
            bloqueado={bloqueado}
            onSeleccionar={seleccionar}
          />
        </div>
      </CardContent>
    </Card>
  );
}
