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
  KEY_PREFIJO_CEDULA_DECLARANTE_OTRA,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioDjOtraNacionalidad({
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
          Datos de la Declaración jurada de NO poseer otra Nacionalidad
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento es una pieza jurídica clave para dar cumplimiento
          estricto al artículo 41 y al artículo 263, numeral 1, de la Constitución
          (CRBV), los cuales exigen taxativamente que para ser Magistrado o
          Magistrada del Tribunal Supremo de Justicia se debe ser venezolano/a
          por nacimiento y no poseer otra nacionalidad. Todos los campos son
          opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos del postulante presentes en la Declaración Jurada
        </p>

        <CampoTexto
          id="nombre_declarante_otranacionalidad"
          etiqueta="Nombre completo del declarante"
          ayuda="Coloca el nombre del declarante que aparece en el documento"
          value={String(valores.nombre_declarante_otranacionalidad ?? "")}
          error={errores.nombre_declarante_otranacionalidad}
          onChange={(v) => onCampo("nombre_declarante_otranacionalidad", v)}
        />

        <CampoTexto
          id="apellido_declarante_otranacionalidad"
          etiqueta="Apellido completo del declarante"
          ayuda="Coloca el apellido del declarante que aparece en el documento"
          value={String(valores.apellido_declarante_otranacionalidad ?? "")}
          error={errores.apellido_declarante_otranacionalidad}
          onChange={(v) => onCampo("apellido_declarante_otranacionalidad", v)}
        />

        <CampoTexto
          id="estadocivil_declarante_otranacionalidad"
          etiqueta="Estado civil"
          ayuda="Coloca el estado civil que aparece en el documento presentado"
          value={String(valores.estadocivil_declarante_otranacionalidad ?? "")}
          error={errores.estadocivil_declarante_otranacionalidad}
          onChange={(v) => onCampo("estadocivil_declarante_otranacionalidad", v)}
        />

        <CampoCedulaVe
          id="cedula_declarante_otranacionalidad"
          etiqueta="Cédula de identidad declarante"
          ayuda="Coloca el número de la cédula de identidad que aparece en el documento presentado"
          prefijoKey={KEY_PREFIJO_CEDULA_DECLARANTE_OTRA}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_DECLARANTE_OTRA] ?? "V")}
          digitos={String(valores.cedula_declarante_otranacionalidad ?? "")}
          error={errores.cedula_declarante_otranacionalidad}
          onCampo={onCampo}
        />

        <CampoArea
          id="noposee_declaracion"
          etiqueta="Manifestación expresa bajo Fe de Juramento"
          ayuda="Texto en el que el aspirante declara de manera categórica que ostenta única y exclusivamente la nacionalidad venezolana por nacimiento y que no posee, no ha solicitado, ni ha optado a ninguna otra nacionalidad"
          value={String(valores.noposee_declaracion ?? "")}
          error={errores.noposee_declaracion}
          onChange={(v) => onCampo("noposee_declaracion", v)}
        />

        <CampoArea
          id="renuncia_otranacionalidad"
          etiqueta="Aclaratoria sobre renuncia (si aplica por filiación)"
          ayuda="Si el postulante es hijo/a de padre o madre extranjeros (ius sanguinis), el documento debe certificar la inexistencia de registro extranjero o incluir la manifestación expresa de renuncia formal a la segunda nacionalidad"
          value={String(valores.renuncia_otranacionalidad ?? "")}
          error={errores.renuncia_otranacionalidad}
          onChange={(v) => onCampo("renuncia_otranacionalidad", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Datos de la autenticación notarial
        </p>

        <CampoTexto
          id="estado_otranacionalidad"
          etiqueta="Estado"
          ayuda="Estado donde se otorgó la declaración"
          value={String(valores.estado_otranacionalidad ?? "")}
          error={errores.estado_otranacionalidad}
          onChange={(v) => onCampo("estado_otranacionalidad", v)}
        />

        <CampoTexto
          id="municipio_otranacionalidad"
          etiqueta="Municipio"
          ayuda="Municipio correspondiente a la autenticación notarial"
          value={String(valores.municipio_otranacionalidad ?? "")}
          error={errores.municipio_otranacionalidad}
          onChange={(v) => onCampo("municipio_otranacionalidad", v)}
        />

        <CampoTexto
          id="nombrenotaria_otranacionalidad"
          etiqueta="Nombre de la Notaría correspondiente"
          ayuda="Coloca el nombre de la Notaría que corresponde al asentamiento de la presente declaración."
          value={String(valores.nombrenotaria_otranacionalidad ?? "")}
          error={errores.nombrenotaria_otranacionalidad}
          onChange={(v) => onCampo("nombrenotaria_otranacionalidad", v)}
        />

        <CampoTexto
          id="numerofolio_otranacionalidad"
          etiqueta="Número de folio"
          ayuda="Coloca el número del folio corresponde"
          value={String(valores.numerofolio_otranacionalidad ?? "")}
          error={errores.numerofolio_otranacionalidad}
          inputMode="numeric"
          onChange={(v) => onCampo("numerofolio_otranacionalidad", v.replace(/\D/g, ""))}
        />

        <CampoTexto
          id="numerotomo_otranacionalidad"
          etiqueta="Número de Tomo"
          ayuda="Coloca el número del tomo"
          value={String(valores.numerotomo_otranacionalidad ?? "")}
          error={errores.numerotomo_otranacionalidad}
          inputMode="numeric"
          onChange={(v) => onCampo("numerotomo_otranacionalidad", v.replace(/\D/g, ""))}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de otorgamiento
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha de la protocolización de la declaración
          </p>
          <DatePicker
            id="fechaotorgamiento_otranacionalidad"
            value={String(valores.fechaotorgamiento_otranacionalidad ?? "")}
            onChange={(iso) => onCampo("fechaotorgamiento_otranacionalidad", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fechaotorgamiento_otranacionalidad)}
          />
          {errores.fechaotorgamiento_otranacionalidad && (
            <p className="mensaje-error-campo">{errores.fechaotorgamiento_otranacionalidad}</p>
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
}: {
  readonly id: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly value: string;
  readonly error?: string;
  readonly onChange: (v: string) => void;
  readonly inputMode?: "numeric" | "text";
  readonly maxLength?: number;
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
        className={`${CAMPO}${error ? " campo-con-error" : ""}`}
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
