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
  KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioDjNoMilitancia({
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
          Declaración jurada de no militancia político partidista
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento constata la renuncia formal en la que el postulante
          afirme bajo fe de juramento no ejercer activismo político partidista,
          proselitismo ni cargos de dirección o representación con fines
          políticos. Todos los campos son opcionales: si no se pueden leer,
          déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos del postulante presentes en la declaración jurada
        </p>

        <CampoTexto
          id="nombre_declarante_nomilitancia"
          etiqueta="Nombre completo del declarante"
          ayuda="Coloca el nombre del declarante que aparece en el documento"
          value={String(valores.nombre_declarante_nomilitancia ?? "")}
          error={errores.nombre_declarante_nomilitancia}
          onChange={(v) => onCampo("nombre_declarante_nomilitancia", v)}
        />

        <CampoTexto
          id="apellido_declarante_nomilitancia"
          etiqueta="Apellido completo del declarante"
          ayuda="Coloca el apellido del declarante que aparece en el documento"
          value={String(valores.apellido_declarante_nomilitancia ?? "")}
          error={errores.apellido_declarante_nomilitancia}
          onChange={(v) => onCampo("apellido_declarante_nomilitancia", v)}
        />

        <CampoTexto
          id="estadocivil_declarante_nomilitancia"
          etiqueta="Estado civil"
          ayuda="Coloca el estado civil que aparece en el documento presentado"
          value={String(valores.estadocivil_declarante_nomilitancia ?? "")}
          error={errores.estadocivil_declarante_nomilitancia}
          onChange={(v) => onCampo("estadocivil_declarante_nomilitancia", v)}
        />

        <CampoCedulaVe
          id="cedula_declarante_nomilitancia"
          etiqueta="Cédula de identidad declarante"
          ayuda="Coloca el número de la cédula de identidad que aparece en el documento presentado"
          prefijoKey={KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA] ?? "V",
          )}
          digitos={String(valores.cedula_declarante_nomilitancia ?? "")}
          error={errores.cedula_declarante_nomilitancia}
          onCampo={onCampo}
        />

        <CampoArea
          id="manifestacion_nomilitancia"
          etiqueta="Manifestación expresa bajo fe de juramento"
          ayuda="Declaración categórica de no ejercer activismo político, no pertenecer a directivas de partidos políticos ni realizar actos de proselitismo"
          value={String(valores.manifestacion_nomilitancia ?? "")}
          error={errores.manifestacion_nomilitancia}
          onChange={(v) => onCampo("manifestacion_nomilitancia", v)}
        />

        <CampoArea
          id="aclaratoria_renuncia_nomilitancia"
          etiqueta="Aclaratoria sobre renuncia (si aplica)"
          ayuda="En caso de haber militado en el pasado, fecha exacta y constancia de la renuncia formal presentada ante la organización política o el CNE"
          value={String(valores.aclaratoria_renuncia_nomilitancia ?? "")}
          error={errores.aclaratoria_renuncia_nomilitancia}
          onChange={(v) => onCampo("aclaratoria_renuncia_nomilitancia", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Datos de la autenticación notarial
        </p>

        <CampoTexto
          id="estado_notaria_nomilitancia"
          etiqueta="Estado"
          ayuda="Estado de la notaría"
          value={String(valores.estado_notaria_nomilitancia ?? "")}
          error={errores.estado_notaria_nomilitancia}
          onChange={(v) => onCampo("estado_notaria_nomilitancia", v)}
        />

        <CampoTexto
          id="municipio_notaria_nomilitancia"
          etiqueta="Municipio"
          ayuda="Municipio de la notaría"
          value={String(valores.municipio_notaria_nomilitancia ?? "")}
          error={errores.municipio_notaria_nomilitancia}
          onChange={(v) => onCampo("municipio_notaria_nomilitancia", v)}
        />

        <CampoTexto
          id="nombre_notaria_nomilitancia"
          etiqueta="Nombre de la notaría correspondiente"
          ayuda="Coloca el nombre de la Notaría que corresponde al asentamiento de la presente declaración."
          value={String(valores.nombre_notaria_nomilitancia ?? "")}
          error={errores.nombre_notaria_nomilitancia}
          onChange={(v) => onCampo("nombre_notaria_nomilitancia", v)}
        />

        <CampoTexto
          id="numero_folio_nomilitancia"
          etiqueta="Número de folio"
          ayuda="Coloca el número del folio corresponde"
          value={String(valores.numero_folio_nomilitancia ?? "")}
          error={errores.numero_folio_nomilitancia}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("numero_folio_nomilitancia", v.replace(/\D/g, ""))
          }
        />

        <CampoTexto
          id="numero_tomo_nomilitancia"
          etiqueta="Número de tomo"
          ayuda="Coloca el número del tomo"
          value={String(valores.numero_tomo_nomilitancia ?? "")}
          error={errores.numero_tomo_nomilitancia}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("numero_tomo_nomilitancia", v.replace(/\D/g, ""))
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
            id="fecha_otorgamiento_nomilitancia"
            value={String(valores.fecha_otorgamiento_nomilitancia ?? "")}
            onChange={(iso) => onCampo("fecha_otorgamiento_nomilitancia", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_otorgamiento_nomilitancia)}
          />
          {errores.fecha_otorgamiento_nomilitancia && (
            <p className="mensaje-error-campo">
              {errores.fecha_otorgamiento_nomilitancia}
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
