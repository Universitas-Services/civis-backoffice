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
  KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO,
  KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioInscripcionColegio({
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
          Certificación de inscripción en el colegio de abogados
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento evidencia la inscripción oficial del postulante
          expedida por el colegio de abogados de su adscripción territorial, que
          acredite la fecha de incorporación. Todos los campos son opcionales: si
          no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos generales de la entidad u organización que emite la constancia
        </p>

        <CampoTexto
          id="nombre_gremio_emisor"
          etiqueta="Nombre completo de la organización gremial emisora de la constancia"
          ayuda="Ejemplo: Colegio de Abogados del Distrito Capital"
          value={String(valores.nombre_gremio_emisor ?? "")}
          error={errores.nombre_gremio_emisor}
          onChange={(v) => onCampo("nombre_gremio_emisor", v)}
        />

        <CampoTexto
          id="estado_gremio_emisor"
          etiqueta="Estado"
          ayuda="Coloca el Estado donde se ubica la Organización Gremial que emite la constancia"
          value={String(valores.estado_gremio_emisor ?? "")}
          error={errores.estado_gremio_emisor}
          onChange={(v) => onCampo("estado_gremio_emisor", v)}
        />

        <CampoTexto
          id="direccion_gremio_emisor"
          etiqueta="Dirección"
          ayuda="Coloca la dirección donde se ubica la Organización Gremial que emite la constancia"
          value={String(valores.direccion_gremio_emisor ?? "")}
          error={errores.direccion_gremio_emisor}
          onChange={(v) => onCampo("direccion_gremio_emisor", v)}
        />

        <CampoTexto
          id="nombre_firmante_gremio"
          etiqueta="Nombre completo de quien suscribe el documento"
          ayuda="Nombre de la autoridad gremial que suscribe la constancia"
          value={String(valores.nombre_firmante_gremio ?? "")}
          error={errores.nombre_firmante_gremio}
          onChange={(v) => onCampo("nombre_firmante_gremio", v)}
        />

        <CampoCedulaVe
          id="cedula_firmante_gremio"
          etiqueta="Cédula de quien suscribe el documento"
          ayuda="Coloca la cédula de identidad de la autoridad gremial que suscribe la constancia"
          prefijoKey={KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO] ?? "V")}
          digitos={String(valores.cedula_firmante_gremio ?? "")}
          error={errores.cedula_firmante_gremio}
          onCampo={onCampo}
        />

        <CampoTexto
          id="cargo_firmante_gremio"
          etiqueta="Cargo de quien suscribe el documento"
          ayuda="Cargo de la autoridad gremial que suscribe"
          value={String(valores.cargo_firmante_gremio ?? "")}
          error={errores.cargo_firmante_gremio}
          onChange={(v) => onCampo("cargo_firmante_gremio", v)}
        />

        <CampoTexto
          id="inpreabogado_firmante_gremio"
          etiqueta="Número del INPREABOGADO de quien suscribe el documento"
          ayuda="Número de INPREABOGADO de quien suscribe"
          value={String(valores.inpreabogado_firmante_gremio ?? "")}
          error={errores.inpreabogado_firmante_gremio}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("inpreabogado_firmante_gremio", v.replace(/\D/g, ""))
          }
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante de la constancia de inscripción
        </p>

        <CampoTexto
          id="nombre_postulante_gremio"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien hace la petición de la constancia de inscripción"
          value={String(valores.nombre_postulante_gremio ?? "")}
          error={errores.nombre_postulante_gremio}
          onChange={(v) => onCampo("nombre_postulante_gremio", v)}
        />

        <CampoTexto
          id="apellido_postulante_gremio"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien hace la petición de la constancia de inscripción"
          value={String(valores.apellido_postulante_gremio ?? "")}
          error={errores.apellido_postulante_gremio}
          onChange={(v) => onCampo("apellido_postulante_gremio", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_gremio"
          etiqueta="Número de cédula de identidad del solicitante"
          ayuda="Coloca el número de cédula de quien hace la petición de la constancia de inscripción"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO] ?? "V")}
          digitos={String(valores.cedula_postulante_gremio ?? "")}
          error={errores.cedula_postulante_gremio}
          onCampo={onCampo}
        />

        <CampoTexto
          id="inpreabogado_postulante_colegio"
          etiqueta="Número de INPREABOGADO del solicitante"
          ayuda="Coloca el número del INPREABOGADO de quien hace la petición de la constancia de inscripción"
          value={String(valores.inpreabogado_postulante_colegio ?? "")}
          error={errores.inpreabogado_postulante_colegio}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("inpreabogado_postulante_colegio", v.replace(/\D/g, ""))
          }
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de incorporación / inscripción
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha exacta (día, mes, año) en que juró y se inscribió (clave para el
            inicio del cómputo de ejercicio libre)
          </p>
          <DatePicker
            id="fecha_inscripcion_gremio"
            value={String(valores.fecha_inscripcion_gremio ?? "")}
            onChange={(iso) => onCampo("fecha_inscripcion_gremio", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_inscripcion_gremio)}
          />
          {errores.fecha_inscripcion_gremio && (
            <p className="mensaje-error-campo">{errores.fecha_inscripcion_gremio}</p>
          )}
        </div>

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de expedición</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha suscripción del documento
          </p>
          <DatePicker
            id="fecha_expedicion_gremio"
            value={String(valores.fecha_expedicion_gremio ?? "")}
            onChange={(iso) => onCampo("fecha_expedicion_gremio", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_expedicion_gremio)}
          />
          {errores.fecha_expedicion_gremio && (
            <p className="mensaje-error-campo">{errores.fecha_expedicion_gremio}</p>
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
