"use client";

import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  KEY_PREFIJO_CEDULA_MADRE,
  KEY_PREFIJO_CEDULA_PADRE,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioPartidaNacimiento({
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
          Datos de partida de nacimiento
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          La partida de nacimiento es el único instrumento público auténtico para
          demostrar fehacientemente el lugar de nacimiento y la filiación
          originaria. Todos los campos son opcionales: si no se pueden leer,
          déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos del postulante presentes en la partida de nacimiento
        </p>

        <CampoTexto
          id="nombre_partida_postulante"
          etiqueta="Nombre completo del postulante"
          ayuda="Coloca el nombre registral exacto e inalterable del postulante presentes en la partida de nacimiento"
          value={String(valores.nombre_partida_postulante ?? "")}
          error={errores.nombre_partida_postulante}
          onChange={(v) => onCampo("nombre_partida_postulante", v)}
        />

        <CampoTexto
          id="apellido_partida_postulante"
          etiqueta="Apellido completo del postulante"
          ayuda="Coloca el apellido registral exacto e inalterable del postulante presentes en la partida de nacimiento"
          value={String(valores.apellido_partida_postulante ?? "")}
          error={errores.apellido_partida_postulante}
          onChange={(v) => onCampo("apellido_partida_postulante", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de nacimiento</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Permite calcular la edad exacta en días/años al momento de la
            postulación para auditar su capacidad civil y validar los cómputos de
            antigüedad profesional
          </p>
          <DatePicker
            id="fechanacimiento_partida_postulante"
            value={String(valores.fechanacimiento_partida_postulante ?? "")}
            onChange={(iso) => onCampo("fechanacimiento_partida_postulante", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fechanacimiento_partida_postulante)}
          />
          {errores.fechanacimiento_partida_postulante && (
            <p className="mensaje-error-campo">{errores.fechanacimiento_partida_postulante}</p>
          )}
        </div>

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identidad y nacionalidad padres
        </p>
        <p className="text-[0.7rem] text-toga-500">
          Datos clave para comprobar la nacionalidad por filiación (jus sanguinis,
          Art. 32.2 y 32.3 de la CRBV)
        </p>

        <CampoTexto
          id="nombrepadre_partida_postulante"
          etiqueta="Nombre completo del padre"
          ayuda="Coloca el nombre completo del padre que aparece en la partida de nacimiento"
          value={String(valores.nombrepadre_partida_postulante ?? "")}
          error={errores.nombrepadre_partida_postulante}
          onChange={(v) => onCampo("nombrepadre_partida_postulante", v)}
        />

        <CampoTexto
          id="nacionalidadpadre_partida_postulante"
          etiqueta="Nacionalidad del padre"
          ayuda="Coloca la nacionalidad del padre que aparece en la partida de nacimiento"
          value={String(valores.nacionalidadpadre_partida_postulante ?? "")}
          error={errores.nacionalidadpadre_partida_postulante}
          onChange={(v) => onCampo("nacionalidadpadre_partida_postulante", v)}
        />

        <CampoCedulaVe
          id="cedulapadre_partida_postulante"
          etiqueta="Número de cédula de identidad del padre"
          ayuda="Coloca el número de cédula del padre que aparece en la partida de nacimiento"
          prefijoKey={KEY_PREFIJO_CEDULA_PADRE}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_PADRE] ?? "V")}
          digitos={String(valores.cedulapadre_partida_postulante ?? "")}
          error={errores.cedulapadre_partida_postulante}
          onCampo={onCampo}
        />

        <CampoTexto
          id="nombremadre_partida_postulante"
          etiqueta="Nombre completo de la madre"
          ayuda="Coloca el nombre completo de la madre que aparece en la partida de nacimiento"
          value={String(valores.nombremadre_partida_postulante ?? "")}
          error={errores.nombremadre_partida_postulante}
          onChange={(v) => onCampo("nombremadre_partida_postulante", v)}
        />

        <CampoTexto
          id="nacionalidadmadre_partida_postulante"
          etiqueta="Nacionalidad de la madre"
          ayuda="Coloca la nacionalidad de la madre que aparece en la partida de nacimiento"
          value={String(valores.nacionalidadmadre_partida_postulante ?? "")}
          error={errores.nacionalidadmadre_partida_postulante}
          onChange={(v) => onCampo("nacionalidadmadre_partida_postulante", v)}
        />

        <CampoCedulaVe
          id="cedulamadre_partida_postulante"
          etiqueta="Número de cédula de identidad de la madre"
          ayuda="Coloca el número de cédula de la madre que aparece en la partida de nacimiento"
          prefijoKey={KEY_PREFIJO_CEDULA_MADRE}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_MADRE] ?? "V")}
          digitos={String(valores.cedulamadre_partida_postulante ?? "")}
          error={errores.cedulamadre_partida_postulante}
          onCampo={onCampo}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Datos del acta de nacimiento del postulante
        </p>

        <CampoTexto
          id="nombrejefatura_partida_postulante"
          etiqueta="Nombre de la Jefatura/Registro Civil correspondiente"
          ayuda="Coloca el nombre del Registro Civil al que corresponde el asentamiento de la presente acta."
          value={String(valores.nombrejefatura_partida_postulante ?? "")}
          error={errores.nombrejefatura_partida_postulante}
          onChange={(v) => onCampo("nombrejefatura_partida_postulante", v)}
        />

        <CampoTexto
          id="numeroacta_partida_postulante"
          etiqueta="Número de Acta"
          ayuda="Coloca el número de acto corresponde"
          value={String(valores.numeroacta_partida_postulante ?? "")}
          error={errores.numeroacta_partida_postulante}
          inputMode="numeric"
          onChange={(v) => onCampo("numeroacta_partida_postulante", v.replace(/\D/g, ""))}
        />

        <CampoTexto
          id="tomo_partida_postulante"
          etiqueta="Tomo/Folio"
          ayuda="Coloca el número del tomo"
          value={String(valores.tomo_partida_postulante ?? "")}
          error={errores.tomo_partida_postulante}
          inputMode="numeric"
          onChange={(v) => onCampo("tomo_partida_postulante", v.replace(/\D/g, ""))}
        />

        <CampoTexto
          id="año_partida_postulante"
          etiqueta="Año"
          ayuda="Coloca el año del registro del acta"
          value={String(valores.año_partida_postulante ?? "")}
          error={errores.año_partida_postulante}
          inputMode="numeric"
          maxLength={4}
          onChange={(v) => onCampo("año_partida_postulante", v.replace(/\D/g, "").slice(0, 4))}
        />
      </fieldset>

      <div
        role="note"
        className="flex gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-950"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p>
          Si en el acta consta que el padre o la madre es de nacionalidad
          extranjera (ej. colombiana, española, italiana, etc.), la normativa
          constitucional (jus sanguinis) abre la posibilidad de que el
          postulante ostente o haya tenido opción a una segunda nacionalidad.
          Verificar el contenido de la declaración jurada{" "}
          <span className="font-semibold">NO poseer otra nacionalidad</span>.
        </p>
      </div>
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
