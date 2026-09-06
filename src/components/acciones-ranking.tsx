"use client";

import { useState, useTransition } from "react";
import type { ResultadoRanking } from "@/contracts";
import {
  recalcularRanking,
  vistaPreviaPublica,
  type EstadoRanking,
} from "@/app/(panel)/ranking/acciones";

/**
 * Acciones sobre el ranking interno.
 *
 * La vista previa importa más de lo que parece: el ranking interno incluye a
 * todos los evaluados, y el público sólo a los que tienen ficha publicada.
 * Confundir uno con otro llevaría a anunciar posiciones que nadie verá.
 */
export function AccionesRanking({ puedePublicar }: { readonly puedePublicar: boolean }) {
  const [pendiente, iniciar] = useTransition();
  const [estado, setEstado] = useState<EstadoRanking>({});

  return (
    <section className="rounded-lg border border-toga-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pendiente}
          onClick={() => iniciar(async () => setEstado(await vistaPreviaPublica()))}
          className="rounded-md border border-toga-300 px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-60"
        >
          {pendiente ? "Cargando…" : "Ver la previa pública"}
        </button>
        {puedePublicar && (
          <button
            type="button"
            disabled={pendiente}
            onClick={() => iniciar(async () => setEstado(await recalcularRanking()))}
            className="rounded-md border border-toga-300 px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-60"
          >
            Recalcular y registrar
          </button>
        )}
        <p className="text-xs text-toga-500">
          La previa muestra sólo a quienes ya tienen ficha publicada.
        </p>
      </div>

      {estado.exito && (
        <p
          role="status"
          className="mt-3 rounded-md border border-validado-700/20 bg-validado-50 px-4 py-3 text-sm text-validado-700"
        >
          {estado.exito}
        </p>
      )}
      {estado.error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {estado.error}
        </p>
      )}

      {estado.previa && <TablaPrevia previa={estado.previa} />}
    </section>
  );
}

function TablaPrevia({ previa }: { readonly previa: ResultadoRanking }) {
  const enCompetencia = previa.entries.filter((e) => e.position !== null);

  return (
    <div className="mt-4 rounded-lg border-2 border-dashed border-toga-300 bg-toga-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-toga-500">
        Así se vería el ranking público
      </p>
      {enCompetencia.length === 0 ? (
        <p className="mt-2 text-sm text-toga-500">
          Ningún postulante tiene todavía su ficha publicada, así que el ranking público saldría
          vacío.
        </p>
      ) : (
        <ol className="mt-2 space-y-1 text-sm">
          {enCompetencia.map((e) => (
            <li key={e.publicId} className="flex justify-between gap-4">
              <span className="text-toga-700">
                <span className="cifra font-semibold text-toga-900">{e.position}</span>
                {e.tied && <span className="ml-1.5 text-xs text-balanza-700">empate</span>}{" "}
                {e.fullName}
              </span>
              <span className="cifra text-toga-900">{e.total}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-xs text-toga-500">
        {previa.eligibleCount} en competencia · {previa.ineligibleCount} fuera
      </p>
    </div>
  );
}
