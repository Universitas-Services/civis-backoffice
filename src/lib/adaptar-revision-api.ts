import type { ExpedienteDetalle, ExpedienteListado } from "@/contracts";
import {
  CATEGORIA_ETIQUETA,
  SALA_ETIQUETA,
  esCategoryConocida,
  recaudoPorCategory,
  slotKeyDesdeCategory,
} from "@/contracts";
import { documentosVigentes } from "@/lib/documentos-vigentes";
import type { BloqueDocumentoId } from "@/lib/maqueta-expediente-documentos";

export type EstadoVerificacionDoc = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export interface DocumentoRevision {
  readonly id: string;
  readonly slotKey: string;
  readonly category: string;
  readonly bloque: BloqueDocumentoId;
  readonly titulo: string;
  readonly nombreArchivo: string;
  readonly sizeKb: number;
  readonly verificationStatus: EstadoVerificacionDoc;
  readonly reviewData?: Record<string, unknown> | null;
}

/** Fila de la cola de revisión (sin inventar documentos). */
export interface PostulanteRevisionLista {
  readonly id: string;
  readonly fileNumber: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly cedula: string;
  readonly sala: string;
  readonly salaLabel: string;
  /** Conteo real de `submissions[0]._count.documents`. */
  readonly docsTotal: number;
}

export interface PostulanteRevision {
  readonly id: string;
  readonly fileNumber: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly cedula: string;
  readonly sala: string;
  readonly salaLabel: string;
  readonly submissionId: string;
  readonly documentos: readonly DocumentoRevision[];
}

export function conteoDocsRevision(p: PostulanteRevision): {
  readonly total: number;
  readonly pendientes: number;
  readonly verificados: number;
} {
  const total = p.documentos.length;
  const verificados = p.documentos.filter((d) => d.verificationStatus === "VERIFIED").length;
  const pendientes = p.documentos.filter((d) => d.verificationStatus === "UNVERIFIED").length;
  return { total, pendientes, verificados };
}

function etiquetaSala(chamber: string): string {
  return SALA_ETIQUETA[chamber] ?? chamber;
}

function documentosDesdeDetalle(e: ExpedienteDetalle): DocumentoRevision[] {
  const docs = documentosVigentes(e.submissions.flatMap((s) => s.documents));
  return docs.map((d) => {
    const recaudo = esCategoryConocida(d.category) ? recaudoPorCategory(d.category) : undefined;
    const slotKey = slotKeyDesdeCategory(d.category) ?? d.category.toLowerCase();
    return {
      id: d.id,
      slotKey,
      category: d.category,
      bloque: (recaudo?.bloque ?? "identidad") as BloqueDocumentoId,
      titulo: recaudo?.etiqueta ?? CATEGORIA_ETIQUETA[d.category] ?? d.category,
      nombreArchivo: d.originalName,
      sizeKb: Math.max(1, Math.round(d.sizeBytes / 1024)),
      verificationStatus: d.verificationStatus,
      reviewData: d.reviewData ?? null,
    };
  });
}

/** Detalle API → modelo de la UI de revisión. */
export function postulanteDesdeExpediente(e: ExpedienteDetalle): PostulanteRevision {
  const submission = e.submissions[0];
  return {
    id: e.id,
    fileNumber: submission?.fileNumber ?? e.publicId,
    nombre: e.firstName,
    apellido: e.lastName,
    cedula: e.nationalId,
    sala: String(e.chamber),
    salaLabel: etiquetaSala(String(e.chamber)),
    submissionId: submission?.id ?? "",
    documentos: documentosDesdeDetalle(e),
  };
}

/** Fila de listado API → sin documentos inventados. */
export function postulanteDesdeListado(e: ExpedienteListado): PostulanteRevisionLista {
  const submission = e.submissions[0];
  return {
    id: e.id,
    fileNumber: submission?.fileNumber ?? e.publicId,
    nombre: e.firstName,
    apellido: e.lastName,
    cedula: e.nationalId,
    sala: String(e.chamber),
    salaLabel: etiquetaSala(String(e.chamber)),
    docsTotal: submission?._count.documents ?? 0,
  };
}
