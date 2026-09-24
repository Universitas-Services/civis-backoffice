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
  KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioDjNoContratacion({
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
          Declaración jurada de no contratación con el estado y conflictos de
          interés
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento constata que el postulante no es propietario, socio,
          accionista ni representante legal de personas jurídicas que mantengan
          contratos vigentes de obras, bienes o prestación de servicios con
          entes u órganos de la administración pública nacional, estadal o
          municipal. Todos los campos son opcionales: si no se pueden leer,
          déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos del postulante presentes en la declaración jurada
        </p>

        <CampoTexto
          id="nombre_declarante_nocontratacion"
          etiqueta="Nombre completo del declarante"
          ayuda="Coloca el nombre del declarante que aparece en el documento"
          value={String(valores.nombre_declarante_nocontratacion ?? "")}
          error={errores.nombre_declarante_nocontratacion}
          onChange={(v) => onCampo("nombre_declarante_nocontratacion", v)}
        />

        <CampoTexto
          id="apellido_declarante_nocontratacion"
          etiqueta="Apellido completo del declarante"
          ayuda="Coloca el apellido del declarante que aparece en el documento"
          value={String(valores.apellido_declarante_nocontratacion ?? "")}
          error={errores.apellido_declarante_nocontratacion}
          onChange={(v) => onCampo("apellido_declarante_nocontratacion", v)}
        />

        <CampoTexto
          id="estadocivil_declarante_nocontratacion"
          etiqueta="Estado civil"
          ayuda="Coloca el estado civil que aparece en el documento presentado"
          value={String(valores.estadocivil_declarante_nocontratacion ?? "")}
          error={errores.estadocivil_declarante_nocontratacion}
          onChange={(v) => onCampo("estadocivil_declarante_nocontratacion", v)}
        />

        <CampoCedulaVe
          id="cedula_declarante_nocontratacion"
          etiqueta="Cédula de identidad declarante"
          ayuda="Coloca el número de la cédula de identidad que aparece en el documento presentado"
          prefijoKey={KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION] ?? "V",
          )}
          digitos={String(valores.cedula_declarante_nocontratacion ?? "")}
          error={errores.cedula_declarante_nocontratacion}
          onCampo={onCampo}
        />

        <CampoArea
          id="declaracion_inexistentecontratos_nocontratacion"
          etiqueta="Declaración de inexistencia de contratos públicos (Art. 145 CRBV y Art. 37.7 LOTSJ)"
          ayuda="Fe de no ser propietario/a, socio/a, accionista ni representante legal de sociedades mercantiles o firmas de consultoría con contratos de obras, bienes o servicios vigentes con la administración pública nacional, estadal o municipal"
          value={String(
            valores.declaracion_inexistentecontratos_nocontratacion ?? "",
          )}
          error={errores.declaracion_inexistentecontratos_nocontratacion}
          onChange={(v) =>
            onCampo("declaracion_inexistentecontratos_nocontratacion", v)
          }
        />

        <CampoArea
          id="declaracion_nolitigio_nocontratacion"
          etiqueta="Declaración de no litigio contra la República"
          ayuda="Manifestación de no ejercer representación judicial activa en causas lucrativas privadas contra entes del Estado"
          value={String(valores.declaracion_nolitigio_nocontratacion ?? "")}
          error={errores.declaracion_nolitigio_nocontratacion}
          onChange={(v) => onCampo("declaracion_nolitigio_nocontratacion", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Datos de la autenticación notarial
        </p>

        <CampoTexto
          id="estado_notaria_nocontratacion"
          etiqueta="Estado"
          ayuda="Estado de la notaría"
          value={String(valores.estado_notaria_nocontratacion ?? "")}
          error={errores.estado_notaria_nocontratacion}
          onChange={(v) => onCampo("estado_notaria_nocontratacion", v)}
        />

        <CampoTexto
          id="municipio_notaria_nocontratacion"
          etiqueta="Municipio"
          ayuda="Municipio de la notaría"
          value={String(valores.municipio_notaria_nocontratacion ?? "")}
          error={errores.municipio_notaria_nocontratacion}
          onChange={(v) => onCampo("municipio_notaria_nocontratacion", v)}
        />

        <CampoTexto
          id="nombre_notaria_nocontratacion"
          etiqueta="Nombre de la notaría correspondiente"
          ayuda="Coloca el nombre de la Notaría que corresponde al asentamiento de la presente declaración."
          value={String(valores.nombre_notaria_nocontratacion ?? "")}
          error={errores.nombre_notaria_nocontratacion}
          onChange={(v) => onCampo("nombre_notaria_nocontratacion", v)}
        />

        <CampoTexto
          id="numero_folio_nocontratacion"
          etiqueta="Número de folio"
          ayuda="Coloca el número del folio corresponde"
          value={String(valores.numero_folio_nocontratacion ?? "")}
          error={errores.numero_folio_nocontratacion}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("numero_folio_nocontratacion", v.replace(/\D/g, ""))
          }
        />

        <CampoTexto
          id="numero_tomo_nocontratacion"
          etiqueta="Número de tomo"
          ayuda="Coloca el número del tomo"
          value={String(valores.numero_tomo_nocontratacion ?? "")}
          error={errores.numero_tomo_nocontratacion}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("numero_tomo_nocontratacion", v.replace(/\D/g, ""))
          }
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de otorgamiento
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Coloca la fecha de la protocolización de la declaración
          </p>
          <DatePicker
            id="fecha_otorgamiento_nocontratacion"
            value={String(valores.fecha_otorgamiento_nocontratacion ?? "")}
            onChange={(iso) => onCampo("fecha_otorgamiento_nocontratacion", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_otorgamiento_nocontratacion)}
          />
          {errores.fecha_otorgamiento_nocontratacion && (
            <p className="mensaje-error-campo">
              {errores.fecha_otorgamiento_nocontratacion}
            </p>
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
