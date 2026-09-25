"use client";

import { CAUSALES_INELEGIBILIDAD, type FichaDescalificacion } from "@/lib/elegibilidad";

/**
 * Ficha de descalificación / dictamen de inelegibilidad (Paso 1).
 */
export function FichaDescalificacionVista({ ficha }: { readonly ficha: FichaDescalificacion }) {
  const fecha = new Date(ficha.fechaIso).toLocaleString("es-VE", {
    dateStyle: "long",
    timeStyle: "medium",
  });

  return (
    <div className="space-y-5 text-sm text-toga-800">
      <div>
        <h2 className="text-base font-semibold text-toga-900">
          Ficha de descalificación y dictamen de inelegibilidad
        </h2>
        <p className="mt-1 text-xs text-toga-500">Paso 1 — requisitos de elegibilidad</p>
      </div>

      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-toga-500">Expediente</dt>
          <dd className="codigo font-medium text-toga-900">{ficha.fileNumber}</dd>
        </div>
        <div>
          <dt className="text-xs text-toga-500">Postulante</dt>
          <dd className="font-medium text-toga-900">{ficha.postulanteNombre}</dd>
        </div>
        <div>
          <dt className="text-xs text-toga-500">Cédula</dt>
          <dd className="codigo text-toga-900">{ficha.nationalId}</dd>
        </div>
        <div>
          <dt className="text-xs text-toga-500">Sala</dt>
          <dd className="text-toga-900">{ficha.salaLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-toga-500">Evaluador</dt>
          <dd className="text-toga-900">{ficha.evaluadorNombre}</dd>
        </div>
        <div>
          <dt className="text-xs text-toga-500">Fecha del dictamen</dt>
          <dd className="text-toga-900">{fecha}</dd>
        </div>
      </dl>

      <div>
        <h3 className="text-sm font-semibold text-toga-900">Causales marcadas</h3>
        <ul className="mt-2 space-y-1.5">
          {CAUSALES_INELEGIBILIDAD.filter((c) => ficha.causales.includes(c.id)).map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-toga-200 bg-toga-50 px-3 py-2 text-sm leading-relaxed"
            >
              <span className="font-medium">Causal {c.orden}.</span> {c.texto}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-toga-900">Fundamentación</h3>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-toga-800">{ficha.motivo}</p>
      </div>

      <p className="border-t border-toga-100 pt-3 text-xs text-toga-500">
        Firma del evaluador:{" "}
        <span className="font-medium text-toga-800">{ficha.evaluadorNombre}</span>
      </p>
    </div>
  );
}
