"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReopenCommitteeReason, RondaComiteAbierta, RoundParticipantAction } from "@/contracts";
import { reabrirRondaEscalada } from "@/app/(panel)/comite/acciones";
import { useToast } from "@/components/toast-provider";

const ACCION_ETIQUETA: Record<RoundParticipantAction, string> = {
  PENDING: "Pendiente",
  SCORED: "Actuó",
  ABSTAINED: "Se abstuvo",
  NO_SHOW: "No compareció",
  RECUSED: "Recusado",
  VOTED_INELIGIBLE: "Votó inelegible",
};

function motivoEscalada(result: unknown): { reason: ReopenCommitteeReason | null; texto: string } {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return { reason: null, texto: "La ronda requiere reapertura administrativa." };
  }
  const r = result as { reason?: unknown; elegibles?: unknown; inelegibles?: unknown };
  if (r.reason === "TIE") {
    return {
      reason: "TIE",
      texto: `Empate en votos decisivos (${String(r.elegibles ?? "?")} elegible / ${String(r.inelegibles ?? "?")} inelegible). Reabra la ronda para que el comité vote de nuevo.`,
    };
  }
  if (r.reason === "DEADLINE") {
    return {
      reason: "DEADLINE",
      texto: "Venció el plazo sin resolverse el quorum o el veredicto. Reabra la ronda para un nuevo ciclo de votos.",
    };
  }
  return { reason: null, texto: "La ronda requiere reapertura administrativa." };
}

/**
 * Resolución administrativa de elegibilidad escalada: solo reapertura (empate / plazo).
 */
export function PanelResolucionEscalada({
  candidateId,
  ronda,
}: {
  readonly candidateId: string;
  readonly ronda: RondaComiteAbierta;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pendiente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState<ReopenCommitteeReason | null>(null);
  const { reason, texto } = motivoEscalada(ronda.result);

  function reabrir(motivo: ReopenCommitteeReason) {
    iniciar(async () => {
      const r = await reabrirRondaEscalada(ronda.id, candidateId, motivo);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo reabrir la ronda");
        return;
      }
      toast.exito(r.exito ?? "Ronda reabierta.");
      setConfirmando(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-balanza-600/30 bg-balanza-50/50 p-4">
      <div>
        <p className="text-sm font-semibold text-toga-900">
          Ronda escalada —{" "}
          {reason === "TIE" ? "empate" : reason === "DEADLINE" ? "plazo vencido" : "reapertura"}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-toga-700">{texto}</p>
      </div>

      <ul className="divide-y divide-toga-100 rounded-md border border-toga-200 bg-white text-sm">
        {ronda.participants.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-1.5">
            <span className="text-toga-800">{p.evaluator.fullName}</span>
            <span className="text-xs text-toga-500">
              {ACCION_ETIQUETA[p.action] ?? p.action}
            </span>
          </li>
        ))}
      </ul>

      {confirmando ? (
        <div className="space-y-2 rounded-md border border-toga-200 bg-white p-3">
          <p className="text-sm text-toga-800">
            Se abrirá una ronda nueva y se notificará a los evaluadores activos (
            {confirmando === "TIE" ? "por empate" : "por plazo vencido"}).
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendiente}
              onClick={() => reabrir(confirmando)}
              className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {pendiente ? "Reabriendo…" : "Confirmar reapertura"}
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => setConfirmando(null)}
              className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled={pendiente || (reason !== null && reason !== "TIE")}
            onClick={() => setConfirmando("TIE")}
            className="w-full rounded-md bg-balanza-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
          >
            Reabrir por empate
          </button>
          <button
            type="button"
            disabled={pendiente || (reason !== null && reason !== "DEADLINE")}
            onClick={() => setConfirmando("DEADLINE")}
            className="w-full rounded-md border border-balanza-600 bg-white px-3 py-2.5 text-sm font-semibold text-balanza-700 hover:bg-balanza-50 disabled:opacity-60"
          >
            Reabrir por plazo vencido
          </button>
        </div>
      )}
    </div>
  );
}
