"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

/**
 * Flujo de nuevo expediente: registrar postulante → cargar documentos uno a uno → revisión.
 */
export function FormularioNuevoExpedienteMaqueta() {
  const router = useRouter();
  const toast = useToast();
  const [fase, setFase] = useState<0 | 1>(0);
  const [datos, setDatos] = useState<DatosPostulanteMaqueta>(DATOS_VACIOS);
  const [errores, setErrores] = useState<
    Partial<Record<keyof DatosPostulanteMaqueta, string>>
  >({});

  function registrarExpediente() {
    const e = validarDatosPostulante(datos);
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    // Placeholder: aquí se creará el expediente en la API.
    toast.exito(
      `Expediente de ${datos.nombre} ${datos.apellido} (${datos.prefijoCedula}-${datos.cedulaDigitos}) registrado.`,
    );
    setFase(1);
  }

  function enviarARevision() {
    toast.exito(
      `Expediente de ${datos.nombre} ${datos.apellido} enviado a revisión.`,
    );
    router.push("/expedientes");
  }

  const salaLabel =
    SALAS_MAQUETA.find((s) => s.value === datos.sala)?.label ?? datos.sala;

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
        />
      ) : (
        <PasoCargaDocumentos
          datos={datos}
          salaLabel={salaLabel || "—"}
          onEnviarRevision={enviarARevision}
        />
      )}
    </div>
  );
}
