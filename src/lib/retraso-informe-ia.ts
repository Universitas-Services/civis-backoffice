/** Retraso artificial al mostrar un informe IA ya generado (simula preparación). */
export const RETRASO_INFORME_IA_MS = 2500;

export function esperarRetrasoInformeIa(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, RETRASO_INFORME_IA_MS);
  });
}
