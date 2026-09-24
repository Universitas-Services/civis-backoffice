"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  KEY_PREFIJO_CEDULA_POSTULANTE_SALUD,
  KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioCertMedicaMental({
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
          Certificación médica de capacidad mental
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento evidencia la condición y capacidad médica y mental del
          postulante. Todos los campos son opcionales: si no se pueden leer,
          déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación del profesional de la Salud Emisor del documento
        </p>

        <CampoTexto
          id="nombre_profesional_salud"
          etiqueta="Nombre completo del Profesional de Salud emisor"
          ayuda="Ejemplo: Dr. Carlos Perez"
          value={String(valores.nombre_profesional_salud ?? "")}
          error={errores.nombre_profesional_salud}
          onChange={(v) => onCampo("nombre_profesional_salud", v)}
        />

        <CampoCedulaVe
          id="cedula_profesional_salud"
          etiqueta="Cédula de quien suscribe el documento"
          ayuda="Número de cédula del profesional de la salud"
          prefijoKey={KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD] ?? "V")}
          digitos={String(valores.cedula_profesional_salud ?? "")}
          error={errores.cedula_profesional_salud}
          onCampo={onCampo}
        />

        <CampoTexto
          id="profesion_profesional_salud"
          etiqueta="Profesión de quien suscribe el documento"
          ayuda="Profesión del profesional emisor"
          value={String(valores.profesion_profesional_salud ?? "")}
          error={errores.profesion_profesional_salud}
          onChange={(v) => onCampo("profesion_profesional_salud", v)}
        />

        <CampoTexto
          id="colegiacion_profesional_salud"
          etiqueta="Número de colegiación médica / psicológica de quien suscribe el documento"
          ayuda="Número de colegiación del profesional"
          value={String(valores.colegiacion_profesional_salud ?? "")}
          error={errores.colegiacion_profesional_salud}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("colegiacion_profesional_salud", v.replace(/\D/g, ""))
          }
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante del Certificado
        </p>

        <CampoTexto
          id="nombre_postulante_salud"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien solicita la certificación médica / psicológica"
          value={String(valores.nombre_postulante_salud ?? "")}
          error={errores.nombre_postulante_salud}
          onChange={(v) => onCampo("nombre_postulante_salud", v)}
        />

        <CampoTexto
          id="apellido_postulante_salud"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien solicita la certificación médica / psicológica"
          value={String(valores.apellido_postulante_salud ?? "")}
          error={errores.apellido_postulante_salud}
          onChange={(v) => onCampo("apellido_postulante_salud", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_salud"
          etiqueta="Número de cédula de Identidad del solicitante"
          ayuda="Coloca el número de cédula de quien solicita la certificación médica / psicológica"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_SALUD}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_POSTULANTE_SALUD] ?? "V")}
          digitos={String(valores.cedula_postulante_salud ?? "")}
          error={errores.cedula_postulante_salud}
          onCampo={onCampo}
        />

        <CampoArea
          id="conclusion_diagnostica_salud"
          etiqueta="Conclusión médica / diagnóstica expresa"
          ayuda="Manifestación explícita y categórica que acredite la plena capacidad mental, la indemnidad cognitiva y la ausencia de patologías o trastornos psiquiátricos inhabilitantes para el ejercicio de la función pública."
          value={String(valores.conclusion_diagnostica_salud ?? "")}
          error={errores.conclusion_diagnostica_salud}
          onChange={(v) => onCampo("conclusion_diagnostica_salud", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de expedición</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha suscripción del documento
          </p>
          <DatePicker
            id="fecha_expedicion_salud"
            value={String(valores.fecha_expedicion_salud ?? "")}
            onChange={(iso) => onCampo("fecha_expedicion_salud", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_expedicion_salud)}
          />
          {errores.fecha_expedicion_salud && (
            <p className="mensaje-error-campo">{errores.fecha_expedicion_salud}</p>
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

function CampoCedulaVe({
  id,
  etiqueta,
  ayuda,
  prefijoKey,
  prefijo,
  digitos,
  error,
  onCampo,
}: {
  readonly id: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly prefijoKey: string;
  readonly prefijo: string;
  readonly digitos: string;
  readonly error?: string;
  readonly onCampo: (key: string, value: string | boolean | null) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-toga-600">
        {etiqueta}
      </label>
      <p className="mt-0.5 text-[0.7rem] text-toga-400">{ayuda}</p>
      <div className="mt-1 flex w-fit max-w-full gap-2">
        <Select
          value={prefijo === "E" ? "E" : "V"}
          onValueChange={(v) => onCampo(prefijoKey, v)}
        >
          <SelectTrigger
            className={`w-16 shrink-0${error ? " campo-con-error" : ""}`}
            aria-label={`Tipo de cédula (${etiqueta})`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="V">V</SelectItem>
            <SelectItem value="E">E</SelectItem>
          </SelectContent>
        </Select>
        <input
          id={id}
          inputMode="numeric"
          maxLength={8}
          placeholder="12345678"
          value={digitos}
          onChange={(e) =>
            onCampo(id, e.target.value.replace(/\D/g, "").slice(0, 8))
          }
          className={`${CAMPO} !mt-0 !w-32 codigo${error ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(error)}
          autoComplete="off"
        />
      </div>
      {error && <p className="mensaje-error-campo">{error}</p>}
    </div>
  );
}
