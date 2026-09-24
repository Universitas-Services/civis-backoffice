"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileStack, FileText } from "lucide-react";
import {
  categoryDesdeSlotKey,
  slotKeyDesdeCategory,
  type DocumentoExpediente,
  type WorkflowStatus,
} from "@/contracts";
import { enviarARevision } from "@/app/(panel)/expedientes/nuevo/acciones";
import { useToast } from "@/components/toast-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisorDocumentoRevision } from "@/components/revision-maqueta/visor-documento-revision";
import { SidebarChecklistDocumentos } from "@/components/expediente-maqueta/sidebar-checklist-documentos";
import {
  SlotDocumentoPdf,
  type ArchivoGuardado,
} from "@/components/expediente-maqueta/slot-documento-pdf";
import { iconoParaSlot } from "@/components/expediente-maqueta/iconos-documento";
import { documentosVigentes } from "@/lib/documentos-vigentes";
import { construirSlotsVisibles } from "@/lib/maqueta-expediente-documentos";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";

function sembrarGuardados(
  documentos: readonly DocumentoExpediente[],
): Record<string, ArchivoGuardado[]> {
  const out: Record<string, ArchivoGuardado[]> = {};
  for (const d of documentosVigentes(documentos)) {
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
 * Documentos del expediente en el detalle.
 * Con carga: checklist y tarjeta para adjuntar. En solo lectura: el mismo
 * checklist y el visor del archivo vigente, sin acciones de modificación.
 */
export function SeccionDocumentosExpediente({
  candidateId,
  submissionId,
  workflowStatus,
  documentos,
  puedeCargar,
  avisoRevision = false,
}: {
  readonly candidateId: string;
  readonly submissionId: string | null;
  readonly workflowStatus: WorkflowStatus;
  readonly documentos: readonly DocumentoExpediente[];
  readonly puedeCargar: boolean;
  /** Secretaría no carga mientras el expediente está en revisión documental. */
  readonly avisoRevision?: boolean;
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
  const [archivoActivoId, setArchivoActivoId] = useState<string | undefined>();
  const [guardando, setGuardando] = useState(false);
  const [sustituyendoId, setSustituyendoId] = useState<string | null>(null);
  const [enviandoRevision, setEnviandoRevision] = useState(false);
  const [confirmandoRevision, setConfirmandoRevision] = useState(false);

  const slots = useMemo(() => construirSlotsVisibles(), []);
  const slotActivo = slots.find((s) => s.slotKey === activo);

  useEffect(() => {
    setGuardados(sembrarGuardados(documentos));
  }, [documentos]);

  useEffect(() => {
    marcarSidebarDocumentoAbierto(Boolean(activo));
    return () => marcarSidebarDocumentoAbierto(false);
  }, [activo]);

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
    setArchivoActivoId(guardados[slotKey]?.[0]?.id);
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

  async function sustituirDocumento(slotKey: string, id: string, file: File) {
    const slot = slots.find((s) => s.slotKey === slotKey);
    if (!slot || !submissionId || enviandoRevision || sustituyendoId) return;
    const category = categoryDesdeSlotKey(slotKey);
    if (!category) {
      toast.error("Tipo de documento no reconocido.");
      return;
    }

    setSustituyendoId(id);
    try {
      const cuerpo = new FormData();
      cuerpo.append("category", category);
      cuerpo.append("replaces", id);
      cuerpo.append("file", file);

      const respuesta = await fetch(`/api/documentos/${submissionId}`, {
        method: "POST",
        body: cuerpo,
      });
      const datosResp = (await respuesta.json()) as { id?: string; message?: string };
      if (!respuesta.ok || !datosResp.id) {
        toast.error(datosResp.message ?? "No se pudo sustituir el documento.");
        return;
      }
      toast.exito(`Documento sustituido: ${slot.titulo}`);
      router.refresh();
    } catch {
      toast.error("Fallo de conexión al sustituir el documento.");
    } finally {
      setSustituyendoId(null);
    }
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
    const archivosSlot = slotActivo ? (guardados[slotActivo.slotKey] ?? []) : [];
    const archivoVisible =
      archivosSlot.find((archivo) => archivo.id === archivoActivoId) ?? archivosSlot[0];

    return (
      <Card>
        <CardHeader>
          <CardTitle id="documentos" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-toga-500" aria-hidden="true" />
            Documentos del expediente
          </CardTitle>
          <CardDescription>
            Consulte los recaudos cargados. Esta etapa no admite nuevas cargas ni sustituciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {avisoRevision && (
            <p className="mb-4 rounded-md border border-balanza-600/25 bg-balanza-50 px-3 py-2 text-sm text-toga-800">
              El expediente está en revisión documental. Solo el revisor puede actualizar
              documentos. Secretaría retoma la carga cuando el expediente vuelva a borrador.
            </p>
          )}
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
            <div className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
              {slotActivo && archivoVisible ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-toga-900">{slotActivo.titulo}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-toga-500">{slotActivo.ayuda}</p>
                  </div>
                  {archivosSlot.length > 1 && (
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Archivos del recaudo">
                      {archivosSlot.map((archivo) => {
                        const elegido = archivo.id === archivoVisible.id;
                        return (
                          <button
                            key={archivo.id}
                            type="button"
                            role="tab"
                            aria-selected={elegido}
                            onClick={() => setArchivoActivoId(archivo.id)}
                            className={`max-w-full truncate rounded-md border px-3 py-1.5 text-xs font-medium ${
                              elegido
                                ? "border-balanza-600 bg-balanza-50 text-toga-900"
                                : "border-toga-300 bg-white text-toga-600 hover:bg-toga-50"
                            }`}
                          >
                            {archivo.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <VisorDocumentoRevision
                    documentId={archivoVisible.id}
                    nombreArchivo={archivoVisible.name}
                    sizeKb={Math.max(1, Math.round(archivoVisible.size / 1024))}
                    titulo={slotActivo.titulo}
                  />
                </div>
              ) : slotActivo ? (
                <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                  <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-toga-700">{slotActivo.titulo}</p>
                  <p className="mt-1 max-w-sm text-xs text-toga-500">
                    Este recaudo no tiene un archivo cargado.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                  <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-toga-700">
                    Seleccione un documento del listado
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-toga-500">
                    Al elegir un recaudo se abre aquí el archivo vigente.
                  </p>
                </div>
              )}
            </div>
            <SidebarChecklistDocumentos
              slots={slots}
              guardados={slotsConGuardados}
              activo={activo}
              bloqueado={false}
              onSeleccionar={seleccionar}
            />
          </div>
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
                  onSustituir={(id, file) => void sustituirDocumento(slotActivo.slotKey, id, file)}
                  sustituyendoId={sustituyendoId}
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
