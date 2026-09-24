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
  KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioCarreraJudicial({
  valores,
  errores = {},
  onCampo,
}: {
  readonly valores: Readonly<ValoresFormularioRevision>;
  readonly errores?: Readonly<ErroresFormularioRevision>;
  readonly onCampo: (key: string, value: string | boolean | null) => void;
}) {
  const juezSuperior = String(valores.es_juez_superior_carrerajudicial ?? "");

  return (
    <div className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-toga-900">
          Certificación formal de carrera judicial expedida por la Dirección
          Ejecutiva de la Magistratura (DEM)
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento constata fehacientemente una trayectoria no menor a
          quince años en el ejercicio de la carrera judicial del postulante,
          especificando tribunales de adscripción, fechas de ingreso y cargos
          desempeñados. Todos los campos son opcionales: si no se pueden leer,
          déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la entidad emisora
        </p>

        <CampoTexto
          id="entidad_emisora_carrerajudicial"
          etiqueta="Nombre de la entidad emisora del certificado"
          ayuda="Dirección Ejecutiva de la Magistratura (DEM), Inspectoría General de Tribunales (IGT) o Dirección General de Recursos Humanos del Poder Judicial."
          value={String(valores.entidad_emisora_carrerajudicial ?? "")}
          error={errores.entidad_emisora_carrerajudicial}
          onChange={(v) => onCampo("entidad_emisora_carrerajudicial", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante
        </p>

        <CampoTexto
          id="nombre_postulante_carrerajudicial"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien hace la solicitud de la certificación de carrera judicial"
          value={String(valores.nombre_postulante_carrerajudicial ?? "")}
          error={errores.nombre_postulante_carrerajudicial}
          onChange={(v) => onCampo("nombre_postulante_carrerajudicial", v)}
        />

        <CampoTexto
          id="apellido_postulante_carrerajudicial"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien hace la solicitud de certificación de carrera judicial"
          value={String(valores.apellido_postulante_carrerajudicial ?? "")}
          error={errores.apellido_postulante_carrerajudicial}
          onChange={(v) => onCampo("apellido_postulante_carrerajudicial", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_carrerajudicial"
          etiqueta="Número de cédula de identidad del solicitante"
          ayuda="Coloca el número de cédula de quien hace la solicitud de certificación de carrera judicial"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL] ?? "V",
          )}
          digitos={String(valores.cedula_postulante_carrerajudicial ?? "")}
          error={errores.cedula_postulante_carrerajudicial}
          onCampo={onCampo}
        />

        <CampoTexto
          id="expediente_dem_carrerajudicial"
          etiqueta="Código o número de expediente personal / carnet de la DEM"
          ayuda="(si aplica)"
          value={String(valores.expediente_dem_carrerajudicial ?? "")}
          error={errores.expediente_dem_carrerajudicial}
          classNameExtra="codigo"
          onChange={(v) => onCampo("expediente_dem_carrerajudicial", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Línea de tiempo y antigüedad acumulada
        </p>

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de ingreso a la judicatura
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Día, mes y año del primer nombramiento como Juez/a o funcionario
            judicial.
          </p>
          <DatePicker
            id="fecha_ingreso_judicatura"
            value={String(valores.fecha_ingreso_judicatura ?? "")}
            onChange={(iso) => onCampo("fecha_ingreso_judicatura", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_ingreso_judicatura)}
          />
          {errores.fecha_ingreso_judicatura && (
            <p className="mensaje-error-campo">{errores.fecha_ingreso_judicatura}</p>
          )}
        </div>

        <div>
          <span className="block text-xs font-medium text-toga-600">Fecha de corte</span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha de expedición de la constancia.
          </p>
          <DatePicker
            id="fecha_corte_carrerajudicial"
            value={String(valores.fecha_corte_carrerajudicial ?? "")}
            onChange={(iso) => onCampo("fecha_corte_carrerajudicial", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_corte_carrerajudicial)}
          />
          {errores.fecha_corte_carrerajudicial && (
            <p className="mensaje-error-campo">{errores.fecha_corte_carrerajudicial}</p>
          )}
        </div>

        <CampoTexto
          id="condicion_cargo_carrerajudicial"
          etiqueta="Condición del cargo"
          ayuda="Ejemplo: Juez jubilado, activo o cese del cargo"
          value={String(valores.condicion_cargo_carrerajudicial ?? "")}
          error={errores.condicion_cargo_carrerajudicial}
          onChange={(v) => onCampo("condicion_cargo_carrerajudicial", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Historial detallado de cargos y tribunales (registro de trayectoria)
        </p>

        <CampoTexto
          id="cargo_desempeñado_carrerajudicial"
          etiqueta="Cargo desempeñado"
          ayuda="Juez/a Titular, Juez/a Provisorio/a, Juez/a Suplente, o Juez/a Superior."
          value={String(valores.cargo_desempeñado_carrerajudicial ?? "")}
          error={errores.cargo_desempeñado_carrerajudicial}
          onChange={(v) => onCampo("cargo_desempeñado_carrerajudicial", v)}
        />

        <CampoTexto
          id="tribunal_competencia_carrerajudicial"
          etiqueta="Denominación y competencia del tribunal"
          ayuda="Nombre exacto del despacho judicial (Ejemplo: Tribunal Superior Primero en lo Contencioso Administrativo de la Región Capital)"
          value={String(valores.tribunal_competencia_carrerajudicial ?? "")}
          error={errores.tribunal_competencia_carrerajudicial}
          onChange={(v) => onCampo("tribunal_competencia_carrerajudicial", v)}
        />

        <CampoTexto
          id="circuito_judicial_carrerajudicial"
          etiqueta="Circuito judicial de adscripción"
          ayuda="Ejemplo: Circunscripción judicial del Estado Lara"
          value={String(valores.circuito_judicial_carrerajudicial ?? "")}
          error={errores.circuito_judicial_carrerajudicial}
          onChange={(v) => onCampo("circuito_judicial_carrerajudicial", v)}
        />

        <CampoTexto
          id="estado_circunscripcion_carrerajudicial"
          etiqueta="Estado de la circunscripción"
          ayuda="Estado donde se ubica la circunscripción"
          value={String(valores.estado_circunscripcion_carrerajudicial ?? "")}
          error={errores.estado_circunscripcion_carrerajudicial}
          onChange={(v) => onCampo("estado_circunscripcion_carrerajudicial", v)}
        />

        <CampoTexto
          id="resolucion_nombramiento_carrerajudicial"
          etiqueta="N° de resolución / Gaceta judicial de nombramiento"
          ayuda="Identificador único del acto administrativo de designación o ascenso."
          value={String(valores.resolucion_nombramiento_carrerajudicial ?? "")}
          error={errores.resolucion_nombramiento_carrerajudicial}
          classNameExtra="codigo"
          onChange={(v) => onCampo("resolucion_nombramiento_carrerajudicial", v)}
        />

        <CampoTexto
          id="periodo_desempeño_carrerajudicial"
          etiqueta="Periodo de desempeño del cargo"
          ayuda="Fecha de inicio y fecha de fin en cada tribunal."
          value={String(valores.periodo_desempeño_carrerajudicial ?? "")}
          error={errores.periodo_desempeño_carrerajudicial}
          onChange={(v) => onCampo("periodo_desempeño_carrerajudicial", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Verificación del requisito de juez/a superior (filtro legal Art.
            263.3 CRBV)
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Confirma si en el historial judicial consta haber ejercido la
            condición de Juez/a Superior, requisito de rango constitucional para
            aspirar a la Magistratura del TSJ.
          </p>
          <Select
            value={juezSuperior === "SI" || juezSuperior === "NO" ? juezSuperior : undefined}
            onValueChange={(v) => onCampo("es_juez_superior_carrerajudicial", v)}
          >
            <SelectTrigger
              className={`mt-1 w-28${errores.es_juez_superior_carrerajudicial ? " campo-con-error" : ""}`}
              aria-label="¿Es juez/a superior?"
            >
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">SI</SelectItem>
              <SelectItem value="NO">NO</SelectItem>
            </SelectContent>
          </Select>
          {errores.es_juez_superior_carrerajudicial && (
            <p className="mensaje-error-campo">
              {errores.es_juez_superior_carrerajudicial}
            </p>
          )}
        </div>

        <CampoArea
          id="ausencia_sanciones_carrerajudicial"
          etiqueta="Verificación del requisito de juez/a superior (filtro legal Art. 263.3 CRBV)"
          ayuda="Constancia de ausencia de sanciones de destitución, suspensión o amonestación dictadas por la Inspectoría General de Tribunales o el Tribunal Disciplinario Judicial."
          value={String(valores.ausencia_sanciones_carrerajudicial ?? "")}
          error={errores.ausencia_sanciones_carrerajudicial}
          onChange={(v) => onCampo("ausencia_sanciones_carrerajudicial", v)}
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
