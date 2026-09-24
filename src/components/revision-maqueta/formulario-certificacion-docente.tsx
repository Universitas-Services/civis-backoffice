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
  KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioCertificacionDocente({
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
          Certificación oficial de servicio docente y categoría expedida por el
          consejo de facultad o consejo universitario
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento de constancia institucional expedida por la facultad de
          ciencias jurídicas y políticas del postulante, donde acredita
          expresamente la cátedra impartida en ciencias jurídicas, la antigüedad
          acumulada (mínimo 15 años) y la categoría docente. Todos los campos
          son opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la universidad emisora
        </p>

        <CampoTexto
          id="nombre_universidad_docencia"
          etiqueta="Nombre completo de la casa de estudios superiores"
          ayuda="Ejemplo: Universidad Central de Venezuela"
          value={String(valores.nombre_universidad_docencia ?? "")}
          error={errores.nombre_universidad_docencia}
          onChange={(v) => onCampo("nombre_universidad_docencia", v)}
        />

        <CampoTexto
          id="facultad_docencia"
          etiqueta="Nombre de la facultad a la que pertenece"
          ayuda="Ejemplo: Facultad de Ciencias Políticas"
          value={String(valores.facultad_docencia ?? "")}
          error={errores.facultad_docencia}
          onChange={(v) => onCampo("facultad_docencia", v)}
        />

        <CampoTexto
          id="organo_expedidor_docencia"
          etiqueta="Órgano expedidor"
          ayuda="Ejemplo: Consejo de facultad, Consejo universitario, secretaria general de la Universidad"
          value={String(valores.organo_expedidor_docencia ?? "")}
          error={errores.organo_expedidor_docencia}
          onChange={(v) => onCampo("organo_expedidor_docencia", v)}
        />

        <CampoTexto
          id="catedra_impartida_docencia"
          etiqueta="Cátedra(s) o asignatura(s) impartida(s)"
          ayuda="Denominación exacta de la materia jurídica (Ejemplo: Derecho Constitucional, Derecho Procesal Civil, Derecho Administrativo, etc.)"
          value={String(valores.catedra_impartida_docencia ?? "")}
          error={errores.catedra_impartida_docencia}
          onChange={(v) => onCampo("catedra_impartida_docencia", v)}
        />

        <CampoTexto
          id="nivel_docente_docencia"
          etiqueta="Nivel docente"
          ayuda="Especificación de si imparte docencia en Pregrado, Posgrado (Especialización/Maestría/Doctorado) o ambos."
          value={String(valores.nivel_docente_docencia ?? "")}
          error={errores.nivel_docente_docencia}
          onChange={(v) => onCampo("nivel_docente_docencia", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del docente
        </p>

        <CampoTexto
          id="nombre_postulante_docencia"
          etiqueta="Nombre completo del docente"
          ayuda="Coloca el nombre del docente que aparece en la constancia"
          value={String(valores.nombre_postulante_docencia ?? "")}
          error={errores.nombre_postulante_docencia}
          onChange={(v) => onCampo("nombre_postulante_docencia", v)}
        />

        <CampoTexto
          id="apellido_postulante_docencia"
          etiqueta="Apellido completo del docente"
          ayuda="Coloca el apellido del docente que aparece en la constancia"
          value={String(valores.apellido_postulante_docencia ?? "")}
          error={errores.apellido_postulante_docencia}
          onChange={(v) => onCampo("apellido_postulante_docencia", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_docencia"
          etiqueta="Número de cédula de identidad del docente"
          ayuda="Coloca el número de cédula del docente que aparece en la constancia"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA] ?? "V")}
          digitos={String(valores.cedula_postulante_docencia ?? "")}
          error={errores.cedula_postulante_docencia}
          onCampo={onCampo}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Línea de tiempo y antigüedad acumulada
        </p>

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de inicio de la actividad docente
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Día, mes y año de primer nombramiento o contrato.
          </p>
          <DatePicker
            id="fecha_inicio_docencia"
            value={String(valores.fecha_inicio_docencia ?? "")}
            onChange={(iso) => onCampo("fecha_inicio_docencia", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_inicio_docencia)}
          />
          {errores.fecha_inicio_docencia && (
            <p className="mensaje-error-campo">{errores.fecha_inicio_docencia}</p>
          )}
        </div>

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de corte</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha de expedición de la constancia.
          </p>
          <DatePicker
            id="fecha_corte_docencia"
            value={String(valores.fecha_corte_docencia ?? "")}
            onChange={(iso) => onCampo("fecha_corte_docencia", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_corte_docencia)}
          />
          {errores.fecha_corte_docencia && (
            <p className="mensaje-error-campo">{errores.fecha_corte_docencia}</p>
          )}
        </div>

        <CampoTexto
          id="condicion_docente_docencia"
          etiqueta="Condición del docente"
          ayuda="Ejemplo: Docente activo o jubilado"
          value={String(valores.condicion_docente_docencia ?? "")}
          error={errores.condicion_docente_docencia}
          onChange={(v) => onCampo("condicion_docente_docencia", v)}
        />

        <CampoTexto
          id="escalafon_docente_docencia"
          etiqueta="Escalafón / Categoría docente"
          ayuda="Rango del profesor en la carrera académica (Ejemplo: Instructor, Asistente, Agregado, Asociado o Titular)"
          value={String(valores.escalafon_docente_docencia ?? "")}
          error={errores.escalafon_docente_docencia}
          onChange={(v) => onCampo("escalafon_docente_docencia", v)}
        />
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
