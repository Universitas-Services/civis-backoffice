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
  KEY_PREFIJO_CEDULA_POSTULANTE_CGR,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioContraloriaCgr({
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
          Certificación de Contraloría General de la República de No poseer
          Inhabilitación
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento acredita que el postulante no registra inhabilitación ni
          responsabilidad administrativa firme, debe estar emitido por la
          Contraloría General de la República. Todos los campos son opcionales:
          si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la entidad emisora
        </p>

        <CampoTexto
          id="nombre_direccion_cgr"
          etiqueta="Nombre completo de la dirección que emite el certificado"
          ayuda="Ejemplo: Dirección General de Procedimientos Especiales"
          value={String(valores.nombre_direccion_cgr ?? "")}
          error={errores.nombre_direccion_cgr}
          onChange={(v) => onCampo("nombre_direccion_cgr", v)}
        />

        <CampoTexto
          id="nombre_quiensuscribe_cgr"
          etiqueta="Nombre completo de quien suscribe el Certificado"
          ayuda="Ejemplo: Carlos Ramón Gómez"
          value={String(valores.nombre_quiensuscribe_cgr ?? "")}
          error={errores.nombre_quiensuscribe_cgr}
          onChange={(v) => onCampo("nombre_quiensuscribe_cgr", v)}
        />

        <CampoTexto
          id="cargo_quiensuscribe_cgr"
          etiqueta="Cargo de quien suscribe el documento"
          ayuda="Ejemplo: Director del departamento de determinación de responsabilidades"
          value={String(valores.cargo_quiensuscribe_cgr ?? "")}
          error={errores.cargo_quiensuscribe_cgr}
          onChange={(v) => onCampo("cargo_quiensuscribe_cgr", v)}
        />

        <CampoArea
          id="designacion_quiensuscribe_cgr"
          etiqueta="Datos de designación de quien suscribe el documento"
          ayuda="Ejemplo: Designada según Decreto N° xxxx de fecha xx de xxxxx de xxxx. Publicado en Gaceta Oficial…"
          value={String(valores.designacion_quiensuscribe_cgr ?? "")}
          error={errores.designacion_quiensuscribe_cgr}
          onChange={(v) => onCampo("designacion_quiensuscribe_cgr", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante del Certificado
        </p>

        <CampoTexto
          id="nombre_postulante_cgr"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien solicita la certificación de la Contraloría General de la República"
          value={String(valores.nombre_postulante_cgr ?? "")}
          error={errores.nombre_postulante_cgr}
          onChange={(v) => onCampo("nombre_postulante_cgr", v)}
        />

        <CampoTexto
          id="apellido_postulante_cgr"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien solicita la certificación de la Contraloría General de la República"
          value={String(valores.apellido_postulante_cgr ?? "")}
          error={errores.apellido_postulante_cgr}
          onChange={(v) => onCampo("apellido_postulante_cgr", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_cgr"
          etiqueta="Número de Cédula de Identidad del solicitante"
          ayuda="Coloca el número de cédula de quien solicita la certificación de la Contraloría General de la República"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_CGR}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_POSTULANTE_CGR] ?? "V")}
          digitos={String(valores.cedula_postulante_cgr ?? "")}
          error={errores.cedula_postulante_cgr}
          onCampo={onCampo}
        />

        <CampoArea
          id="dictamen_expreso_cgr"
          etiqueta="Dictamen expreso de no poseer inhabilitación"
          ayuda="Constancia fehaciente de no registrar inhabilitación para el ejercicio de funciones públicas ni sanción firme de responsabilidad administrativa."
          value={String(valores.dictamen_expreso_cgr ?? "")}
          error={errores.dictamen_expreso_cgr}
          onChange={(v) => onCampo("dictamen_expreso_cgr", v)}
        />

        <CampoTexto
          id="codigo_verificacion_cgr"
          etiqueta="Número de oficio o código de verificación"
          ayuda="Clave de registro alfanumérico para auditar la autenticidad del documento en la base de datos de la CGR."
          value={String(valores.codigo_verificacion_cgr ?? "")}
          error={errores.codigo_verificacion_cgr}
          classNameExtra="codigo"
          onChange={(v) => onCampo("codigo_verificacion_cgr", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de expedición</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha de suscripción del documento
          </p>
          <DatePicker
            id="fecha_suscripcion_cgr"
            value={String(valores.fecha_suscripcion_cgr ?? "")}
            onChange={(iso) => onCampo("fecha_suscripcion_cgr", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_suscripcion_cgr)}
          />
          {errores.fecha_suscripcion_cgr && (
            <p className="mensaje-error-campo">{errores.fecha_suscripcion_cgr}</p>
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
