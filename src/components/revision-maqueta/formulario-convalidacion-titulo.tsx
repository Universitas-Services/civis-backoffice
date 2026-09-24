"use client";

import type {
  ErroresFormularioRevision,
  ValoresFormularioRevision,
} from "./campos-formulario-revision";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

const CAMPOS: readonly {
  readonly id: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly tipo: "text" | "date" | "number";
}[] = [
  {
    id: "universidad_revalidadora_convalidacion",
    etiqueta: "Universidad revalidadora",
    ayuda: "Universidad venezolana que expide la resolución de convalidación",
    tipo: "text",
  },
  {
    id: "numero_resolucion_cu_convalidacion",
    etiqueta: "Número de resolución del Consejo Universitario",
    ayuda: "Número de la resolución que otorga la equivalencia",
    tipo: "text",
  },
  {
    id: "fecha_resolucion_cu_convalidacion",
    etiqueta: "Fecha de la resolución",
    ayuda: "Fecha de la resolución del Consejo Universitario",
    tipo: "date",
  },
  {
    id: "titulo_equivalente_otorgado_convalidacion",
    etiqueta: "Título equivalente otorgado",
    ayuda: "Denominación del título venezolano reconocido",
    tipo: "text",
  },
  {
    id: "oficio_registro_convalidacion",
    etiqueta: "Oficio de registro",
    ayuda: "Oficio con el que se protocoliza o registra la convalidación",
    tipo: "text",
  },
  {
    id: "numero_asentamiento_convalidacion",
    etiqueta: "Número de asentamiento",
    ayuda: "Número de asentamiento en el registro",
    tipo: "number",
  },
  {
    id: "tomo_registro_convalidacion",
    etiqueta: "Tomo",
    ayuda: "Tomo del registro",
    tipo: "number",
  },
  {
    id: "folio_registro_convalidacion",
    etiqueta: "Folio",
    ayuda: "Folio del registro",
    tipo: "number",
  },
  {
    id: "fecha_protocolizacion_convalidacion",
    etiqueta: "Fecha de protocolización",
    ayuda: "Fecha en que se protocolizó el documento",
    tipo: "date",
  },
  {
    id: "universidad_origen_convalidacion",
    etiqueta: "Universidad de origen",
    ayuda: "Institución extranjera que otorgó el título original",
    tipo: "text",
  },
  {
    id: "denominacion_titulo_origen_convalidacion",
    etiqueta: "Denominación del título de origen",
    ayuda: "Nombre del título tal como figura en el país de origen",
    tipo: "text",
  },
  {
    id: "pais_origen_convalidacion",
    etiqueta: "País de origen",
    ayuda: "País donde se obtuvo el título",
    tipo: "text",
  },
  {
    id: "nombre_profesional_convalidacion",
    etiqueta: "Nombre del profesional",
    ayuda: "Nombre que aparece en el documento",
    tipo: "text",
  },
  {
    id: "apellido_profesional_convalidacion",
    etiqueta: "Apellido del profesional",
    ayuda: "Apellido que aparece en el documento",
    tipo: "text",
  },
  {
    id: "cedula_profesional_convalidacion",
    etiqueta: "Cédula del profesional",
    ayuda: "Número de cédula que aparece en el documento",
    tipo: "number",
  },
  {
    id: "codigo_apostilla_convalidacion",
    etiqueta: "Código de apostilla",
    ayuda: "Código de la apostilla o legalización, si consta",
    tipo: "text",
  },
  {
    id: "traduccion_oficial_convalidacion",
    etiqueta: "Traducción oficial",
    ayuda: "Datos de la traducción oficial, si el documento no está en español",
    tipo: "text",
  },
];

export function FormularioConvalidacionTitulo({
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
          Convalidación de título extranjero
        </legend>
        <p className="text-[0.7rem] text-toga-500">
          Resolución o certificado de revalidación. Todos los campos son opcionales: si no se
          pueden leer, déjelos vacíos.
        </p>
        {CAMPOS.map((campo) => (
          <Campo
            key={campo.id}
            {...campo}
            value={String(valores[campo.id] ?? "")}
            error={errores[campo.id]}
            onChange={(v) => onCampo(campo.id, v)}
          />
        ))}
      </fieldset>
    </div>
  );
}

function Campo({
  id,
  etiqueta,
  ayuda,
  tipo,
  value,
  error,
  onChange,
}: {
  readonly id: string;
  readonly etiqueta: string;
  readonly ayuda: string;
  readonly tipo: "text" | "date" | "number";
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
        type={tipo === "date" ? "date" : "text"}
        inputMode={tipo === "number" ? "numeric" : undefined}
        value={value}
        onChange={(e) =>
          onChange(tipo === "number" ? e.target.value.replace(/\D/g, "") : e.target.value)
        }
        className={`${CAMPO}${error ? " campo-con-error" : ""}`}
        aria-invalid={Boolean(error)}
        autoComplete="off"
      />
      {error && <p className="mensaje-error-campo">{error}</p>}
    </div>
  );
}
