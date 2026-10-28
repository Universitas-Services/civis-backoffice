"use client";

import { useState, useTransition } from "react";
import { retirarDelRankingPublico } from "@/app/(panel)/ranking/acciones";
import { useToast } from "@/components/toast-provider";

/**
 * Retira a todos los publicados del sitio público (solo SUPER_ADMIN; la API
 * lo exige). El ranking interno no cambia: se vuelven a enviar desde
 * «Ranking interno», donde también se retira a una persona.
 */
export function RetiroRankingPublico({ publicados }: { readonly publicados: number }) {
  const toast = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pendiente, iniciar] = useTransition();

  function retirar() {
    if (pendiente) return;
    iniciar(async () => {
      const r = await retirarDelRankingPublico(null, motivo);
      if (r.error) {
        toast.error(r.error);
        return;
      }
      toast.exito(r.exito ?? "Retirados del ranking público");
      setConfirmando(false);
      setMotivo("");
    });
  }

  return (
    <div className="rounded-lg border border-toga-200 bg-white px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-toga-900">Retirar a todos del ranking público</p>
          <p className="mt-1.5 text-base leading-relaxed text-toga-600">
            {publicados === 0 ? (
              "No hay nadie publicado: la landing no muestra postulantes."
            ) : (
              <>
                <span className="font-semibold text-toga-900">
                  {publicados === 1
                    ? "1 postulante publicado."
                    : `${publicados} postulantes publicados.`}
                </span>{" "}
                El sitio deja de mostrar el ranking y sus fichas. El ranking interno no cambia y se
                pueden volver a enviar desde «Ranking interno».
              </>
            )}
          </p>
        </div>
        {publicados > 0 && !confirmando && (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-semibold text-toga-800 hover:bg-toga-50"
          >
            Retirar a todos
          </button>
        )}
      </div>
      {confirmando && (
        <div className="mt-3 space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/40 p-3">
          <p className="text-sm text-toga-800">
            ¿Retirar del sitio público a los {publicados} publicados? El ranking público queda
            vacío.
          </p>
          <label className="block">
            <span className="text-sm font-medium text-toga-800">Motivo (queda en la bitácora)</span>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendiente || motivo.trim().length < 10}
              onClick={retirar}
              className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {pendiente ? "Retirando…" : "Confirmar retiro"}
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => setConfirmando(false)}
              className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
