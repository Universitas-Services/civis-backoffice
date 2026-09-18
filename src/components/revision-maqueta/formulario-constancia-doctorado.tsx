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
  KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioConstanciaDoctorado({
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
          Copia de la constancia de aprobación de tesis doctoral
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento acredita la aprobación de la tesis doctoral en derecho
          del postulante, expedida por la universidad correspondiente. Todos los
          campos son opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la universidad emisora
        </p>

        <CampoTexto
          id="nombre_universidad_tesis_doctorado"
          etiqueta="Nombre completo de la casa de estudios superiores"
          ayuda="Ejemplo: Universidad Central de Venezuela"
          value={String(valores.nombre_universidad_tesis_doctorado ?? "")}
          error={errores.nombre_universidad_tesis_doctorado}
          onChange={(v) => onCampo("nombre_universidad_tesis_doctorado", v)}
        />

        <CampoTexto
          id="denominacion_titulo_tesis_doctorado"
          etiqueta="Denominación del título"
          ayuda="Ejemplo: Doctor en Ciencias Jurídicas"
          value={String(valores.denominacion_titulo_tesis_doctorado ?? "")}
          error={errores.denominacion_titulo_tesis_doctorado}
          onChange={(v) => onCampo("denominacion_titulo_tesis_doctorado", v)}
        />

        <CampoArea
          id="titulo_tesis_doctorado"
          etiqueta="Título de la tesis doctoral"
          ayuda='Ejemplo: "Hacia un modelo de imputación penal de la inteligencia artificial…"'
          value={String(valores.titulo_tesis_doctorado ?? "")}
          error={errores.titulo_tesis_doctorado}
          onChange={(v) => onCampo("titulo_tesis_doctorado", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del profesional
        </p>

        <CampoTexto
          id="nombre_postulante_tesis_doctorado"
          etiqueta="Nombre completo del profesional"
          ayuda="Coloca el nombre del profesional que presenta la tesis doctoral"
          value={String(valores.nombre_postulante_tesis_doctorado ?? "")}
          error={errores.nombre_postulante_tesis_doctorado}
          onChange={(v) => onCampo("nombre_postulante_tesis_doctorado", v)}
        />

        <CampoTexto
          id="apellido_postulante_tesis_doctorado"
          etiqueta="Apellido completo del profesional"
          ayuda="Coloca el Apellido del profesional que presenta la tesis doctoral"
          value={String(valores.apellido_postulante_tesis_doctorado ?? "")}
          error={errores.apellido_postulante_tesis_doctorado}
          onChange={(v) => onCampo("apellido_postulante_tesis_doctorado", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_tesis_doctorado"
          etiqueta="Número de cédula de identidad del profesional"
          ayuda="Coloca el número de cédula del profesional que presenta la tesis doctoral"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO] ?? "V",
          )}
          digitos={String(valores.cedula_postulante_tesis_doctorado ?? "")}
          error={errores.cedula_postulante_tesis_doctorado}
          onCampo={onCampo}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Integrantes del jurado examinador
        </p>

        <CampoArea
          id="jurado_examinador_doctorado"
          etiqueta="Nombres completos de los profesores jurados examinadores"
          ayuda="Ejemplo: Maria del Carmen Perez, Carlos Augusto Rodriguez, María Mendez"
          value={String(valores.jurado_examinador_doctorado ?? "")}
          error={errores.jurado_examinador_doctorado}
          onChange={(v) => onCampo("jurado_examinador_doctorado", v)}
        />

        <CampoTexto
          id="veredicto_calificacion_doctorado"
          etiqueta="Veredicto / Calificación"
          ayuda="Ejemplo: Aprobada por unanimidad, publicación, mención Honorífica, o nota numérica"
          value={String(valores.veredicto_calificacion_doctorado ?? "")}
          error={errores.veredicto_calificacion_doctorado}
          onChange={(v) => onCampo("veredicto_calificacion_doctorado", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de defensa</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Día, mes y año de la presentación pública
          </p>
          <DatePicker
            id="fecha_defensa_doctorado"
            value={String(valores.fecha_defensa_doctorado ?? "")}
            onChange={(iso) => onCampo("fecha_defensa_doctorado", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_defensa_doctorado)}
          />
          {errores.fecha_defensa_doctorado && (
            <p className="mensaje-error-campo">{errores.fecha_defensa_doctorado}</p>
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
        rows={3}
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
