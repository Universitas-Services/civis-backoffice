"use client";

import { useEffect, useState, useTransition } from "react";
import { auditarTachas } from "@/app/(panel)/objeciones/acciones";
import { InformeIaSheet } from "@/components/informe-ia-sheet";
import { useToast } from "@/components/toast-provider";
import {
  informeIaTachasYaUsado,
  marcarInformeIaTachasUsado,
} from "@/lib/ia-cupo-sesion";

/**
 * Informe IA al corregir el baremo. La auditoría solo se pide al pulsar
 * Generar dentro del sheet, una vez por expediente y sesión.
 * El texto es una alerta del lote abierto: no declara fundada o infundada
 * y no mueve el puntaje.
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
  const [nivel, setNivel] = useState("");
  const [usado, setUsado] = useState(false);
  const [pendiente, iniciar] = useTransition();

  useEffect(() => {
    setUsado(informeIaTachasYaUsado(candidateId));
  }, [candidateId]);

  function generar() {
    if (pendiente || usado || informeIaTachasYaUsado(candidateId)) {
      toast.error("La generación con IA ya se usó en esta sesión para este expediente.");
      return;
    }
    iniciar(async () => {
      const r = await auditarTachas(candidateId);
      if (!r.ok || !r.alerta) {
        toast.error(r.error ?? "No se pudo generar el informe");
        return;
      }
      marcarInformeIaTachasUsado(candidateId);
      setUsado(true);
      setInforme(r.alerta.alertaTexto);
      setNivel(r.alerta.nivelAlerta);
    });
  }

  return (
    <InformeIaSheet
      nombrePostulante={nombrePostulante}
      informe={informe}
      nivel={nivel || undefined}
      generando={pendiente}
      cupoSesion
      generacionAgotada={usado}
      descripcion={`Alerta sobre las denuncias abiertas de ${nombrePostulante}. No resuelve si son fundadas o infundadas y no cambia el puntaje.`}
      textoVacio="La IA lee las denuncias abiertas de este postulante y redacta una alerta. Podrá leerla y editarla aquí."
      onGenerar={generar}
      onCambiar={setInforme}
      onBorrar={() => {
        setInforme("");
        setNivel("");
      }}
    />
  );
}
