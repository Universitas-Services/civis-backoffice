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
  KEY_PREFIJO_CEDULA,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function FormularioCedulaIdentidad({
  valores,
  errores = {},
  onCampo,
}: {
  readonly valores: Readonly<ValoresFormularioRevision>;
  readonly errores?: Readonly<ErroresFormularioRevision>;
  readonly onCampo: (key: string, value: string | boolean | null) => void;
}) {
  const prefijo = String(valores[KEY_PREFIJO_CEDULA] ?? "V");
  const digitos = String(valores.cedula_identidad_postulante ?? "");
  const errCedula = errores.cedula_identidad_postulante;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-toga-900">
        Datos de la cédula de identidad
      </legend>
      <p className="text-[0.7rem] text-toga-400">
        Todos los campos son opcionales. Si el documento no permite leer un dato,
        déjelo vacío.
      </p>

      <div>
        <label htmlFor="cedula_identidad_postulante" className="block text-xs font-medium text-toga-600">
          Cédula de identidad vigente
        </label>
        <div className="mt-1 flex w-fit max-w-full gap-2">
          <Select
            value={prefijo === "E" ? "E" : "V"}
            onValueChange={(v) => onCampo(KEY_PREFIJO_CEDULA, v)}
          >
            <SelectTrigger
              className={`w-16 shrink-0${errCedula ? " campo-con-error" : ""}`}
              aria-label="Tipo de cédula"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="V">V</SelectItem>
              <SelectItem value="E">E</SelectItem>
            </SelectContent>
          </Select>
          <input
            id="cedula_identidad_postulante"
            inputMode="numeric"
            maxLength={8}
            placeholder="12345678"
            value={digitos}
            onChange={(e) =>
              onCampo(
                "cedula_identidad_postulante",
                e.target.value.replace(/\D/g, "").slice(0, 8),
              )
            }
            className={`${CAMPO} !mt-0 !w-32 codigo${errCedula ? " campo-con-error" : ""}`}
            aria-invalid={Boolean(errCedula)}
            autoComplete="off"
          />
        </div>
        {errCedula && <p className="mensaje-error-campo">{errCedula}</p>}
      </div>

      <div>
        <label htmlFor="nombre_cedula_postulante" className="block text-xs font-medium text-toga-600">
          Nombre completo del postulante
        </label>
        <p className="mt-0.5 text-[0.7rem] text-toga-400">
          Nombre registral exacto e inalterable del postulante
        </p>
        <input
          id="nombre_cedula_postulante"
          type="text"
          value={String(valores.nombre_cedula_postulante ?? "")}
          onChange={(e) => onCampo("nombre_cedula_postulante", e.target.value)}
          className={`${CAMPO}${errores.nombre_cedula_postulante ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(errores.nombre_cedula_postulante)}
          autoComplete="off"
        />
        {errores.nombre_cedula_postulante && (
          <p className="mensaje-error-campo">{errores.nombre_cedula_postulante}</p>
        )}
      </div>

      <div>
        <label htmlFor="apellido_cedula_postulante" className="block text-xs font-medium text-toga-600">
          Apellido completo
        </label>
        <p className="mt-0.5 text-[0.7rem] text-toga-400">
          Apellido registral exacto e inalterable del postulante
        </p>
        <input
          id="apellido_cedula_postulante"
          type="text"
          value={String(valores.apellido_cedula_postulante ?? "")}
          onChange={(e) => onCampo("apellido_cedula_postulante", e.target.value)}
          className={`${CAMPO}${errores.apellido_cedula_postulante ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(errores.apellido_cedula_postulante)}
          autoComplete="off"
        />
        {errores.apellido_cedula_postulante && (
          <p className="mensaje-error-campo">{errores.apellido_cedula_postulante}</p>
        )}
      </div>

      <div>
        <label htmlFor="estadocivil_cedula_postulante" className="block text-xs font-medium text-toga-600">
          Estado civil
        </label>
        <p className="mt-0.5 text-[0.7rem] text-toga-400">
          Estado civil que aparece en el documento presentado
        </p>
        <input
          id="estadocivil_cedula_postulante"
          type="text"
          value={String(valores.estadocivil_cedula_postulante ?? "")}
          onChange={(e) => onCampo("estadocivil_cedula_postulante", e.target.value)}
          className={`${CAMPO}${errores.estadocivil_cedula_postulante ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(errores.estadocivil_cedula_postulante)}
          autoComplete="off"
        />
        {errores.estadocivil_cedula_postulante && (
          <p className="mensaje-error-campo">{errores.estadocivil_cedula_postulante}</p>
        )}
      </div>

      <div>
        <span className="block text-xs font-medium text-toga-600">Fecha de nacimiento</span>
        <p className="mt-0.5 text-[0.7rem] text-toga-400">
          Fecha de nacimiento que aparece en el documento presentado
        </p>
        <DatePicker
          id="fechanacimiento_cedula_postulante"
          value={String(valores.fechanacimiento_cedula_postulante ?? "")}
          onChange={(iso) => onCampo("fechanacimiento_cedula_postulante", iso)}
          toYear={new Date().getFullYear()}
          invalid={Boolean(errores.fechanacimiento_cedula_postulante)}
        />
        {errores.fechanacimiento_cedula_postulante && (
          <p className="mensaje-error-campo">{errores.fechanacimiento_cedula_postulante}</p>
        )}
      </div>

      <div>
        <span className="block text-xs font-medium text-toga-600">Vigencia del documento</span>
        <p className="mt-0.5 text-[0.7rem] text-toga-400">Fecha de vencimiento del documento</p>
        <DatePicker
          id="vigencia_cedula_postulante"
          value={String(valores.vigencia_cedula_postulante ?? "")}
          onChange={(iso) => onCampo("vigencia_cedula_postulante", iso)}
          fromYear={2000}
          toYear={new Date().getFullYear() + 20}
          invalid={Boolean(errores.vigencia_cedula_postulante)}
        />
        {errores.vigencia_cedula_postulante && (
          <p className="mensaje-error-campo">{errores.vigencia_cedula_postulante}</p>
        )}
      </div>
    </fieldset>
  );
}
