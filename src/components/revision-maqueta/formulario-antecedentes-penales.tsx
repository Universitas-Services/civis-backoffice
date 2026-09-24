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
  KEY_PREFIJO_CEDULA_POSTULANTE_PENALES,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioAntecedentesPenales({
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
          Certificación de Antecedentes Penales
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento evidencia los antecedentes penales vigentes del
          postulante, debe estar emitido por el ministerio con competencia en
          materia de relaciones interiores y justicia. Todos los campos son
          opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la entidad emisora
        </p>

        <CampoTexto
          id="nombre_entidad_penales"
          etiqueta="Nombre completo de la entidad que emite el certificado"
          ayuda="Ejemplo: MINISTERIO DEL PODER POPULAR PARA RELACIONES INTERIORES, JUSTICIA Y PAZ"
          value={String(valores.nombre_entidad_penales ?? "")}
          error={errores.nombre_entidad_penales}
          onChange={(v) => onCampo("nombre_entidad_penales", v)}
        />

        <CampoTexto
          id="nombre_quiensuscribe_penales"
          etiqueta="Nombre completo de quien suscribe el certificado"
          ayuda="Ejemplo: FÉLIX RAMÓN OSORIO GUZMÁN"
          value={String(valores.nombre_quiensuscribe_penales ?? "")}
          error={errores.nombre_quiensuscribe_penales}
          onChange={(v) => onCampo("nombre_quiensuscribe_penales", v)}
        />

        <CampoTexto
          id="cargo_quiensuscribe_penales"
          etiqueta="Cargo de quien suscribe el documento"
          ayuda="Ejemplo: VICEMINISTRO DE POLÍTICA INTERIOR Y SEGURIDAD JURÍDICA"
          value={String(valores.cargo_quiensuscribe_penales ?? "")}
          error={errores.cargo_quiensuscribe_penales}
          onChange={(v) => onCampo("cargo_quiensuscribe_penales", v)}
        />

        <CampoArea
          id="designacion_quiensuscribe_penales"
          etiqueta="Datos de designación de quien suscribe el documento"
          ayuda="Ejemplo: Designada según Decreto N° xxxx de fecha xx de xxxxx de xxxx. Publicado en Gaceta Oficial…"
          value={String(valores.designacion_quiensuscribe_penales ?? "")}
          error={errores.designacion_quiensuscribe_penales}
          onChange={(v) => onCampo("designacion_quiensuscribe_penales", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante del certificado
        </p>

        <CampoTexto
          id="nombre_postulante_penales"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien hace la solicitud de los antecedentes penales"
          value={String(valores.nombre_postulante_penales ?? "")}
          error={errores.nombre_postulante_penales}
          onChange={(v) => onCampo("nombre_postulante_penales", v)}
        />

        <CampoTexto
          id="apellido_postulante_penales"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien hace la solicitud de los antecedentes penales"
          value={String(valores.apellido_postulante_penales ?? "")}
          error={errores.apellido_postulante_penales}
          onChange={(v) => onCampo("apellido_postulante_penales", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_penales"
          etiqueta="Número de cédula de identidad del solicitante"
          ayuda="Coloca el número de cédula de quien hace la solicitud de los antecedentes penales"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_PENALES}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_POSTULANTE_PENALES] ?? "V")}
          digitos={String(valores.cedula_postulante_penales ?? "")}
          error={errores.cedula_postulante_penales}
          onCampo={onCampo}
        />

        <CampoArea
          id="dictamen_expreso_penales"
          etiqueta="Dictamen expreso"
          ayuda="Fe legal explícita de no registrar antecedentes penales ni sentencias condenatorias firmes en el sistema judicial."
          value={String(valores.dictamen_expreso_penales ?? "")}
          error={errores.dictamen_expreso_penales}
          onChange={(v) => onCampo("dictamen_expreso_penales", v)}
        />

        <CampoTexto
          id="codigo_verificacion_penales"
          etiqueta="Código único de verificación"
          ayuda="Clave alfanumérica y mecanismo criptográfico institucional para auditar la autenticidad del documento directo en el portal del ente emisor."
          value={String(valores.codigo_verificacion_penales ?? "")}
          error={errores.codigo_verificacion_penales}
          classNameExtra="codigo"
          onChange={(v) => onCampo("codigo_verificacion_penales", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de expedición</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha suscripción del documento
          </p>
          <DatePicker
            id="fecha_suscripcion_penales"
            value={String(valores.fecha_suscripcion_penales ?? "")}
            onChange={(iso) => onCampo("fecha_suscripcion_penales", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_suscripcion_penales)}
          />
          {errores.fecha_suscripcion_penales && (
            <p className="mensaje-error-campo">{errores.fecha_suscripcion_penales}</p>
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
