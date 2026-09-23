/**
 * Cupos de uso de IA por sesión de navegador (sessionStorage).
 * Evita reintentos costosos en extractores e informe de elegibilidad.
 */

function leer(clave: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(clave) === "1";
  } catch {
    return false;
  }
}

function marcar(clave: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(clave, "1");
  } catch {
    /* ignore quota */
  }
}

function claveExtract(documentId: string): string {
  return `civis_extract_ia_${documentId}`;
}

function claveInformeElegibilidad(candidateId: string): string {
  return `civis_elegibilidad_ia_${candidateId}`;
}

function claveTextoInforme(candidateId: string): string {
  return `civis_elegibilidad_ia_texto_${candidateId}`;
}

/** Extracción IA del revisor: un uso exitoso por documento y sesión. */
export function extractIaYaUsado(documentId: string): boolean {
  return leer(claveExtract(documentId));
}

export function marcarExtractIaUsado(documentId: string): void {
  marcar(claveExtract(documentId));
}

/** Informe IA de elegibilidad: un generate exitoso por candidato y sesión. */
export function informeIaElegibilidadYaUsado(candidateId: string): boolean {
  return leer(claveInformeElegibilidad(candidateId));
}

export function marcarInformeIaElegibilidadUsado(candidateId: string): void {
  marcar(claveInformeElegibilidad(candidateId));
}

export function leerTextoInformeIaElegibilidad(candidateId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(claveTextoInforme(candidateId)) ?? "";
  } catch {
    return "";
  }
}

export function guardarTextoInformeIaElegibilidad(candidateId: string, texto: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(claveTextoInforme(candidateId), texto);
  } catch {
    /* ignore */
  }
}

/** Borra solo el texto editable; no reactiva el cupo de generar. */
export function borrarTextoInformeIaElegibilidad(candidateId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(claveTextoInforme(candidateId));
  } catch {
    /* ignore */
  }
}
