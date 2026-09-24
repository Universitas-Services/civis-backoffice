"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KEY_PREFIJO_CEDULA_SINTESIS,
  KEY_PREFIJO_INPRE_SINTESIS,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioSintesisCurricular({
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
          Datos de la síntesis curricular
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Este documento resume el currículum vitae actualizado del postulante. Todos los
          campos son opcionales: si no se pueden leer, déjelos vacíos.
        </p>

        <p className="pt-1 text-xs font-semibold text-toga-800">
          Datos del postulante presentes en la síntesis curricular
        </p>

        <CampoTexto
          id="nombre_postulante_sintesis"
          etiqueta="Nombre completo del postulante"
          ayuda="Coloca el nombre del postulante que aparece en el documento"
          value={String(valores.nombre_postulante_sintesis ?? "")}
          error={errores.nombre_postulante_sintesis}
          onChange={(v) => onCampo("nombre_postulante_sintesis", v)}
        />

        <CampoTexto
          id="apellido_postulante_sintesis"
          etiqueta="Apellido completo del postulante"
          ayuda="Coloca el apellido del postulante que aparece en el documento"
          value={String(valores.apellido_postulante_sintesis ?? "")}
          error={errores.apellido_postulante_sintesis}
          onChange={(v) => onCampo("apellido_postulante_sintesis", v)}
        />

        <CampoTexto
          id="estadocivil_postulante_sintesis"
          etiqueta="Estado civil"
          ayuda="Coloca el estado civil del postulante que aparece en el documento"
          value={String(valores.estadocivil_postulante_sintesis ?? "")}
          error={errores.estadocivil_postulante_sintesis}
          onChange={(v) => onCampo("estadocivil_postulante_sintesis", v)}
        />

        <CampoVeNumero
          id="cedula_postulante_sintesis"
          etiqueta="Cédula de identidad del postulante"
          ayuda="Coloca el número de la cédula de identidad que aparece en el documento presentado"
          prefijoKey={KEY_PREFIJO_CEDULA_SINTESIS}
          prefijo={String(valores[KEY_PREFIJO_CEDULA_SINTESIS] ?? "V")}
          digitos={String(valores.cedula_postulante_sintesis ?? "")}
          error={errores.cedula_postulante_sintesis}
          onCampo={onCampo}
          maxLength={8}
        />

        <CampoVeNumero
          id="inpreabogado_postulante_sintesis"
          etiqueta="Número del INPREABOGADO del postulante"
          ayuda="Coloca el número del INPREABOGADO que aparece en el documento presentado"
          prefijoKey={KEY_PREFIJO_INPRE_SINTESIS}
          prefijo={String(valores[KEY_PREFIJO_INPRE_SINTESIS] ?? "V")}
          digitos={String(valores.inpreabogado_postulante_sintesis ?? "")}
          error={errores.inpreabogado_postulante_sintesis}
          onCampo={onCampo}
          maxLength={20}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Datos de contacto e identificación digital
        </p>
        <p className="text-[0.7rem] text-toga-400">
          Correo electrónico, teléfono y dirección de habitación (reservados bajo capa de
          privacidad PII).
        </p>

        <CampoTexto
          id="correo_postulante_sintesis"
          etiqueta="Correo electrónico del postulante"
          ayuda="Coloca el correo electrónico que aparece en el documento"
          value={String(valores.correo_postulante_sintesis ?? "")}
          error={errores.correo_postulante_sintesis}
          onChange={(v) => onCampo("correo_postulante_sintesis", v)}
        />

        <CampoTexto
          id="ocupacion_postulante_sintesis"
          etiqueta="Ocupación actual"
          ayuda="Coloca la ocupación actual que tiene el postulante en el documento"
          value={String(valores.ocupacion_postulante_sintesis ?? "")}
          error={errores.ocupacion_postulante_sintesis}
          onChange={(v) => onCampo("ocupacion_postulante_sintesis", v)}
        />

        <CampoTexto
          id="telefono_postulante_sintesis"
          etiqueta="Número de teléfono"
          ayuda="Coloca el número de teléfono principal que tiene el postulante en el documento"
          value={String(valores.telefono_postulante_sintesis ?? "")}
          error={errores.telefono_postulante_sintesis}
          onChange={(v) => onCampo("telefono_postulante_sintesis", v)}
        />

        <p className="pt-2 text-xs font-semibold text-toga-800">
          Datos de ubicación laboral y habitación
        </p>

        <CampoTexto
          id="estado_ubicacion_sintesis"
          etiqueta="Estado"
          ayuda="Coloca el estado donde se ubica el postulante"
          value={String(valores.estado_ubicacion_sintesis ?? "")}
          error={errores.estado_ubicacion_sintesis}
          onChange={(v) => onCampo("estado_ubicacion_sintesis", v)}
        />

        <CampoTexto
          id="municipio_ubicacion_sintesis"
          etiqueta="Municipio"
          ayuda="Coloca el municipio donde se ubica el postulante"
          value={String(valores.municipio_ubicacion_sintesis ?? "")}
          error={errores.municipio_ubicacion_sintesis}
          onChange={(v) => onCampo("municipio_ubicacion_sintesis", v)}
        />

        <CampoTexto
          id="ciudad_ubicacion_sintesis"
          etiqueta="Ciudad"
          ayuda="Coloca la ciudad donde se ubica el postulante"
          value={String(valores.ciudad_ubicacion_sintesis ?? "")}
          error={errores.ciudad_ubicacion_sintesis}
          onChange={(v) => onCampo("ciudad_ubicacion_sintesis", v)}
        />

        <CampoTexto
          id="direccion_trabajo_sintesis"
          etiqueta="Dirección de trabajo"
          ayuda="Coloca la dirección donde trabaja actualmente el postulante"
          value={String(valores.direccion_trabajo_sintesis ?? "")}
          error={errores.direccion_trabajo_sintesis}
          onChange={(v) => onCampo("direccion_trabajo_sintesis", v)}
        />

        <CampoTexto
          id="direccion_habitacion_sintesis"
          etiqueta="Dirección de habitación"
          ayuda="Coloca la dirección donde habita actualmente el postulante"
          value={String(valores.direccion_habitacion_sintesis ?? "")}
          error={errores.direccion_habitacion_sintesis}
          onChange={(v) => onCampo("direccion_habitacion_sintesis", v)}
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
      <input
        id={id}
        type="text"
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
        <Select
          value={prefijo === "E" ? "E" : "V"}
          onValueChange={(v) => onCampo(prefijoKey, v)}
        >
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
          onChange={(e) =>
            onCampo(id, e.target.value.replace(/\D/g, "").slice(0, maxLength))
          }
          className={`${CAMPO} !mt-0 !w-36 codigo${error ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(error)}
          autoComplete="off"
        />
      </div>
      {error && <p className="mensaje-error-campo">{error}</p>}
    </div>
  );
}
