"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import type { DocumentoExpediente, WorkflowStatus } from "@/contracts";
import { CATEGORIA_ETIQUETA } from "@/contracts";
import { enviarARevision } from "@/app/(panel)/expedientes/nuevo/acciones";
import { useToast } from "@/components/toast-provider";
import { InsigniaAnalisis, InsigniaClasificacion } from "@/components/insignias";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ZonaDocumentos, type DocumentoCargado } from "@/components/zona-documentos";

/**
 * Documentos del expediente en el detalle: lista sin hash, carga si el
 * expediente sigue editable, y envío a revisión cuando está en borrador.
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
  const [enviando, setEnviando] = useState(false);
  const [sesionCarga, setSesionCarga] = useState<DocumentoCargado[]>([]);

  const esBorrador = workflowStatus === "DRAFT";
  const puedeEnviar = puedeCargar && esBorrador && documentos.length > 0 && Boolean(submissionId);

  function alCargar(docs: DocumentoCargado[]) {
    setSesionCarga(docs);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle id="documentos" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-toga-500" aria-hidden="true" />
          Documentos del expediente
        </CardTitle>
        {puedeCargar && esBorrador && documentos.length === 0 && (
          <CardDescription>
            El expediente está en borrador. Cargue al menos un documento y envíelo a revisión
            documental.
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
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
                    {CATEGORIA_ETIQUETA[d.category]} · {Math.round(d.sizeBytes / 1024)} KB
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

        {puedeCargar && submissionId && (
          <div className="border-t border-toga-100 pt-4">
            <p className="mb-3 text-xs font-medium text-toga-600">Cargar documentos</p>
            <ZonaDocumentos
              submissionId={submissionId}
              documentos={sesionCarga}
              onCambio={alCargar}
              mostrarLista={false}
            />
          </div>
        )}

        {puedeEnviar && (
          <div className="flex flex-wrap items-center gap-3 border-t border-toga-100 pt-4">
            <button
              type="button"
              disabled={enviando}
              onClick={() => {
                setEnviando(true);
                void enviarARevision(candidateId).then((r) => {
                  if (r.ok) {
                    toast.exito("Expediente enviado a revisión documental");
                    router.refresh();
                  } else {
                    toast.error(r.error ?? "No se pudo enviar");
                  }
                  setEnviando(false);
                });
              }}
              className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar a revisión documental"}
            </button>
            <p className="text-xs text-toga-500">
              Al enviar, el expediente pasa a la cola de revisión documental.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
