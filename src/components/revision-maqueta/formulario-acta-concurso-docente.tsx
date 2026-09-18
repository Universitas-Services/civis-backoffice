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
  KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioActaConcursoDocente({
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
          Copia de las actas de concurso público de oposición docente
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento constata el veredicto formal o resolución de
          nombramiento que acredite el ingreso o ascenso en la carrera docente
          del postulante mediante concurso público de oposición en materia
          jurídica. Todos los campos son opcionales: si no se pueden leer,
          déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la universidad emisora
        </p>

        <CampoTexto
          id="nombre_universidad_concursodocente"
          etiqueta="Nombre completo de la casa de estudios superiores"
          ayuda="Ejemplo: Universidad Central de Venezuela"
          value={String(valores.nombre_universidad_concursodocente ?? "")}
          error={errores.nombre_universidad_concursodocente}
          onChange={(v) => onCampo("nombre_universidad_concursodocente", v)}
        />

        <CampoTexto
          id="facultad_concursodocente"
          etiqueta="Nombre de la facultad a la que pertenece"
          ayuda="Ejemplo: Facultad de Ciencias Políticas"
          value={String(valores.facultad_concursodocente ?? "")}
          error={errores.facultad_concursodocente}
          onChange={(v) => onCampo("facultad_concursodocente", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Datos y veredicto del concurso de oposición
        </p>

        <CampoTexto
          id="catedra_concursodocente"
          etiqueta="Cátedra o área del concurso"
          ayuda="Ejemplo: Asignatura sometida a concurso de oposición de méritos y pruebas."
          value={String(valores.catedra_concursodocente ?? "")}
          error={errores.catedra_concursodocente}
          onChange={(v) => onCampo("catedra_concursodocente", v)}
        />

        <CampoTexto
          id="numero_acta_concursodocente"
          etiqueta="Número del acta de jurado / resolución"
          ayuda="Identificador único del acto administrativo emanado del Jurado Examinador o aprobado por el Consejo Universitario."
          value={String(valores.numero_acta_concursodocente ?? "")}
          error={errores.numero_acta_concursodocente}
          classNameExtra="codigo"
          onChange={(v) => onCampo("numero_acta_concursodocente", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha del acta o resolución del concurso
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha (día, mes y año) en la que fue emitida el acta o resolución
            final del concurso.
          </p>
          <DatePicker
            id="fecha_acta_concursodocente"
            value={String(valores.fecha_acta_concursodocente ?? "")}
            onChange={(iso) => onCampo("fecha_acta_concursodocente", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_acta_concursodocente)}
          />
          {errores.fecha_acta_concursodocente && (
            <p className="mensaje-error-campo">{errores.fecha_acta_concursodocente}</p>
          )}
        </div>

        <CampoTexto
          id="veredicto_concursodocente"
          etiqueta="Veredicto / resultado del concurso"
          ayuda="Dictamen explícito (Aprobado con Mención Honorífica, Ganador del Concurso de Oposición, u Orden de Mérito 1er Lugar)"
          value={String(valores.veredicto_concursodocente ?? "")}
          error={errores.veredicto_concursodocente}
          onChange={(v) => onCampo("veredicto_concursodocente", v)}
        />

        <CampoTexto
          id="categoria_otorgada_concursodocente"
          etiqueta="Categoría docente otorgada / ascendida"
          ayuda="Escalafón acreditado mediante el concurso de oposición (Ejemplo: Ingreso a la Categoría de Instructor por Concurso o Ascenso a Categoría Asociado/Titular)."
          value={String(valores.categoria_otorgada_concursodocente ?? "")}
          error={errores.categoria_otorgada_concursodocente}
          onChange={(v) => onCampo("categoria_otorgada_concursodocente", v)}
        />

        <CampoArea
          id="jurado_examinador_concursodocente"
          etiqueta="Nombres de los integrantes del jurado examinador"
          ayuda="Nombres, apellidos de los jurados que evaluaron las pruebas."
          value={String(valores.jurado_examinador_concursodocente ?? "")}
          error={errores.jurado_examinador_concursodocente}
          onChange={(v) => onCampo("jurado_examinador_concursodocente", v)}
        />

        <CampoTexto
          id="nombre_postulante_concursodocente"
          etiqueta="Nombre completo del concursante"
          ayuda="Coloca el nombre de quien hace el concurso"
          value={String(valores.nombre_postulante_concursodocente ?? "")}
          error={errores.nombre_postulante_concursodocente}
          onChange={(v) => onCampo("nombre_postulante_concursodocente", v)}
        />

        <CampoTexto
          id="apellido_postulante_concursodocente"
          etiqueta="Apellido completo del concursante"
          ayuda="Coloca el apellido de quien hace el concurso"
          value={String(valores.apellido_postulante_concursodocente ?? "")}
          error={errores.apellido_postulante_concursodocente}
          onChange={(v) => onCampo("apellido_postulante_concursodocente", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_concursodocente"
          etiqueta="Número de cédula de identidad del concursante"
          ayuda="Coloca el número de cédula de quien hace el concurso"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE] ?? "V",
          )}
          digitos={String(valores.cedula_postulante_concursodocente ?? "")}
          error={errores.cedula_postulante_concursodocente}
          onCampo={onCampo}
        />
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
