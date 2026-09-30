"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EvaluationRoundKind, RondaComiteAbierta, RoundParticipantAction } from "@/contracts";
import {
  abrirRondaComite,
  abstenerseEnComite,
  forzarCierreRonda,
  votarInelegibleEnObjeccion,
} from "@/app/(panel)/comite/acciones";
import { useToast } from "@/components/toast-provider";

const ACCION_ETIQUETA: Record<RoundParticipantAction, string> = {
  PENDING: "Pendiente",
  SCORED: "Puntuó",
  ABSTAINED: "Se abstuvo",
  NO_SHOW: "No compareció",
  RECUSED: "Recusado",
  VOTED_INELIGIBLE: "Votó inelegible",
};

const KIND_ETIQUETA: Record<EvaluationRoundKind, string> = {
  ELIGIBILITY: "Elegibilidad",
  SCORING: "Baremo",
  OBJECTION: "Objeción",
};

/**
 * Panel de ronda de comité: estado de participantes, abrir ronda, abstenerse
 * y (en objeción) votar inelegible.
 */
export function PanelRondaComite({
  candidateId,
  kindEsperado,
  ronda,
  usuarioId,
  puedeAbrir,
  puedeForzarCierre,
  rutaRevalidate,
  consolidada = false,
}: {
  readonly candidateId: string;
  readonly kindEsperado: "SCORING" | "OBJECTION";
  readonly ronda: RondaComiteAbierta | null;
  readonly usuarioId: string;
  readonly puedeAbrir: boolean;
  readonly puedeForzarCierre: boolean;
  readonly rutaRevalidate: string;
  /** Nota ya consolidada (EVALUATED): no ofrecer abrir ronda. */
  readonly consolidada?: boolean;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [motivoInelegible, setMotivoInelegible] = useState("");
  const [confirmandoAbstencion, setConfirmandoAbstencion] = useState(false);

  const rondaUtil =
    ronda && ronda.status === "OPEN" && (ronda.kind === kindEsperado || ronda.kind === "OBJECTION")
      ? ronda
      : null;
  const miParticipacion = rondaUtil?.participants.find((p) => p.evaluatorId === usuarioId);
  const yaActue =
    miParticipacion &&
    miParticipacion.action !== "PENDING" &&
    miParticipacion.action !== undefined;
  const puedoActuar = Boolean(rondaUtil && miParticipacion && !yaActue);

  function abrir() {
    iniciar(async () => {
      const r = await abrirRondaComite(candidateId, kindEsperado, rutaRevalidate);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo abrir la ronda");
        return;
      }
      toast.exito(r.exito ?? "Ronda abierta.");
    });
  }

  function abstenerse() {
    if (!rondaUtil) return;
    iniciar(async () => {
      const r = await abstenerseEnComite(rondaUtil.id, candidateId);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo abstener");
        return;
      }
      setConfirmandoAbstencion(false);
      toast.exito(r.exito ?? "Abstención registrada.");
      router.push(kindEsperado === "OBJECTION" ? "/objeciones" : "/baremo");
      router.refresh();
    });
  }

  function votarInelegible() {
    if (!rondaUtil) return;
    iniciar(async () => {
      const r = await votarInelegibleEnObjeccion(rondaUtil.id, candidateId, motivoInelegible);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo registrar");
        return;
      }
      setMotivoInelegible("");
      toast.exito(r.exito ?? "Voto registrado.");
    });
  }

  function forzar() {
    if (!rondaUtil) return;
    iniciar(async () => {
      const r = await forzarCierreRonda(rondaUtil.id, candidateId);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo cerrar");
        return;
      }
      toast.exito(r.exito ?? "Cierre intentado.");
    });
  }

  if (!rondaUtil) {
    if (consolidada) {
      return (
        <div className="rounded-lg border border-toga-200 bg-toga-50/60 px-4 py-3">
          <p className="text-sm font-semibold text-toga-900">
            Comité — ronda de {KIND_ETIQUETA[kindEsperado].toLowerCase()} cerrada
          </p>
          <p className="mt-1 text-sm leading-relaxed text-toga-700">
            La nota del comité ya está consolidada. Consulte el Ranking interno; no hace falta
            abrir otra ronda de baremo.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-balanza-600/25 bg-balanza-50/50 px-4 py-3">
        <p className="text-sm font-semibold text-toga-900">
          Comité — ronda de {KIND_ETIQUETA[kindEsperado].toLowerCase()}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-toga-700">
          {kindEsperado === "SCORING"
            ? "Todavía no hay ronda de baremo abierta. Al abrir el borrador se intenta abrir sola; si falla, un administrador debe abrirla."
            : "Tras las objeciones, un administrador (o superadministrador) debe abrir la ronda para que el comité mantenga o cambie la nota, o vote inelegible."}
        </p>
        {puedeAbrir && (
          <button
            type="button"
            disabled={pendiente}
            onClick={abrir}
            className="mt-3 rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
          >
            {pendiente ? "Abriendo…" : `Abrir ronda de ${KIND_ETIQUETA[kindEsperado].toLowerCase()}`}
          </button>
        )}
      </div>
    );
  }

  const pendientes = rondaUtil.participants.filter((p) => p.action === "PENDING").length;
  const plazo = rondaUtil.deadlineAt
    ? new Date(rondaUtil.deadlineAt).toLocaleString("es-VE", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="rounded-lg border border-toga-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-toga-900">
            Ronda de {KIND_ETIQUETA[rondaUtil.kind]} (comité)
          </p>
          <p className="mt-1 text-xs text-toga-500">
            Quorum {rondaUtil.quorumThreshold}
            {plazo ? ` · Cierra ${plazo}` : ""}
            {` · ${pendientes} pendiente${pendientes === 1 ? "" : "s"}`}
          </p>
        </div>
        {puedeForzarCierre && (
          <button
            type="button"
            disabled={pendiente}
            onClick={forzar}
            className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-50 disabled:opacity-60"
          >
            Intentar cierre
          </button>
        )}
      </div>

      <ul className="mt-3 divide-y divide-toga-100 text-sm">
        {rondaUtil.participants.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 py-1.5">
            <span className="text-toga-800">
              {p.evaluator.fullName}
              {p.evaluatorId === usuarioId ? " (usted)" : ""}
            </span>
            <span className="text-xs text-toga-500">
              {ACCION_ETIQUETA[p.action] ?? p.action}
            </span>
          </li>
        ))}
      </ul>

      {miParticipacion && yaActue && (
        <p className="mt-3 text-sm text-toga-600">
          Ya actuó en esta ronda: {ACCION_ETIQUETA[miParticipacion.action]}.
        </p>
      )}

      {puedoActuar && (
        <div className="mt-3 space-y-3 border-t border-toga-100 pt-3">
          {!confirmandoAbstencion ? (
            <button
              type="button"
              disabled={pendiente}
              onClick={() => setConfirmandoAbstencion(true)}
              className="w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-semibold text-toga-800 hover:bg-toga-50 disabled:opacity-60"
            >
              Abstenerse de puntuar
            </button>
          ) : (
            <div className="rounded-md border border-toga-200 bg-toga-50/60 p-3">
              <p className="text-sm text-toga-800">
                ¿Confirma abstenerse? Su nota no entrará en el promedio del comité.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={abstenerse}
                  className="rounded-md bg-balanza-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
                >
                  {pendiente ? "…" : "Confirmar abstención"}
                </button>
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => setConfirmandoAbstencion(false)}
                  className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {rondaUtil.kind === "OBJECTION" && (
            <div className="space-y-2">
              <label className="block text-sm">
                <span className="font-medium text-toga-800">Votar inelegible (objeción)</span>
                <textarea
                  rows={3}
                  value={motivoInelegible}
                  onChange={(e) => setMotivoInelegible(e.target.value)}
                  placeholder="Motivación (mínimo 20 caracteres)"
                  className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={pendiente || motivoInelegible.trim().length < 20}
                onClick={votarInelegible}
                className="w-full rounded-md border border-balanza-600 bg-white px-3 py-2 text-sm font-semibold text-balanza-700 hover:bg-balanza-50 disabled:opacity-60"
              >
                {pendiente ? "Registrando…" : "Votar inelegible"}
              </button>
            </div>
          )}
        </div>
      )}

      {!miParticipacion && (
        <p className="mt-3 text-sm text-toga-600">
          No figura en los participantes congelados de esta ronda.
        </p>
      )}
    </div>
  );
}
