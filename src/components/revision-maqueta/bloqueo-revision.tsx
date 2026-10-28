"use client";

import { BloqueoTrabajo } from "@/components/bloqueo-trabajo";

/**
 * Mantiene el bloqueo de revisión mientras la revisora trabaja: se renueva con
 * la actividad y se libera al salir o cerrar la pestaña.
 */
export function BloqueoRevision({ candidateId }: { readonly candidateId: string }) {
  return (
    <BloqueoTrabajo
      api={`/api/revision/${encodeURIComponent(candidateId)}`}
      volver="/revision-documental"
      textoVolver="Volver a la cola"
      aviso="Usted tiene este expediente abierto: los demás revisores lo ven bloqueado. Se libera al salir o tras 15 minutos sin actividad."
      perdidoPorDefecto="Otro revisor tomó este expediente."
    />
  );
}
