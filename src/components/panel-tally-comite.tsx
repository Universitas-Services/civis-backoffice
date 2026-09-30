"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RondaComiteAbierta } from "@/contracts";
import { forzarCierreSinQuorum } from "@/app/(panel)/comite/acciones";
import { useToast } from "@/components/toast-provider";

/** Progreso de ronda de elegibilidad — solo SUPER_ADMIN (incluye cierre sin quorum). */
export function PanelTallyComite({
  candidateId,
  ronda,
}: {
  readonly candidateId: string;
  readonly ronda: RondaComiteAbierta;
}) {
  const tally = ronda.tally;
  const toast = useToast();
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState(false);

  if (!tally) return null;

  function forzar() {
    iniciar(async () => {
      const r = await forzarCierreSinQuorum(ronda.id, candidateId);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo cerrar");
        return;
      }
      toast.exito(r.exito ?? "Ronda cerrada.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-toga-200 bg-white p-4 text-sm">
      <p className="font-semibold text-toga-900">Progreso del comité (solo superadmin)</p>
      <ul className="mt-2 space-y-1 text-toga-700">
        <li>
          Actuaciones:{" "}
          <span className="cifra font-medium">
            {tally.actuaciones}/{tally.quorumThreshold}
          </span>{" "}
          {tally.quorumMet ? "(quorum cumplido)" : "(sin quorum)"}
        </li>
        <li>
          Elegible / inelegible / recusado:{" "}
          <span className="cifra">
            {tally.elegibles} / {tally.inelegibles} / {tally.recusados}
          </span>
        </li>
        <li>
          Pendientes: <span className="cifra">{tally.pending}</span>
        </li>
      </ul>

      {!tally.quorumMet && (
        <div className="mt-3 border-t border-toga-100 pt-3">
          {confirmando ? (
            <div className="space-y-2">
              <p className="text-xs text-toga-600">
                Cierra la ronda sin dictamen para poder cambiar la modalidad de evaluación.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={forzar}
                  className="rounded-md bg-balanza-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {pendiente ? "Cerrando…" : "Confirmar cierre sin quorum"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  className="rounded-md border border-toga-300 px-3 py-1.5 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-medium text-toga-700 hover:bg-toga-50"
            >
              Cerrar ronda sin quorum
            </button>
          )}
        </div>
      )}
    </div>
  );
}
