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
  KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioTituloDoctorado({
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
          Fondo negro del título universitario de doctorado en derecho o ciencias
          jurídicas
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento acredita el título de doctor o doctora en derecho o área
          afín de la ciencia jurídica del postulante otorgado por una institución
          universitaria acreditada, debidamente registrado y protocolizado. Todos
          los campos son opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la universidad emisora
        </p>

        <CampoTexto
          id="nombre_universidad_doctorado"
          etiqueta="Nombre completo de la casa de estudios superiores"
          ayuda="Ejemplo: Universidad Central de Venezuela"
          value={String(valores.nombre_universidad_doctorado ?? "")}
          error={errores.nombre_universidad_doctorado}
          onChange={(v) => onCampo("nombre_universidad_doctorado", v)}
        />

        <CampoTexto
          id="nombre_rector_doctorado"
          etiqueta="Nombre completo del rector que suscribe el título"
          ayuda="Ejemplo: Carlos Ramón Gómez"
          value={String(valores.nombre_rector_doctorado ?? "")}
          error={errores.nombre_rector_doctorado}
          onChange={(v) => onCampo("nombre_rector_doctorado", v)}
        />

        <CampoTexto
          id="nombre_secretario_doctorado"
          etiqueta="Nombre completo del secretario general que suscribe el título"
          ayuda="Ejemplo: Carlos Ramón Gómez"
          value={String(valores.nombre_secretario_doctorado ?? "")}
          error={errores.nombre_secretario_doctorado}
          onChange={(v) => onCampo("nombre_secretario_doctorado", v)}
        />

        <CampoTexto
          id="denominacion_titulo_doctorado"
          etiqueta="Denominación del título"
          ayuda="Ejemplo: Doctor en Ciencias Jurídicas"
          value={String(valores.denominacion_titulo_doctorado ?? "")}
          error={errores.denominacion_titulo_doctorado}
          onChange={(v) => onCampo("denominacion_titulo_doctorado", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del titular del diploma
        </p>

        <CampoTexto
          id="nombre_pregrado_doctorado"
          etiqueta="Nombre del pregrado del egresado"
          ayuda="Coloca el nombre del pregrado que figura en el cuerpo del diploma."
          value={String(valores.nombre_pregrado_doctorado ?? "")}
          error={errores.nombre_pregrado_doctorado}
          onChange={(v) => onCampo("nombre_pregrado_doctorado", v)}
        />

        <CampoTexto
          id="nombre_postulante_doctorado"
          etiqueta="Nombre completo del egresado"
          ayuda="Coloca el nombre del egresado/a tal como figura en el cuerpo del diploma."
          value={String(valores.nombre_postulante_doctorado ?? "")}
          error={errores.nombre_postulante_doctorado}
          onChange={(v) => onCampo("nombre_postulante_doctorado", v)}
        />

        <CampoTexto
          id="apellido_postulante_doctorado"
          etiqueta="Apellido completo del egresado"
          ayuda="Coloca el apellido del egresado/a tal como figura en el cuerpo del diploma."
          value={String(valores.apellido_postulante_doctorado ?? "")}
          error={errores.apellido_postulante_doctorado}
          onChange={(v) => onCampo("apellido_postulante_doctorado", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_doctorado"
          etiqueta="Número de cédula de identidad del egresado"
          ayuda="Coloca el número de cédula del egresado/a tal como figura en el cuerpo del diploma."
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO] ?? "V")}
          digitos={String(valores.cedula_postulante_doctorado ?? "")}
          error={errores.cedula_postulante_doctorado}
          onCampo={onCampo}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de graduación / expedición
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha (día, mes y año) en la que el Consejo Universitario otorgó el grado.
          </p>
          <DatePicker
            id="fecha_graduacion_doctorado"
            value={String(valores.fecha_graduacion_doctorado ?? "")}
            onChange={(iso) => onCampo("fecha_graduacion_doctorado", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_graduacion_doctorado)}
          />
          {errores.fecha_graduacion_doctorado && (
            <p className="mensaje-error-campo">{errores.fecha_graduacion_doctorado}</p>
          )}
        </div>

        <p className="pt-2 text-xs font-semibold text-toga-800">Datos registrales del título</p>

        <CampoTexto
          id="registro_publico_doctorado"
          etiqueta="Nombre Oficina Principal de Registro Público"
          ayuda="Ejemplo: Oficina Principal de Registro Público del Distrito Capital"
          value={String(valores.registro_publico_doctorado ?? "")}
          error={errores.registro_publico_doctorado}
          onChange={(v) => onCampo("registro_publico_doctorado", v)}
        />

        <CampoTexto
          id="numero_asentamiento_doctorado"
          etiqueta="Número de asentamiento"
          ayuda="Coloca el número de acta que corresponde"
          value={String(valores.numero_asentamiento_doctorado ?? "")}
          error={errores.numero_asentamiento_doctorado}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("numero_asentamiento_doctorado", v.replace(/\D/g, ""))
          }
        />

        <CampoTexto
          id="tomo_registro_doctorado"
          etiqueta="Tomo"
          ayuda="Coloca el número del tomo"
          value={String(valores.tomo_registro_doctorado ?? "")}
          error={errores.tomo_registro_doctorado}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) => onCampo("tomo_registro_doctorado", v.replace(/\D/g, ""))}
        />

        <CampoTexto
          id="folio_registro_doctorado"
          etiqueta="Folio"
          ayuda="Coloca el número del folio"
          value={String(valores.folio_registro_doctorado ?? "")}
          error={errores.folio_registro_doctorado}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) => onCampo("folio_registro_doctorado", v.replace(/\D/g, ""))}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de protocolización
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha en la que el Registrador Principal estampó la nota de registro.
          </p>
          <DatePicker
            id="fecha_protocolizacion_doctorado"
            value={String(valores.fecha_protocolizacion_doctorado ?? "")}
            onChange={(iso) => onCampo("fecha_protocolizacion_doctorado", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_protocolizacion_doctorado)}
          />
          {errores.fecha_protocolizacion_doctorado && (
            <p className="mensaje-error-campo">{errores.fecha_protocolizacion_doctorado}</p>
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
