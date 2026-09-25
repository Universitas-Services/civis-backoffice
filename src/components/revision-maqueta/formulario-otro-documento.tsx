"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KEY_PREFIJO_CEDULA_OTRO,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioOtroDocumento({
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
        <legend className="text-sm font-semibold text-toga-900">Otro documento</legend>
        <p className="text-[0.7rem] text-toga-500">
          Documento adicional que el postulante haya consignado. Todos los campos son opcionales: si
          no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos del postulante presentes en el documento
        </p>

        <CampoTexto
          id="nombre_postulante_otro"
          etiqueta="Nombre completo del postulante"
          ayuda="Coloca el nombre del postulante que aparece en el documento"
          value={String(valores.nombre_postulante_otro ?? "")}
          error={errores.nombre_postulante_otro}
          onChange={(v) => onCampo("nombre_postulante_otro", v)}
        />

        <CampoTexto
          id="apellido_postulante_otro"
          etiqueta="Apellido completo del postulante"
          ayuda="Coloca el apellido del postulante que aparece en el documento"
          value={String(valores.apellido_postulante_otro ?? "")}
          error={errores.apellido_postulante_otro}
          onChange={(v) => onCampo("apellido_postulante_otro", v)}
        />

        <CampoTexto
          id="estadocivil_postulante_otro"
          etiqueta="Estado civil"
          ayuda="Coloca el estado civil del postulante que aparece en el documento"
          value={String(valores.estadocivil_postulante_otro ?? "")}
          error={errores.estadocivil_postulante_otro}
          onChange={(v) => onCampo("estadocivil_postulante_otro", v)}
        />

        <CampoVeNumero
          id="cedula_postulante_otro"
          etiqueta="Cédula de identidad del postulante"
          ayuda="Coloca el número de la cédula de identidad que aparece en el documento presentado"
          prefijoKey={KEY_PREFIJO_CEDULA_OTRO}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_OTRO] ?? "V")}
          digitos={String(valores.cedula_postulante_otro ?? "")}
          error={errores.cedula_postulante_otro}
          onCampo={onCampo}
          maxLength={8}
        />

        <CampoTexto
          id="inpreabogado_postulante_otro"
          etiqueta="Número del INPREABOGADO del postulante"
          ayuda="Coloca el número del INPREABOGADO que aparece en el documento presentado"
          value={String(valores.inpreabogado_postulante_otro ?? "")}
          error={errores.inpreabogado_postulante_otro}
          inputMode="numeric"
          maxLength={20}
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("inpreabogado_postulante_otro", v.replace(/\D/g, "").slice(0, 20))
          }
        />

        <div>
          <label
            htmlFor="descripcion_documento_otro"
            className="block text-xs font-medium text-toga-600"
          >
            Descripción del documento
          </label>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Agregue un resumen descriptivo del contenido del documento y cuál es su fin.
          </p>
          <textarea
            id="descripcion_documento_otro"
            rows={4}
            value={String(valores.descripcion_documento_otro ?? "")}
            onChange={(e) => onCampo("descripcion_documento_otro", e.target.value)}
            className={`${CAMPO}${errores.descripcion_documento_otro ? " campo-con-error" : ""}`}
            aria-invalid={Boolean(errores.descripcion_documento_otro)}
            autoComplete="off"
          />
          {errores.descripcion_documento_otro && (
            <p className="mensaje-error-campo">{errores.descripcion_documento_otro}</p>
          )}
        </div>

        <CampoTexto
          id="tipo_sugerido_otro"
          etiqueta="Tipo de documento sugerido"
          ayuda="La IA propone de qué recaudo se trata. Confirme o corrija el texto."
          value={String(valores.tipo_sugerido_otro ?? "")}
          error={errores.tipo_sugerido_otro}
          onChange={(v) => onCampo("tipo_sugerido_otro", v)}
        />

        <div>
          <label
            htmlFor="resumen_documento_otro"
            className="block text-xs font-medium text-toga-600"
          >
            Resumen del documento
          </label>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Resumen que propone la extracción. Revíselo contra el original.
          </p>
          <textarea
            id="resumen_documento_otro"
            rows={4}
            value={String(valores.resumen_documento_otro ?? "")}
            onChange={(e) => onCampo("resumen_documento_otro", e.target.value)}
            className={`${CAMPO}${errores.resumen_documento_otro ? " campo-con-error" : ""}`}
            aria-invalid={Boolean(errores.resumen_documento_otro)}
            autoComplete="off"
          />
          {errores.resumen_documento_otro && (
            <p className="mensaje-error-campo">{errores.resumen_documento_otro}</p>
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

function CampoVeNumero({
  id,
  etiqueta,
  ayuda,
  prefijoKey,
  prefijo,
  digitos,
  error,
  onCampo,
  maxLength,
}: {
  readonly id: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly prefijoKey: string;
  readonly prefijo: string;
  readonly digitos: string;
  readonly error?: string;
  readonly onCampo: (key: string, value: string | boolean | null) => void;
  readonly maxLength: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-toga-600">
        {etiqueta}
      </label>
      <p className="mt-0.5 text-[0.7rem] text-toga-400">{ayuda}</p>
      <div className="mt-1 flex w-fit max-w-full gap-2">
        <Select value={prefijo === "E" ? "E" : "V"} onValueChange={(v) => onCampo(prefijoKey, v)}>
          <SelectTrigger
            className={`w-16 shrink-0${error ? " campo-con-error" : ""}`}
            aria-label="Prefijo V o E"
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
          maxLength={maxLength}
          value={digitos}
          onChange={(e) => onCampo(id, e.target.value.replace(/\D/g, "").slice(0, maxLength))}
          className={`${CAMPO} !mt-0 !w-36 codigo${error ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(error)}
          autoComplete="off"
        />
      </div>
      {error && <p className="mensaje-error-campo">{error}</p>}
    </div>
  );
}
