"use client";

import { CAUSALES_INELEGIBILIDAD, type FichaDescalificacion } from "@/lib/elegibilidad";

/**
 * Ficha de descalificación / dictamen de inelegibilidad (Paso 1).
 */
export function FichaDescalificacionVista({
  ficha,
  onGenerarInforme,
}: {
  readonly ficha: FichaDescalificacion;
  readonly onGenerarInforme?: () => void;
}) {
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

      {onGenerarInforme && (
        <button
          type="button"
          onClick={onGenerarInforme}
          className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
        >
          Generar informe
        </button>
      )}
    </div>
  );
}

/** Abre una ventana imprimible con el contenido de la ficha. */
export function imprimirFichaDescalificacion(ficha: FichaDescalificacion) {
  const fecha = new Date(ficha.fechaIso).toLocaleString("es-VE", {
    dateStyle: "long",
    timeStyle: "medium",
  });
  const causalesHtml = CAUSALES_INELEGIBILIDAD.filter((c) => ficha.causales.includes(c.id))
    .map((c) => `<li><strong>Causal ${c.orden}.</strong> ${escapeHtml(c.texto)}</li>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Dictamen de inelegibilidad — ${escapeHtml(ficha.fileNumber)}</title>
  <style>
    body { font-family: Georgia, serif; color: #1a2332; margin: 2rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; }
    h2 { font-size: 1rem; margin-top: 1.5rem; }
    .meta { font-size: 0.9rem; }
    .codigo { font-family: ui-monospace, monospace; }
    ul { padding-left: 1.25rem; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>Ficha de descalificación y dictamen de inelegibilidad (Paso 1)</h1>
  <div class="meta">
    <p><strong>Expediente:</strong> <span class="codigo">${escapeHtml(ficha.fileNumber)}</span></p>
    <p><strong>Postulante:</strong> ${escapeHtml(ficha.postulanteNombre)}</p>
    <p><strong>Cédula:</strong> <span class="codigo">${escapeHtml(ficha.nationalId)}</span></p>
    <p><strong>Sala:</strong> ${escapeHtml(ficha.salaLabel)}</p>
    <p><strong>Evaluador:</strong> ${escapeHtml(ficha.evaluadorNombre)}</p>
    <p><strong>Fecha:</strong> ${escapeHtml(fecha)}</p>
  </div>
  <h2>Causales</h2>
  <ul>${causalesHtml}</ul>
  <h2>Fundamentación</h2>
  <p>${escapeHtml(ficha.motivo).replace(/\n/g, "<br/>")}</p>
  <p style="margin-top:2rem"><strong>Firma del evaluador:</strong> ${escapeHtml(ficha.evaluadorNombre)}</p>
  <button type="button" onclick="window.print()">Imprimir / guardar PDF</button>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
