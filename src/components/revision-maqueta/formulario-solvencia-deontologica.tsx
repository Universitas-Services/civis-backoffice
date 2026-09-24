"use client";

import { DatePicker } from "@/components/ui/date-picker";
import type {
  ErroresFormularioRevision,
  ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioSolvenciaDeontologica({
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
          Datos de la Solvencia moral y deontológica
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento evidencia la condición ética y el aval de conducta que
          demuestra que un postulante a la alta magistratura posee una trayectoria
          pública y profesional intachable, respetando tanto los valores
          republicanos como los deberes de la profesión de abogado. Todos los
          campos son opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos generales de la Entidad u Organización que emite la Carta
          Deontológica
        </p>

        <CampoTexto
          id="nombre_entidad_deontologica"
          etiqueta="Nombre completo de la Entidad u Organización emisora de la carta"
          ayuda="Ejemplo: Colegio de Abogados del Distrito Capital"
          value={String(valores.nombre_entidad_deontologica ?? "")}
          error={errores.nombre_entidad_deontologica}
          onChange={(v) => onCampo("nombre_entidad_deontologica", v)}
        />

        <CampoTexto
          id="estado_entidad_deontologica"
          etiqueta="Estado"
          ayuda="Coloca el Estado donde se ubica la Entidad u organización que emite la carta"
          value={String(valores.estado_entidad_deontologica ?? "")}
          error={errores.estado_entidad_deontologica}
          onChange={(v) => onCampo("estado_entidad_deontologica", v)}
        />

        <CampoTexto
          id="municipio_entidad_deontologica"
          etiqueta="Municipio"
          ayuda="Coloca el Municipio donde se ubica la Entidad u organización que emite la carta"
          value={String(valores.municipio_entidad_deontologica ?? "")}
          error={errores.municipio_entidad_deontologica}
          onChange={(v) => onCampo("municipio_entidad_deontologica", v)}
        />

        <CampoTexto
          id="direccion_entidad_deontologica"
          etiqueta="Dirección"
          ayuda="Coloca la dirección donde se ubica la Entidad u organización que emite la carta"
          value={String(valores.direccion_entidad_deontologica ?? "")}
          error={errores.direccion_entidad_deontologica}
          onChange={(v) => onCampo("direccion_entidad_deontologica", v)}
        />

        <CampoTexto
          id="nombre_quiensuscribe_deontologica"
          etiqueta="Nombre completo de quien suscribe el documento"
          ayuda="Nombre de quien firma o suscribe la carta"
          value={String(valores.nombre_quiensuscribe_deontologica ?? "")}
          error={errores.nombre_quiensuscribe_deontologica}
          onChange={(v) => onCampo("nombre_quiensuscribe_deontologica", v)}
        />

        <CampoTexto
          id="cedula_quiensuscribe_deontologica"
          etiqueta="Cédula de quien suscribe el documento"
          ayuda="Número de cédula de quien suscribe"
          value={String(valores.cedula_quiensuscribe_deontologica ?? "")}
          error={errores.cedula_quiensuscribe_deontologica}
          inputMode="numeric"
          maxLength={8}
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("cedula_quiensuscribe_deontologica", v.replace(/\D/g, "").slice(0, 8))
          }
        />

        <CampoTexto
          id="cargo_quiensuscribe_deontologica"
          etiqueta="Cargo de quien suscribe el documento"
          ayuda="Cargo de quien suscribe la carta"
          value={String(valores.cargo_quiensuscribe_deontologica ?? "")}
          error={errores.cargo_quiensuscribe_deontologica}
          onChange={(v) => onCampo("cargo_quiensuscribe_deontologica", v)}
        />

        <CampoTexto
          id="inpreabogado_quiensuscribe_deontologica"
          etiqueta="Número del INPREABOGADO de quien suscribe el documento"
          ayuda="Número de INPREABOGADO de quien suscribe"
          value={String(valores.inpreabogado_quiensuscribe_deontologica ?? "")}
          error={errores.inpreabogado_quiensuscribe_deontologica}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("inpreabogado_quiensuscribe_deontologica", v.replace(/\D/g, ""))
          }
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante de la Carta Deontológica
        </p>

        <CampoTexto
          id="nombre_postulante_deontologica"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien hace la petición de la carta deontológica"
          value={String(valores.nombre_postulante_deontologica ?? "")}
          error={errores.nombre_postulante_deontologica}
          onChange={(v) => onCampo("nombre_postulante_deontologica", v)}
        />

        <CampoTexto
          id="apellido_postulante_deontologica"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien hace la petición de la carta deontológica"
          value={String(valores.apellido_postulante_deontologica ?? "")}
          error={errores.apellido_postulante_deontologica}
          onChange={(v) => onCampo("apellido_postulante_deontologica", v)}
        />

        <CampoTexto
          id="cedula_postulante_deontologica"
          etiqueta="Número de Cédula de Identidad del solicitante"
          ayuda="Coloca el número de cédula de quien hace la petición de la carta deontológica"
          value={String(valores.cedula_postulante_deontologica ?? "")}
          error={errores.cedula_postulante_deontologica}
          inputMode="numeric"
          maxLength={8}
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("cedula_postulante_deontologica", v.replace(/\D/g, "").slice(0, 8))
          }
        />

        <CampoTexto
          id="inpreabogado_postulante_deontologica"
          etiqueta="Número de INPREABOGADO del solicitante"
          ayuda="Coloca el número del INPREABOGADO de quien hace la petición de la carta deontológica"
          value={String(valores.inpreabogado_postulante_deontologica ?? "")}
          error={errores.inpreabogado_postulante_deontologica}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("inpreabogado_postulante_deontologica", v.replace(/\D/g, ""))
          }
        />

        <CampoArea
          id="declaracion_solvencia_deontologica"
          etiqueta="Declaración explícita de solvencia moral y deontológica"
          ayuda="Texto que certifica la reconocida honorabilidad, trayectoria impecable y la ausencia de expedientes disciplinarios o sanciones éticas en el ejercicio profesional"
          value={String(valores.declaracion_solvencia_deontologica ?? "")}
          error={errores.declaracion_solvencia_deontologica}
          onChange={(v) => onCampo("declaracion_solvencia_deontologica", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de expedición</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha suscripción del documento
          </p>
          <DatePicker
            id="fecha_expedicion_deontologica"
            value={String(valores.fecha_expedicion_deontologica ?? "")}
            onChange={(iso) => onCampo("fecha_expedicion_deontologica", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_expedicion_deontologica)}
          />
          {errores.fecha_expedicion_deontologica && (
            <p className="mensaje-error-campo">{errores.fecha_expedicion_deontologica}</p>
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

function CampoArea({
  id,
  etiqueta,
  ayuda,
  value,
  error,
  onChange,
}: {
  readonly id: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly value: string;
  readonly error?: string;
  readonly onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-toga-600">
        {etiqueta}
      </label>
      <p className="mt-0.5 text-[0.7rem] text-toga-400">{ayuda}</p>
      <textarea
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${CAMPO}${error ? " campo-con-error" : ""}`}
        aria-invalid={Boolean(error)}
        autoComplete="off"
      />
      {error && <p className="mensaje-error-campo">{error}</p>}
    </div>
  );
}
