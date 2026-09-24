"use client";

import { useState, useTransition } from "react";
import { generarInformeObjeciones } from "@/app/(panel)/objeciones/acciones";
import { InformeIaSheet } from "@/components/informe-ia-sheet";
import { useToast } from "@/components/toast-provider";

/**
 * Informe de las objeciones. El texto se lee aquí; no se guarda ni mueve puntos.
 */
export function InformeObjeciones({
  candidateId,
  nombrePostulante,
}: {
  readonly candidateId: string;
  readonly nombrePostulante: string;
}) {
  const toast = useToast();
  const [informe, setInforme] = useState("");
  const [pendiente, iniciar] = useTransition();

  function generar() {
    iniciar(async () => {
      const r = await generarInformeObjeciones(candidateId);
      if (!r.ok || !r.informe) {
        toast.error(r.error ?? "No se pudo generar el informe");
        return;
      }
      setInforme(r.informe);
    });
  }

  return (
    <InformeIaSheet
      nombrePostulante={nombrePostulante}
      informe={informe}
      generando={pendiente}
      descripcion="Analiza las objeciones de este postulante y sugiere. No cambia el puntaje: el ajuste lo decide usted en el baremo."
      onGenerar={generar}
      onCambiar={setInforme}
      onBorrar={() => setInforme("")}
    />
  );
}
