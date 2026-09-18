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
  KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO,
  KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioActaMatrimonio({
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
          Copia certificada de acta de matrimonio si posee
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          El acta de matrimonio o constancia de unión estable de hecho del
          postulante debidamente inscrita en el registro civil correspondiente.
          Todos los campos son opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">Datos registrales</p>

        <CampoTexto
          id="nombrejefatura_matrimonio_postulante"
          etiqueta="Nombre de la jefatura/registro civil correspondiente"
          ayuda="Coloca el nombre del Registro Civil al que corresponde el asentamiento de la presente acta."
          value={String(valores.nombrejefatura_matrimonio_postulante ?? "")}
          error={errores.nombrejefatura_matrimonio_postulante}
          onChange={(v) => onCampo("nombrejefatura_matrimonio_postulante", v)}
        />

        <CampoTexto
          id="numeroacta_matrimonio_postulante"
          etiqueta="Número de acta"
          ayuda="Coloca el número de acto corresponde"
          value={String(valores.numeroacta_matrimonio_postulante ?? "")}
          error={errores.numeroacta_matrimonio_postulante}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("numeroacta_matrimonio_postulante", v.replace(/\D/g, ""))
          }
        />

        <CampoTexto
          id="folio_matrimonio_postulante"
          etiqueta="Folio"
          ayuda="Coloca el número del folio"
          value={String(valores.folio_matrimonio_postulante ?? "")}
          error={errores.folio_matrimonio_postulante}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("folio_matrimonio_postulante", v.replace(/\D/g, ""))
          }
        />

        <CampoTexto
          id="tomo_matrimonio_postulante"
          etiqueta="Tomo"
          ayuda="Coloca el número del tomo"
          value={String(valores.tomo_matrimonio_postulante ?? "")}
          error={errores.tomo_matrimonio_postulante}
          inputMode="numeric"
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo("tomo_matrimonio_postulante", v.replace(/\D/g, ""))
          }
        />

        <CampoTexto
          id="anio_matrimonio_postulante"
          etiqueta="Año"
          ayuda="Coloca el año del registro del acta"
          value={String(valores.anio_matrimonio_postulante ?? "")}
          error={errores.anio_matrimonio_postulante}
          inputMode="numeric"
          maxLength={4}
          classNameExtra="codigo"
          onChange={(v) =>
            onCampo(
              "anio_matrimonio_postulante",
              v.replace(/\D/g, "").slice(0, 4),
            )
          }
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación de los cónyuges o convivientes
        </p>

        <CampoTexto
          id="nombre_conyugematrimonio_postulante"
          etiqueta="Nombre completo del contrayente o cónyuge"
          ayuda="Coloca el nombre registral exacto e inalterable del cónyuge o contrayente que aparece en el acta de matrimonio. Ejemplo: Carlos Andrés"
          value={String(valores.nombre_conyugematrimonio_postulante ?? "")}
          error={errores.nombre_conyugematrimonio_postulante}
          onChange={(v) => onCampo("nombre_conyugematrimonio_postulante", v)}
        />

        <CampoTexto
          id="apellido_conyugematrimonio_postulante"
          etiqueta="Apellido completo del contrayente o cónyuge"
          ayuda="Coloca el apellido registral exacto e inalterable del cónyuge o contrayente que aparece en el acta de matrimonio. Ejemplo: Pérez Sosa"
          value={String(valores.apellido_conyugematrimonio_postulante ?? "")}
          error={errores.apellido_conyugematrimonio_postulante}
          onChange={(v) => onCampo("apellido_conyugematrimonio_postulante", v)}
        />

        <CampoCedulaVe
          id="cedula_conyugematrimonio_postulante"
          etiqueta="Número de cédula del contrayente o cónyuge"
          ayuda="Coloca el número de cédula exacto e inalterable del cónyuge o contrayente que aparece en el acta de matrimonio"
          prefijoKey={KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO] ?? "V")}
          digitos={String(valores.cedula_conyugematrimonio_postulante ?? "")}
          error={errores.cedula_conyugematrimonio_postulante}
          onCampo={onCampo}
        />

        <CampoTexto
          id="nombre_segundoconyuge_postulante"
          etiqueta="Nombre completo de la contrayente o cónyuge"
          ayuda="Coloca el nombre registral exacto e inalterable de la cónyuge o contrayente que aparece en el acta de matrimonio. Ejemplo: Ada Valentina"
          value={String(valores.nombre_segundoconyuge_postulante ?? "")}
          error={errores.nombre_segundoconyuge_postulante}
          onChange={(v) => onCampo("nombre_segundoconyuge_postulante", v)}
        />

        <CampoTexto
          id="apellido_segundoconyuge_postulante"
          etiqueta="Apellido completo de la contrayente o cónyuge"
          ayuda="Coloca el apellido registral exacto e inalterable de la cónyuge o contrayente que aparece en el acta de matrimonio. Ejemplo: Campos Martínez"
          value={String(valores.apellido_segundoconyuge_postulante ?? "")}
          error={errores.apellido_segundoconyuge_postulante}
          onChange={(v) => onCampo("apellido_segundoconyuge_postulante", v)}
        />

        <CampoCedulaVe
          id="cedula_segundoconyuge_postulante"
          etiqueta="Número de cédula de la contrayente o cónyuge"
          ayuda="Coloca el número de cédula exacto e inalterable de la cónyuge o contrayente que aparece en el acta de matrimonio"
          prefijoKey={KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO] ?? "V",
          )}
          digitos={String(valores.cedula_segundoconyuge_postulante ?? "")}
          error={errores.cedula_segundoconyuge_postulante}
          onCampo={onCampo}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de celebración / registro
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha exacta de inscripción formal de la unión conyugal o estable de
            hecho.
          </p>
          <DatePicker
            id="fecha_celebracionmatrimonio_postulante"
            value={String(valores.fecha_celebracionmatrimonio_postulante ?? "")}
            onChange={(iso) =>
              onCampo("fecha_celebracionmatrimonio_postulante", iso)
            }
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_celebracionmatrimonio_postulante)}
          />
          {errores.fecha_celebracionmatrimonio_postulante && (
            <p className="mensaje-error-campo">
              {errores.fecha_celebracionmatrimonio_postulante}
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
