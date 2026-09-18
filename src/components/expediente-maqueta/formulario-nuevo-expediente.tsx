"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enviarARevision, registrarPostulante } from "@/app/(panel)/expedientes/nuevo/acciones";
import { useToast } from "@/components/toast-provider";
import { SALAS_MAQUETA } from "@/lib/maqueta-expediente-documentos";
import { StepperExpedienteMaqueta } from "./stepper-expediente";
import {
  PasoDatosPostulante,
  validarDatosPostulante,
  type DatosPostulanteMaqueta,
} from "./paso-datos-postulante";
import { PasoCargaDocumentos } from "./paso-carga-documentos";

const DATOS_VACIOS: DatosPostulanteMaqueta = {
  nombre: "",
  apellido: "",
  prefijoCedula: "V",
  cedulaDigitos: "",
  sala: "",
};

type ExpedienteCreado = {
  readonly candidateId: string;
  readonly submissionId: string;
  readonly fileNumber: string;
};

/**
 * Flujo de nuevo expediente: registrar postulante → cargar documentos uno a uno → revisión.
 */
export function FormularioNuevoExpedienteMaqueta() {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [fase, setFase] = useState<0 | 1>(0);
  const [datos, setDatos] = useState<DatosPostulanteMaqueta>(DATOS_VACIOS);
  const [errores, setErrores] = useState<Partial<Record<keyof DatosPostulanteMaqueta, string>>>({});
  const [creado, setCreado] = useState<ExpedienteCreado | null>(null);

  function registrarExpediente() {
    const e = validarDatosPostulante(datos);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    startTransition(async () => {
      const resultado = await registrarPostulante({
        nationalIdPrefix: datos.prefijoCedula,
        nationalIdDigits: datos.cedulaDigitos,
        firstName: datos.nombre,
        lastName: datos.apellido,
        chamber: datos.sala,
      });

      if (resultado.campos || resultado.error || !resultado.creado) {
        const campos: Partial<Record<keyof DatosPostulanteMaqueta, string>> = {};
        if (resultado.campos?.nationalIdDigits) {
          campos.cedulaDigitos = resultado.campos.nationalIdDigits;
        }
        if (resultado.campos?.firstName) campos.nombre = resultado.campos.firstName;
        if (resultado.campos?.lastName) campos.apellido = resultado.campos.lastName;
        if (resultado.campos?.chamber) campos.sala = resultado.campos.chamber;
        setErrores(campos);
        toast.error(resultado.error ?? "Revise los datos del postulante.");
        return;
      }

      setCreado(resultado.creado);
      toast.exito(
        `Expediente ${resultado.creado.fileNumber} de ${datos.nombre} ${datos.apellido} registrado.`,
      );
      setFase(1);
    });
  }

  function enviarARevisionHandler() {
    if (!creado) return;
    startTransition(async () => {
      const r = await enviarARevision(creado.candidateId);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo enviar a revisión.");
        return;
      }
      toast.exito(`Expediente de ${datos.nombre} ${datos.apellido} enviado a revisión documental.`);
      router.push(`/expedientes/${creado.candidateId}`);
      router.refresh();
    });
  }

  const salaLabel = SALAS_MAQUETA.find((s) => s.value === datos.sala)?.label ?? datos.sala;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6">
        <StepperExpedienteMaqueta fase={fase} />
      </div>

      {fase === 0 ? (
        <PasoDatosPostulante
          valores={datos}
          errores={errores}
          onChange={(v) => {
            setDatos(v);
            setErrores({});
          }}
          onRegistrar={registrarExpediente}
          registrando={pending}
        />
      ) : creado ? (
        <PasoCargaDocumentos
          datos={datos}
          salaLabel={salaLabel || "—"}
          submissionId={creado.submissionId}
          onEnviarRevision={enviarARevisionHandler}
          enviandoRevision={pending}
        />
      ) : null}
    </div>
  );
}
