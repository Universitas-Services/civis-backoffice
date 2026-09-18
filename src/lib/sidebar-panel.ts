/**
 * Coordinación del sidebar global del panel.
 * Cuando se abre un documento (visor + formulario), se comprime temporalmente
 * el menú lateral para ganar espacio de trabajo; al cerrar se restaura la
 * preferencia del usuario (localStorage).
 */

export const EVENTO_SIDEBAR_DOCUMENTO = "civis:sidebar-documento";

export function marcarSidebarDocumentoAbierto(abierto: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENTO_SIDEBAR_DOCUMENTO, { detail: { abierto } }),
  );
}
