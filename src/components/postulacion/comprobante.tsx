"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Download, KeyRound } from "lucide-react";

/**
 * Comprobante del expediente recién creado. El código de acceso se muestra
 * UNA sola vez: es la única forma de volver a entrar. Por eso «Continuar»
 * se habilita sólo después de confirmar que se guardó.
 */
export function Comprobante({
  fileNumber,
  accessCode,
  nombre,
  onContinuar,
}: {
  readonly fileNumber: string;
  readonly accessCode: string;
  readonly nombre: string;
  readonly onContinuar: () => Promise<void>;
}) {
  const [copiado, setCopiado] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [pendiente, iniciar] = useTransition();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  function descargar() {
    const fecha = new Date().toLocaleString("es-VE", { dateStyle: "long", timeStyle: "short" });
    const texto = [
      "CIVIS — Comprobante de postulación",
      "",
      `Postulante: ${nombre}`,
      `Expediente: ${fileNumber}`,
      `Código de acceso: ${accessCode}`,
      `Fecha: ${fecha}`,
      "",
      "Con este código puede reanudar la carga de documentos y consultar el estado",
      "de su postulación en «Reanudar mi postulación». Guárdelo y no lo comparta.",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([texto], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `postulacion-${fileNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [prefijo, ...grupos] = accessCode.split("-");

  return (
    <section
      aria-labelledby="titulo-comprobante"
      className="mx-auto max-w-2xl rounded-xl border border-toga-200 bg-white p-6 sm:p-8"
    >
      <p className="text-xs font-semibold tracking-wide text-validado-700 uppercase">
        Expediente registrado
      </p>
      <h1 id="titulo-comprobante" className="mt-1 text-2xl font-semibold text-toga-900">
        {nombre}
      </h1>

      <dl className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <dt className="text-sm text-toga-500">Número de expediente</dt>
        <dd className="codigo text-lg font-semibold text-toga-900">{fileNumber}</dd>
        <dt className="text-sm text-toga-500">Código de acceso</dt>
        <dd>
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border-2 border-balanza-600/40 bg-balanza-50 px-4 py-3">
            <KeyRound className="mr-1 h-5 w-5 text-balanza-700" aria-hidden="true" />
            <span className="codigo text-xl font-semibold tracking-wider text-balanza-700">
              {prefijo}
            </span>
            {grupos.map((g) => (
              <span key={g} className="codigo text-xl font-semibold tracking-[0.2em] text-toga-900">
                <span aria-hidden="true" className="text-toga-400">
                  -
                </span>
                {g}
              </span>
            ))}
          </div>
        </dd>
      </dl>

      <div className="mt-5 rounded-md border border-balanza-600/25 bg-balanza-50/60 p-4 text-sm leading-relaxed text-toga-800">
        <strong>Guarde este código: es la única forma de volver a entrar.</strong> Con él reanuda la
        carga de documentos y, una vez enviado, consulta el estado de su postulación. No se volverá
        a mostrar y nadie del Consejo se lo pedirá por teléfono.
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copiar()}
          className="inline-flex items-center gap-2 rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-50"
        >
          {copiado ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copiado ? "Copiado" : "Copiar código"}
        </button>
        <button
          type="button"
          onClick={descargar}
          className="inline-flex items-center gap-2 rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Descargar comprobante
        </button>
      </div>

      <label className="mt-6 flex items-start gap-2 text-sm text-toga-800">
        <input
          type="checkbox"
          checked={guardado}
          onChange={(e) => setGuardado(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-balanza-600"
        />
        Ya guardé mi código de acceso.
      </label>

      <button
        type="button"
        disabled={!guardado || pendiente}
        onClick={() => iniciar(onContinuar)}
        className="mt-4 rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
      >
        {pendiente ? "Abriendo…" : "Continuar con mis documentos"}
      </button>
    </section>
  );
}
