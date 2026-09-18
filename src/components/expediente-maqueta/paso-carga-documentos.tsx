"use client";

import { useEffect, useMemo, useState } from "react";
import { FileStack } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { construirSlotsVisibles } from "@/lib/maqueta-expediente-documentos";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";
import { SidebarChecklistDocumentos } from "./sidebar-checklist-documentos";
import { SlotDocumentoPdf, type ArchivoGuardado } from "./slot-documento-pdf";
import { iconoParaSlot } from "./iconos-documento";
import type { DatosPostulanteMaqueta } from "./paso-datos-postulante";

export function PasoCargaDocumentos({
  datos,
  salaLabel,
  onEnviarRevision,
}: {
  readonly datos: DatosPostulanteMaqueta;
  readonly salaLabel: string;
  readonly onEnviarRevision: () => void;
}) {
  const toast = useToast();
  const [pendientes, setPendientes] = useState<Record<string, File | null>>({});
  const [guardados, setGuardados] = useState<Record<string, ArchivoGuardado[]>>({});
  const [activo, setActivo] = useState<string | undefined>();
  const [guardando, setGuardando] = useState(false);
  const [enRevision, setEnRevision] = useState(false);
  const [confirmandoRevision, setConfirmandoRevision] = useState(false);

  const slots = useMemo(() => construirSlotsVisibles(), []);
  const slotActivo = slots.find((s) => s.slotKey === activo);

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
    if (enRevision) return;
    setActivo(slotKey);
  }

  function setPendiente(slotKey: string, file: File | null) {
    setPendientes((prev) => ({ ...prev, [slotKey]: file }));
  }

  async function guardarDocumento(slotKey: string) {
    const file = pendientes[slotKey];
    const slot = slots.find((s) => s.slotKey === slotKey);
    if (!file || !slot || enRevision) return;
    if (!slot.multiple && (guardados[slotKey]?.length ?? 0) > 0) return;

    setGuardando(true);
    try {
      // Placeholder: aquí irá la llamada a la API por variable/documento.
      await new Promise((r) => setTimeout(r, 350));
      const nuevo: ArchivoGuardado = {
        id: `${slotKey}-${Date.now()}`,
        name: file.name,
        size: file.size,
      };
      setGuardados((prev) => ({
        ...prev,
        [slotKey]: [...(prev[slotKey] ?? []), nuevo],
      }));
      setPendientes((prev) => ({ ...prev, [slotKey]: null }));
      toast.exito(`Documento guardado: ${slot.titulo}`);
    } finally {
      setGuardando(false);
    }
  }

  function quitarGuardado(slotKey: string, id: string) {
    if (enRevision) return;
    setGuardados((prev) => ({
      ...prev,
      [slotKey]: (prev[slotKey] ?? []).filter((g) => g.id !== id),
    }));
  }

  function confirmarEnviarRevision() {
    setEnRevision(true);
    setConfirmandoRevision(false);
    setActivo(undefined);
    onEnviarRevision();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-toga-900">Carga de documentos</h2>
            <p className="mt-1 text-sm text-toga-500">
              {enRevision
                ? "Expediente enviado a revisión. Ya no se pueden cargar ni editar documentos."
                : "Seleccione un documento del listado para cargarlo y guardarlo de forma individual."}
            </p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-toga-500">Postulante</dt>
              <dd className="font-medium text-toga-900">
                {datos.nombre} {datos.apellido}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Cédula</dt>
              <dd className="codigo font-medium text-toga-900">
                {datos.prefijoCedula}-{datos.cedulaDigitos}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Sala</dt>
              <dd className="font-medium text-toga-900">{salaLabel}</dd>
            </div>
          </dl>
        </div>
      </div>

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
                bloqueado={enRevision}
                guardando={guardando}
                onPendiente={(f) => setPendiente(slotActivo.slotKey, f)}
                onGuardar={() => void guardarDocumento(slotActivo.slotKey)}
                onQuitarGuardado={(id) => quitarGuardado(slotActivo.slotKey, id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-toga-700">
                  {enRevision
                    ? "El expediente está en revisión"
                    : "Seleccione un documento del listado"}
                </p>
                <p className="mt-1 max-w-sm text-xs text-toga-500">
                  {enRevision
                    ? "No se admiten más cargas ni cambios."
                    : "Al elegir un ítem se abre aquí la tarjeta para adjuntar el PDF y guardarlo."}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-toga-200 bg-white px-5 py-4 sm:px-6">
            {enRevision ? (
              <p className="text-sm text-toga-600">
                Expediente enviado a revisión. La carga documental quedó cerrada.
              </p>
            ) : confirmandoRevision ? (
              <div className="space-y-3">
                <p className="text-sm text-toga-700">
                  ¿Confirma enviar a revisión el expediente de{" "}
                  <span className="font-semibold">
                    {datos.nombre} {datos.apellido}
                  </span>
                  ? Después no podrá cargar ni editar documentos.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={confirmarEnviarRevision}
                    className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
                  >
                    Confirmar envío a revisión
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoRevision(false)}
                    className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-toga-500">
                  Los documentos son opcionales. Puede enviar a revisión en cualquier momento.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmandoRevision(true)}
                  className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
                >
                  Enviar a revisión
                </button>
              </div>
            )}
          </div>
        </div>

        <SidebarChecklistDocumentos
          slots={slots}
          guardados={slotsConGuardados}
          activo={activo}
          bloqueado={enRevision}
          onSeleccionar={seleccionar}
        />
      </div>
    </div>
  );
}
