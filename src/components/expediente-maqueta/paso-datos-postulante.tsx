"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SALAS_MAQUETA, type SalaMaqueta } from "@/lib/maqueta-expediente-documentos";

export type DatosPostulanteMaqueta = {
  nombre: string;
  apellido: string;
  prefijoCedula: "V" | "E";
  cedulaDigitos: string;
  sala: SalaMaqueta | "";
};

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

function filtrarNombre(valor: string): string {
  return valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").replace(/\s{2,}/g, " ");
}

export function PasoDatosPostulante({
  valores,
  errores,
  onChange,
  onRegistrar,
}: {
  readonly valores: DatosPostulanteMaqueta;
  readonly errores: Partial<Record<keyof DatosPostulanteMaqueta, string>>;
  readonly onChange: (v: DatosPostulanteMaqueta) => void;
  readonly onRegistrar: () => void;
}) {
  function actualizar<K extends keyof DatosPostulanteMaqueta>(campo: K, valor: DatosPostulanteMaqueta[K]) {
    onChange({ ...valores, [campo]: valor });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-toga-900">Datos del postulante</h2>
        <p className="mt-1 text-sm text-toga-500">
          Complete la identificación y registre el expediente para continuar con los documentos.
        </p>
      </div>

      <fieldset className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold text-toga-900">Identificación</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre_postulante" className="block text-xs font-medium text-toga-600">
              Nombre del postulante <span className="text-balanza-700">*</span>
            </label>
            <input
              id="nombre_postulante"
              value={valores.nombre}
              onChange={(e) => actualizar("nombre", filtrarNombre(e.target.value))}
              className={`${CAMPO}${errores.nombre ? " campo-con-error" : ""}`}
              aria-invalid={Boolean(errores.nombre)}
            />
            {errores.nombre && (
              <p role="alert" className="mensaje-error-campo">
                {errores.nombre}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="apellido_postulante" className="block text-xs font-medium text-toga-600">
              Apellido del postulante <span className="text-balanza-700">*</span>
            </label>
            <input
              id="apellido_postulante"
              value={valores.apellido}
              onChange={(e) => actualizar("apellido", filtrarNombre(e.target.value))}
              className={`${CAMPO}${errores.apellido ? " campo-con-error" : ""}`}
              aria-invalid={Boolean(errores.apellido)}
            />
            {errores.apellido && (
              <p role="alert" className="mensaje-error-campo">
                {errores.apellido}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cedula_postulante" className="block text-xs font-medium text-toga-600">
              Cédula de identidad vigente <span className="text-balanza-700">*</span>
            </label>
            <div className="mt-1 flex w-fit max-w-full gap-2">
              <Select
                value={valores.prefijoCedula}
                onValueChange={(v) => actualizar("prefijoCedula", v as "V" | "E")}
              >
                <SelectTrigger
                  className={`w-16 shrink-0 ${errores.cedulaDigitos ? "campo-con-error" : ""}`}
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
                id="cedula_postulante"
                inputMode="numeric"
                maxLength={8}
                placeholder="12345678"
                value={valores.cedulaDigitos}
                onChange={(e) =>
                  actualizar("cedulaDigitos", e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                className={`${CAMPO} !mt-0 !w-32 codigo${errores.cedulaDigitos ? " campo-con-error" : ""}`}
                aria-invalid={Boolean(errores.cedulaDigitos)}
              />
            </div>
            {errores.cedulaDigitos && (
              <p role="alert" className="mensaje-error-campo">
                {errores.cedulaDigitos}
              </p>
            )}
          </div>
          <div className="sm:col-span-2 sm:max-w-sm">
            <label htmlFor="sala_postulante" className="block text-xs font-medium text-toga-600">
              Sala a la que se postula <span className="text-balanza-700">*</span>
            </label>
            <Select
              value={valores.sala || undefined}
              onValueChange={(v) => actualizar("sala", v as SalaMaqueta)}
            >
              <SelectTrigger
                id="sala_postulante"
                className={`mt-1 ${errores.sala ? "campo-con-error" : ""}`}
              >
                <SelectValue placeholder="Seleccione la sala…" />
              </SelectTrigger>
              <SelectContent>
                {SALAS_MAQUETA.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errores.sala && (
              <p role="alert" className="mensaje-error-campo">
                {errores.sala}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <button
        type="button"
        onClick={onRegistrar}
        className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
      >
        Registrar expediente
      </button>
    </div>
  );
}

export function validarDatosPostulante(
  v: DatosPostulanteMaqueta,
): Partial<Record<keyof DatosPostulanteMaqueta, string>> {
  const e: Partial<Record<keyof DatosPostulanteMaqueta, string>> = {};
  if (v.nombre.trim().length < 2) e.nombre = "Indique el nombre (mínimo 2 letras)";
  if (v.apellido.trim().length < 2) e.apellido = "Indique el apellido (mínimo 2 letras)";
  if (!/^\d{6,8}$/.test(v.cedulaDigitos)) {
    e.cedulaDigitos = "La cédula debe tener entre 6 y 8 dígitos";
  }
  if (!v.sala) e.sala = "Seleccione la sala";
  return e;
}
