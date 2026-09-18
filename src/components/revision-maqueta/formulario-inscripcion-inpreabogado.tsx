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
  KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO,
  KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioInscripcionInpreabogado({
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
          Certificación de inscripción en el Instituto de Previsión Social del
          Abogado (INPREABOGADO)
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento evidencia la inscripción y la asignación del número de
          registro nacional del postulante expedida por el Instituto de Previsión
          Social del Abogado. Todos los campos son opcionales: si no se pueden
          leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos generales de quien suscribe la constancia
        </p>
        <p className="text-[0.7rem] text-toga-400">
          La inscripción al Instituto de Previsión Social del Abogado emite un
          número único nacional para cada abogado una vez inscrito
        </p>

        <CampoTexto
          id="nombre_quiensuscribe_inpreabogado"
          etiqueta="Nombre completo de quien suscribe el documento"
          ayuda="Nombre de la autoridad del INPREABOGADO que suscribe"
          value={String(valores.nombre_quiensuscribe_inpreabogado ?? "")}
          error={errores.nombre_quiensuscribe_inpreabogado}
          onChange={(v) => onCampo("nombre_quiensuscribe_inpreabogado", v)}
        />

        <CampoCedulaVe
          id="cedula_quiensuscribe_inpreabogado"
          etiqueta="Cédula de quien suscribe el documento"
          ayuda="Coloca la cédula de identidad de la autoridad del INPREABOGADO que suscribe la constancia"
          prefijoKey={KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO] ?? "V",
          )}
          digitos={String(valores.cedula_quiensuscribe_inpreabogado ?? "")}
          error={errores.cedula_quiensuscribe_inpreabogado}
          onCampo={onCampo}
        />

        <CampoTexto
          id="cargo_quiensuscribe_inpreabogado"
          etiqueta="Cargo de quien suscribe el documento"
          ayuda="Cargo de la autoridad que suscribe"
          value={String(valores.cargo_quiensuscribe_inpreabogado ?? "")}
          error={errores.cargo_quiensuscribe_inpreabogado}
          onChange={(v) => onCampo("cargo_quiensuscribe_inpreabogado", v)}
        />

        <CampoTexto
          id="numero_quiensuscribe_inpreabogado"
          etiqueta="Número del INPREABOGADO de quien suscribe el documento"
          ayuda="Número de INPREABOGADO de quien suscribe"
          value={String(valores.numero_quiensuscribe_inpreabogado ?? "")}
          error={errores.numero_quiensuscribe_inpreabogado}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("numero_quiensuscribe_inpreabogado", v.replace(/\D/g, ""))
          }
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante de la constancia de inscripción
        </p>

        <CampoTexto
          id="nombre_postulante_inpreabogado"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien hace la petición de la constancia de inscripción"
          value={String(valores.nombre_postulante_inpreabogado ?? "")}
          error={errores.nombre_postulante_inpreabogado}
          onChange={(v) => onCampo("nombre_postulante_inpreabogado", v)}
        />

        <CampoTexto
          id="apellido_postulante_inpreabogado"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien hace la petición de la constancia de inscripción"
          value={String(valores.apellido_postulante_inpreabogado ?? "")}
          error={errores.apellido_postulante_inpreabogado}
          onChange={(v) => onCampo("apellido_postulante_inpreabogado", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_inpreabogado"
          etiqueta="Número de cédula de identidad del solicitante"
          ayuda="Coloca el número de cédula de quien hace la petición de la constancia de inscripción"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO] ?? "V",
          )}
          digitos={String(valores.cedula_postulante_inpreabogado ?? "")}
          error={errores.cedula_postulante_inpreabogado}
          onCampo={onCampo}
        />

        <CampoTexto
          id="inpreabogado_postulante_nacional"
          etiqueta="Número de INPREABOGADO del solicitante"
          ayuda="Coloca el número del INPREABOGADO de quien hace la petición de la constancia de inscripción"
          value={String(valores.inpreabogado_postulante_nacional ?? "")}
          error={errores.inpreabogado_postulante_nacional}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("inpreabogado_postulante_nacional", v.replace(/\D/g, ""))
          }
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de inscripción nacional
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Día, mes y año de adscripción al Instituto de Previsión Social del
            Abogado
          </p>
          <DatePicker
            id="fecha_inscripcion_inpreabogado"
            value={String(valores.fecha_inscripcion_inpreabogado ?? "")}
            onChange={(iso) => onCampo("fecha_inscripcion_inpreabogado", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_inscripcion_inpreabogado)}
          />
          {errores.fecha_inscripcion_inpreabogado && (
            <p className="mensaje-error-campo">{errores.fecha_inscripcion_inpreabogado}</p>
          )}
        </div>

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de expedición</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha suscripción del documento
          </p>
          <DatePicker
            id="fecha_expedicion_inpreabogado"
            value={String(valores.fecha_expedicion_inpreabogado ?? "")}
            onChange={(iso) => onCampo("fecha_expedicion_inpreabogado", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_expedicion_inpreabogado)}
          />
          {errores.fecha_expedicion_inpreabogado && (
            <p className="mensaje-error-campo">{errores.fecha_expedicion_inpreabogado}</p>
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
