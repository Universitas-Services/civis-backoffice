"use client";

import { DatePicker } from "@/components/ui/date-picker";
import type {
  ErroresFormularioRevision,
  ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioPruebaEjercicioLibre({
  valores,
  errores = {},
  onCampo,
}: {
  readonly valores: Readonly<ValoresFormularioRevision>;
  readonly errores?: Readonly<ErroresFormularioRevision>;
  readonly onCampo: (key: string, value: string | boolean | null) => void;
}) {
  return (
    <div className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-toga-900">
          Copia de prueba documental que acredite quince (15) años de ejercicio
          libre de la profesión
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento evidencia fehacientemente un mínimo de quince años
          habituales en el ejercicio de la abogacía del postulante (visados de
          documentos, libelos de demanda, poderes otorgados o sentencias
          definitivamente firmes donde conste la actuación formal como apoderado
          judicial). Todos los campos son opcionales: si no se pueden leer,
          déjelos vacíos.
        </p>

        <CampoTexto
          id="tipo_documento_ejerciciolibre"
          etiqueta="Tipo de documento"
          ayuda="Ejemplo: Libelo de demanda, Sentencia firme"
          value={String(valores.tipo_documento_ejerciciolibre ?? "")}
          error={errores.tipo_documento_ejerciciolibre}
          onChange={(v) => onCampo("tipo_documento_ejerciciolibre", v)}
        />

        <CampoTexto
          id="nombre_postulante_ejerciciolibre"
          etiqueta="Nombre completo del postulante"
          ayuda="Verifica que el nombre del postulante se encuentre en el documento"
          value={String(valores.nombre_postulante_ejerciciolibre ?? "")}
          error={errores.nombre_postulante_ejerciciolibre}
          onChange={(v) => onCampo("nombre_postulante_ejerciciolibre", v)}
        />

        <CampoTexto
          id="apellido_postulante_ejerciciolibre"
          etiqueta="Apellido completo del postulante"
          ayuda="Verifica que el apellido del postulante se encuentre en el documento"
          value={String(valores.apellido_postulante_ejerciciolibre ?? "")}
          error={errores.apellido_postulante_ejerciciolibre}
          onChange={(v) => onCampo("apellido_postulante_ejerciciolibre", v)}
        />

        <CampoTexto
          id="inpreabogado_postulante_ejerciciolibre"
          etiqueta="Número de INPREABOGADO del postulante"
          ayuda="Verifica que el número del INPREABOGADO del postulante se encuentre en el documento"
          value={String(valores.inpreabogado_postulante_ejerciciolibre ?? "")}
          error={errores.inpreabogado_postulante_ejerciciolibre}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("inpreabogado_postulante_ejerciciolibre", v.replace(/\D/g, ""))
          }
        />

        <CampoTexto
          id="rol_postulante_ejerciciolibre"
          etiqueta="Rol del postulante"
          ayuda="Confirmación de su actuación formal como Apoderado Judicial, Defensor, Abogado Redactor."
          value={String(valores.rol_postulante_ejerciciolibre ?? "")}
          error={errores.rol_postulante_ejerciciolibre}
          onChange={(v) => onCampo("rol_postulante_ejerciciolibre", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha del acto o documento
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha exacta que permite al sistema construir la línea de tiempo de
            continuidad en el ejercicio.
          </p>
          <DatePicker
            id="fecha_acto_ejerciciolibre"
            value={String(valores.fecha_acto_ejerciciolibre ?? "")}
            onChange={(iso) => onCampo("fecha_acto_ejerciciolibre", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_acto_ejerciciolibre)}
          />
          {errores.fecha_acto_ejerciciolibre && (
            <p className="mensaje-error-campo">{errores.fecha_acto_ejerciciolibre}</p>
          )}
        </div>
      </fieldset>
    </div>
  );
}

function CampoTexto({
  id,
  etiqueta,
  ayuda,
  value,
  error,
  onChange,
  inputMode,
  maxLength,
  classNameExtra = "",
}: {
  readonly id: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly value: string;
  readonly error?: string;
  readonly onChange: (v: string) => void;
  readonly inputMode?: "numeric" | "text";
  readonly maxLength?: number;
  readonly classNameExtra?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-toga-600">
        {etiqueta}
      </label>
      <p className="mt-0.5 text-[0.7rem] text-toga-400">{ayuda}</p>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${CAMPO}${classNameExtra ? ` ${classNameExtra}` : ""}${error ? " campo-con-error" : ""}`}
        aria-invalid={Boolean(error)}
        autoComplete="off"
      />
      {error && <p className="mensaje-error-campo">{error}</p>}
    </div>
  );
}
