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
  KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL,
  KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioCarreraFuncionarial({
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
          Certificación formal de carrera funcionarial en el área jurídica
          expedida por el órgano administrativo competente
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento constata fehacientemente una trayectoria no menor a
          quince años en el ejercicio de la carrera funcionarial en el área
          jurídica del postulante, especificando las dependencias de
          adscripción, fechas de ingreso y cargos desempeñados. Todos los
          campos son opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Identificación de la entidad emisora
        </p>

        <CampoTexto
          id="organo_emisor_carrerafuncionarial"
          etiqueta="Nombre del órgano o ente emisor"
          ayuda="Nombre de la institución u órgano de la Administración Pública Nacional, Estadal o Municipal que expide la certificación"
          value={String(valores.organo_emisor_carrerafuncionarial ?? "")}
          error={errores.organo_emisor_carrerafuncionarial}
          onChange={(v) => onCampo("organo_emisor_carrerafuncionarial", v)}
        />

        <CampoTexto
          id="estado_entidad_carrerafuncionarial"
          etiqueta="Estado"
          ayuda="Coloca el Estado donde se ubica la Entidad u organización que emite la carta"
          value={String(valores.estado_entidad_carrerafuncionarial ?? "")}
          error={errores.estado_entidad_carrerafuncionarial}
          onChange={(v) => onCampo("estado_entidad_carrerafuncionarial", v)}
        />

        <CampoTexto
          id="municipio_entidad_carrerafuncionarial"
          etiqueta="Municipio"
          ayuda="Coloca el Municipio donde se ubica la Entidad u organización que emite la carta"
          value={String(valores.municipio_entidad_carrerafuncionarial ?? "")}
          error={errores.municipio_entidad_carrerafuncionarial}
          onChange={(v) => onCampo("municipio_entidad_carrerafuncionarial", v)}
        />

        <CampoTexto
          id="direccion_entidad_carrerafuncionarial"
          etiqueta="Dirección"
          ayuda="Coloca la dirección donde se ubica la Entidad u organización que emite la carta"
          value={String(valores.direccion_entidad_carrerafuncionarial ?? "")}
          error={errores.direccion_entidad_carrerafuncionarial}
          onChange={(v) => onCampo("direccion_entidad_carrerafuncionarial", v)}
        />

        <CampoTexto
          id="nombre_quiensuscribe_carrerafuncionarial"
          etiqueta="Nombre completo de quien suscribe el documento"
          ayuda="Nombre de la autoridad o funcionario que firma la certificación"
          value={String(valores.nombre_quiensuscribe_carrerafuncionarial ?? "")}
          error={errores.nombre_quiensuscribe_carrerafuncionarial}
          onChange={(v) => onCampo("nombre_quiensuscribe_carrerafuncionarial", v)}
        />

        <CampoCedulaVe
          id="cedula_quiensuscribe_carrerafuncionarial"
          etiqueta="Cédula de quien suscribe el documento"
          ayuda="Número de cédula de la autoridad o funcionario que firma la certificación"
          prefijoKey={KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL] ?? "V",
          )}
          digitos={String(valores.cedula_quiensuscribe_carrerafuncionarial ?? "")}
          error={errores.cedula_quiensuscribe_carrerafuncionarial}
          onCampo={onCampo}
        />

        <CampoTexto
          id="cargo_quiensuscribe_carrerafuncionarial"
          etiqueta="Cargo de quien suscribe el documento"
          ayuda="Cargo de quien suscribe la certificación"
          value={String(valores.cargo_quiensuscribe_carrerafuncionarial ?? "")}
          error={errores.cargo_quiensuscribe_carrerafuncionarial}
          onChange={(v) => onCampo("cargo_quiensuscribe_carrerafuncionarial", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Identificación del solicitante
        </p>

        <CampoTexto
          id="nombre_postulante_carrerafuncionarial"
          etiqueta="Nombre completo del solicitante"
          ayuda="Coloca el nombre de quien hace la solicitud de la certificación de carrera funcionarial"
          value={String(valores.nombre_postulante_carrerafuncionarial ?? "")}
          error={errores.nombre_postulante_carrerafuncionarial}
          onChange={(v) => onCampo("nombre_postulante_carrerafuncionarial", v)}
        />

        <CampoTexto
          id="apellido_postulante_carrerafuncionarial"
          etiqueta="Apellido completo del solicitante"
          ayuda="Coloca el apellido de quien hace la solicitud de certificación de carrera funcionarial"
          value={String(valores.apellido_postulante_carrerafuncionarial ?? "")}
          error={errores.apellido_postulante_carrerafuncionarial}
          onChange={(v) => onCampo("apellido_postulante_carrerafuncionarial", v)}
        />

        <CampoCedulaVe
          id="cedula_postulante_carrerafuncionarial"
          etiqueta="Número de cédula de identidad del solicitante"
          ayuda="Coloca el número de cédula de quien hace la solicitud de certificación de carrera funcionarial"
          prefijoKey={KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL}
          prefijo={String(
            valores[KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL] ?? "V",
          )}
          digitos={String(valores.cedula_postulante_carrerafuncionarial ?? "")}
          error={errores.cedula_postulante_carrerafuncionarial}
          onCampo={onCampo}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Línea de tiempo y antigüedad acumulada
        </p>

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de ingreso al servicio público jurídico
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Día, mes y año del primer nombramiento o contrato en funciones
            jurídicas.
          </p>
          <DatePicker
            id="fecha_ingreso_carrerafuncionarial"
            value={String(valores.fecha_ingreso_carrerafuncionarial ?? "")}
            onChange={(iso) => onCampo("fecha_ingreso_carrerafuncionarial", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_ingreso_carrerafuncionarial)}
          />
          {errores.fecha_ingreso_carrerafuncionarial && (
            <p className="mensaje-error-campo">
              {errores.fecha_ingreso_carrerafuncionarial}
            </p>
          )}
        </div>

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha de egreso / estatus de servicio
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Fecha de expedición de la constancia.
          </p>
          <DatePicker
            id="estatus_servicio_carrerafuncionarial"
            value={String(valores.estatus_servicio_carrerafuncionarial ?? "")}
            onChange={(iso) => onCampo("estatus_servicio_carrerafuncionarial", iso)}
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.estatus_servicio_carrerafuncionarial)}
          />
          {errores.estatus_servicio_carrerafuncionarial && (
            <p className="mensaje-error-campo">
              {errores.estatus_servicio_carrerafuncionarial}
            </p>
          )}
        </div>

        <CampoTexto
          id="condicion_cargo_carrerafuncionarial"
          etiqueta="Condición del cargo"
          ayuda="Ejemplo: Funcionario jubilado, activo o cese del cargo"
          value={String(valores.condicion_cargo_carrerafuncionarial ?? "")}
          error={errores.condicion_cargo_carrerafuncionarial}
          onChange={(v) => onCampo("condicion_cargo_carrerafuncionarial", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Historial detallado de cargos y tribunales (registro de trayectoria)
        </p>

        <CampoTexto
          id="cargo_desempenado_carrerafuncionarial"
          etiqueta="Cargo desempeñado"
          ayuda="Denominación exacta del puesto (ej. Consultor/a Jurídico/a, Abogado/a Asesor/a, Director/a General de Servicios Jurídicos)"
          value={String(valores.cargo_desempenado_carrerafuncionarial ?? "")}
          error={errores.cargo_desempenado_carrerafuncionarial}
          onChange={(v) => onCampo("cargo_desempenado_carrerafuncionarial", v)}
        />

        <CampoTexto
          id="dependencia_adscripcion_carrerafuncionarial"
          etiqueta="Dependencia u oficina de adscripción"
          ayuda="Unidad administrativa específica (ej. Oficina de Asesoría Legal, Dirección de Licitaciones y Contratos)"
          value={String(valores.dependencia_adscripcion_carrerafuncionarial ?? "")}
          error={errores.dependencia_adscripcion_carrerafuncionarial}
          onChange={(v) =>
            onCampo("dependencia_adscripcion_carrerafuncionarial", v)
          }
        />

        <CampoArea
          id="naturaleza_cargo_carrerafuncionarial"
          etiqueta="Naturaleza del cargo (filtro de validabilidad jurídica)"
          ayuda="Descripción que certifique que las atribuciones ejercidas fueron de carácter eminentemente jurídico"
          value={String(valores.naturaleza_cargo_carrerafuncionarial ?? "")}
          error={errores.naturaleza_cargo_carrerafuncionarial}
          onChange={(v) => onCampo("naturaleza_cargo_carrerafuncionarial", v)}
        />

        <CampoArea
          id="acto_designacion_carrerafuncionarial"
          etiqueta="Acto administrativo de designación"
          ayuda="Ejemplo: Designada según Decreto N° xxxx de fecha xx de xxxxx de xxxx. Publicado en Gaceta Oficial"
          value={String(valores.acto_designacion_carrerafuncionarial ?? "")}
          error={errores.acto_designacion_carrerafuncionarial}
          onChange={(v) => onCampo("acto_designacion_carrerafuncionarial", v)}
        />

        <CampoTexto
          id="periodo_desempeno_carrerafuncionarial"
          etiqueta="Periodo de desempeño del cargo"
          ayuda="Fecha de inicio y fecha de fin en cada puesto."
          value={String(valores.periodo_desempeno_carrerafuncionarial ?? "")}
          error={errores.periodo_desempeno_carrerafuncionarial}
          onChange={(v) => onCampo("periodo_desempeno_carrerafuncionarial", v)}
        />

        <CampoArea
          id="ausencia_sanciones_carrerafuncionarial"
          etiqueta="Constancia de ausencia de sanciones administrativas"
          ayuda="Declaración de no haber sido objeto de destitución mediante sumario administrativo ni de inhabilitación por faltas graves en la función pública."
          value={String(valores.ausencia_sanciones_carrerafuncionarial ?? "")}
          error={errores.ausencia_sanciones_carrerafuncionarial}
          onChange={(v) => onCampo("ausencia_sanciones_carrerafuncionarial", v)}
        />

        <div>
          <span className="block text-xs font-medium text-toga-600">
            Fecha del documento
          </span>
          <p className="mt-0.5 text-[0.7rem] text-toga-400">
            Día, mes y año del documento suscrito
          </p>
          <DatePicker
            id="fecha_expedicion_carrerafuncionarial"
            value={String(valores.fecha_expedicion_carrerafuncionarial ?? "")}
            onChange={(iso) =>
              onCampo("fecha_expedicion_carrerafuncionarial", iso)
            }
            toYear={new Date().getFullYear()}
            invalid={Boolean(errores.fecha_expedicion_carrerafuncionarial)}
          />
          {errores.fecha_expedicion_carrerafuncionarial && (
            <p className="mensaje-error-campo">
              {errores.fecha_expedicion_carrerafuncionarial}
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
