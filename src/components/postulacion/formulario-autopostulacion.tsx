"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/toast-provider";
import {
  PasoDatosPostulante,
  validarDatosPostulante,
  type DatosPostulanteMaqueta,
} from "@/components/expediente-maqueta/paso-datos-postulante";
import { continuarConCodigo, crearPostulacion } from "@/app/(postulacion)/postulacion/acciones";
import { Comprobante } from "./comprobante";

const VACIOS: DatosPostulanteMaqueta = {
  nombre: "",
  apellido: "",
  prefijoCedula: "V",
  cedulaDigitos: "",
  sala: "",
  telefonoPrefijo: "",
  telefonoDigitos: "",
};

/** Mapea los campos de la API a los del formulario para marcar el error. */
const CAMPO_API: Record<string, keyof DatosPostulanteMaqueta> = {
  firstName: "nombre",
  lastName: "apellido",
  nationalId: "cedulaDigitos",
  chamber: "sala",
  phone: "telefono",
};

/**
 * Autopostulación, paso 1: el postulante crea su expediente. Al registrarlo
 * recibe el número y su código de acceso, que se muestra una sola vez.
 */
export function FormularioAutopostulacion() {
  const toast = useToast();
  const [pendiente, iniciar] = useTransition();
  const [datos, setDatos] = useState<DatosPostulanteMaqueta>(VACIOS);
  const [errores, setErrores] = useState<Partial<Record<keyof DatosPostulanteMaqueta, string>>>({});
  const [trampa, setTrampa] = useState("");
  const [creado, setCreado] = useState<{ fileNumber: string; accessCode: string } | null>(null);

  function registrar() {
    const e = validarDatosPostulante(datos, { conTelefono: true });
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    iniciar(async () => {
      const r = await crearPostulacion({
        firstName: datos.nombre,
        lastName: datos.apellido,
        nationalIdPrefix: datos.prefijoCedula,
        nationalIdDigits: datos.cedulaDigitos,
        chamber: datos.sala,
        phone: `${datos.telefonoPrefijo ?? ""}${datos.telefonoDigitos ?? ""}`,
        website: trampa,
      });
      if (!r.ok || !r.fileNumber || !r.accessCode) {
        const campos: Partial<Record<keyof DatosPostulanteMaqueta, string>> = {};
        for (const [api, texto] of Object.entries(r.campos ?? {})) {
          const campo = CAMPO_API[api];
          if (campo) campos[campo] = texto;
        }
        setErrores(campos);
        toast.error(r.error ?? "Revise los datos.");
        return;
      }
      setCreado({ fileNumber: r.fileNumber, accessCode: r.accessCode });
    });
  }

  if (creado) {
    return (
      <Comprobante
        fileNumber={creado.fileNumber}
        accessCode={creado.accessCode}
        nombre={`${datos.nombre} ${datos.apellido}`}
        onContinuar={async () => {
          const r = await continuarConCodigo(creado.accessCode);
          if (r && !r.ok) toast.error(r.error ?? "No se pudo continuar.");
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Campo trampa: invisible para personas; si llega con contenido, es un bot. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Sitio web</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          value={trampa}
          onChange={(e) => setTrampa(e.target.value)}
        />
      </div>
      <PasoDatosPostulante
        valores={datos}
        errores={errores}
        onChange={(v) => {
          setDatos(v);
          setErrores({});
        }}
        onRegistrar={registrar}
        registrando={pendiente}
        conTelefono
        titulo="Postularme"
        descripcion="Registre sus datos para crear su expediente. Después cargará sus documentos y, cuando estén completos, lo enviará a revisión."
      />
    </div>
  );
}
