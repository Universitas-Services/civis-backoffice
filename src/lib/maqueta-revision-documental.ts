/**
 * Catálogo mock de la cola de revisión documental (UI).
 * La carga de documentos es opcional: cada postulante puede tener un
 * subconjunto distinto de los 28 tipos del catálogo.
 */

import {
  BLOQUE_ETIQUETA,
  construirSlotsVisibles,
  type BloqueDocumentoId,
  type SalaMaqueta,
} from "@/lib/maqueta-expediente-documentos";

export type EstadoVerificacionMock = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export interface DocumentoRevisionMock {
  readonly id: string;
  readonly slotKey: string;
  readonly bloque: BloqueDocumentoId;
  readonly titulo: string;
  readonly nombreArchivo: string;
  readonly sizeKb: number;
  readonly verificationStatus: EstadoVerificacionMock;
}

export interface PostulanteRevisionMock {
  readonly id: string;
  readonly fileNumber: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly cedula: string;
  readonly sala: SalaMaqueta;
  readonly salaLabel: string;
  /** Solo los documentos que este postulante cargó (subconjunto opcional). */
  readonly documentos: readonly DocumentoRevisionMock[];
}

export { BLOQUE_ETIQUETA };
export type { BloqueDocumentoId };

const ORDEN_BLOQUES: BloqueDocumentoId[] = [
  "identidad",
  "honorabilidad",
  "formacion",
  "trayectoria",
  "incompatibilidades",
];

export function ordenBloquesRevision(): readonly BloqueDocumentoId[] {
  return ORDEN_BLOQUES;
}

/** Tipos posibles en el catálogo (máximo teórico; no todos se cargan siempre). */
export const TOTAL_TIPOS_CATALOGO = construirSlotsVisibles().length;

function slugArchivo(slotKey: string): string {
  return `${slotKey}.pdf`;
}

/**
 * Documentos efectivamente cargados por el postulante (subconjunto del catálogo).
 * `indices` selecciona posiciones en `construirSlotsVisibles()`.
 */
function documentosCargados(
  postulanteId: string,
  indices: readonly number[],
): DocumentoRevisionMock[] {
  const slots = construirSlotsVisibles();
  return indices.map((i, orden) => {
    const slot = slots[i];
    if (!slot) throw new Error(`Índice de documento inválido: ${i}`);
    return {
      id: `${postulanteId}-${slot.slotKey}`,
      slotKey: slot.slotKey,
      bloque: slot.bloque,
      titulo: slot.titulo,
      nombreArchivo: slugArchivo(slot.slotKey),
      sizeKb: 120 + ((orden * 47) % 900),
      verificationStatus: "UNVERIFIED" as const,
    };
  });
}

/** Primeros N índices del catálogo (0..n-1). */
function rango(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export const POSTULANTES_REVISION_MAQUETA: readonly PostulanteRevisionMock[] = [
  {
    id: "rev-mock-001",
    fileNumber: "CIVIS-2026-0142",
    nombre: "María Elena",
    apellido: "Rodríguez Páez",
    cedula: "V-12456789",
    sala: "CONSTITUCIONAL",
    salaLabel: "Sala Constitucional",
    // 20 documentos cargados (no los 28 del catálogo)
    documentos: documentosCargados("rev-mock-001", rango(20)),
  },
  {
    id: "rev-mock-002",
    fileNumber: "CIVIS-2026-0158",
    nombre: "José Antonio",
    apellido: "Méndez Silva",
    cedula: "V-9876543",
    sala: "CASACION_PENAL",
    salaLabel: "Sala de Casación Penal",
    documentos: documentosCargados(
      "rev-mock-002",
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 19, 24, 25],
    ),
  },
  {
    id: "rev-mock-003",
    fileNumber: "CIVIS-2026-0163",
    nombre: "Carmen Lucía",
    apellido: "Vargas Rivas",
    cedula: "E-8123456",
    sala: "PLENA",
    salaLabel: "Sala Plena",
    documentos: documentosCargados("rev-mock-003", rango(12)),
  },
  {
    id: "rev-mock-004",
    fileNumber: "CIVIS-2026-0171",
    nombre: "Luis Fernando",
    apellido: "Ochoa Delgado",
    cedula: "V-15678901",
    sala: "ELECTORAL",
    salaLabel: "Sala Electoral",
    // Expediente casi completo
    documentos: documentosCargados("rev-mock-004", rango(28)),
  },
];

export function listarPostulantesRevision(): readonly PostulanteRevisionMock[] {
  return POSTULANTES_REVISION_MAQUETA;
}

export function obtenerPostulanteRevision(
  id: string,
): PostulanteRevisionMock | undefined {
  return POSTULANTES_REVISION_MAQUETA.find((p) => p.id === id);
}

export function conteoDocsRevision(p: PostulanteRevisionMock): {
  readonly total: number;
  readonly pendientes: number;
  readonly verificados: number;
} {
  const total = p.documentos.length;
  const verificados = p.documentos.filter((d) => d.verificationStatus === "VERIFIED").length;
  const pendientes = p.documentos.filter((d) => d.verificationStatus === "UNVERIFIED").length;
  return { total, pendientes, verificados };
}
