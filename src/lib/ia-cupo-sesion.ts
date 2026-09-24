/**
 * Cupo de IA en el navegador: un uso exitoso por sesión.
 * El extractor cuenta por documento; el informe de elegibilidad, por expediente.
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

/** Extracción IA del revisor: un uso exitoso por documento y sesión. */
export function extractIaYaUsado(documentId: string): boolean {
  return leer(claveExtract(documentId));
}

export function marcarExtractIaUsado(documentId: string): void {
  marcar(claveExtract(documentId));
}

function claveInformeElegibilidad(expedienteId: string): string {
  return `civis_informe_ia_elegibilidad_${expedienteId}`;
}

/** Informe IA del evaluador: un uso exitoso por expediente y sesión. */
export function informeIaElegibilidadYaUsado(expedienteId: string): boolean {
  return leer(claveInformeElegibilidad(expedienteId));
}

export function marcarInformeIaElegibilidadUsado(expedienteId: string): void {
  marcar(claveInformeElegibilidad(expedienteId));
}
