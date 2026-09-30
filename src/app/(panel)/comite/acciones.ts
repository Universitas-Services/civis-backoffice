"use server";

import { revalidatePath } from "next/cache";
import type {
  EvaluationRoundKind,
  ReopenCommitteeReason,
  RondaComiteAbierta,
  RondaEscaladaLista,
} from "@/contracts";
import { ErrorApi, llamarApi, llamarApiAccion } from "@/lib/api";

export type ResultadoComite = {
  readonly ok: boolean;
  readonly error?: string;
  readonly exito?: string;
};

export async function leerRondaAbierta(
  candidateId: string,
): Promise<RondaComiteAbierta | null> {
  try {
    return await llamarApi<RondaComiteAbierta | null>(
      `/internal/committee/rounds/${candidateId}/open`,
    );
  } catch (error) {
    if (error instanceof ErrorApi && error.status === 404) return null;
    throw error;
  }
}

export async function abrirRondaComite(
  candidateId: string,
  kind: EvaluationRoundKind,
  revalidate: string,
): Promise<ResultadoComite> {
  try {
    await llamarApiAccion(`/internal/committee/rounds/${candidateId}/open`, {
      method: "POST",
      body: { kind },
    });
    revalidatePath(revalidate);
    revalidatePath(`/baremo/${candidateId}`);
    revalidatePath(`/objeciones/baremo/${candidateId}`);
    const etiqueta =
      kind === "SCORING" ? "baremo" : kind === "OBJECTION" ? "objeción" : "elegibilidad";
    return { ok: true, exito: `Ronda de ${etiqueta} abierta.` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo abrir la ronda",
    };
  }
}

export async function abstenerseEnComite(
  roundId: string,
  candidateId: string,
  reason?: string,
): Promise<ResultadoComite> {
  try {
    await llamarApiAccion(`/internal/committee/rounds/${roundId}/abstain`, {
      method: "POST",
      body: reason ? { reason } : {},
    });
    revalidatePath(`/baremo/${candidateId}`);
    revalidatePath(`/objeciones/baremo/${candidateId}`);
    revalidatePath("/baremo");
    revalidatePath("/ranking");
    return { ok: true, exito: "Abstención registrada. No entra en el promedio." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo registrar la abstención",
    };
  }
}

export async function votarInelegibleEnObjeccion(
  roundId: string,
  candidateId: string,
  motivation: string,
): Promise<ResultadoComite> {
  const motivo = motivation.trim();
  if (motivo.length < 20) {
    return { ok: false, error: "La motivación debe tener al menos 20 caracteres" };
  }
  try {
    await llamarApiAccion(`/internal/committee/rounds/${roundId}/objection-ineligible`, {
      method: "POST",
      body: { motivation: motivo },
    });
    revalidatePath(`/objeciones/baremo/${candidateId}`);
    revalidatePath("/objeciones");
    revalidatePath("/baremo");
    revalidatePath("/ranking");
    return {
      ok: true,
      exito: "Voto de inelegibilidad registrado. Si se alcanza el quorum, el postulante queda inelegible.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo registrar el voto",
    };
  }
}

export async function forzarCierreRonda(
  roundId: string,
  candidateId: string,
): Promise<ResultadoComite> {
  try {
    await llamarApiAccion(`/internal/committee/rounds/${roundId}/close-check`, {
      method: "POST",
      body: {},
    });
    revalidatePath(`/baremo/${candidateId}`);
    revalidatePath(`/objeciones/baremo/${candidateId}`);
    revalidatePath("/baremo");
    revalidatePath("/ranking");
    return { ok: true, exito: "Se intentó el cierre de la ronda." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo cerrar la ronda",
    };
  }
}

export async function forzarCierreSinQuorum(
  roundId: string,
  candidateId: string,
): Promise<ResultadoComite> {
  try {
    await llamarApiAccion(`/internal/committee/rounds/${roundId}/force-close`, {
      method: "POST",
      body: {},
    });
    revalidatePath("/evaluacion");
    revalidatePath(`/evaluacion/${candidateId}`);
    revalidatePath("/usuarios");
    return {
      ok: true,
      exito: "Ronda cerrada sin quorum. Ya puede cambiar la modalidad si no quedan otras abiertas.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo forzar el cierre",
    };
  }
}

export async function leerRondaEscalada(
  candidateId: string,
): Promise<RondaComiteAbierta | null> {
  try {
    return await llamarApi<RondaComiteAbierta | null>(
      `/internal/committee/rounds/${candidateId}/escalated`,
    );
  } catch (error) {
    if (error instanceof ErrorApi && (error.status === 404 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export async function listarRondasEscaladas(): Promise<readonly RondaEscaladaLista[]> {
  try {
    return await llamarApi<readonly RondaEscaladaLista[]>(
      "/internal/committee/rounds/escalated",
    );
  } catch (error) {
    if (error instanceof ErrorApi && (error.status === 403 || error.status === 404)) {
      return [];
    }
    throw error;
  }
}

export async function reabrirRondaEscalada(
  roundId: string,
  candidateId: string,
  reason: ReopenCommitteeReason,
): Promise<ResultadoComite> {
  try {
    await llamarApiAccion(`/internal/committee/rounds/${roundId}/reopen`, {
      method: "POST",
      body: { reason },
    });
    revalidatePath("/evaluacion");
    revalidatePath(`/evaluacion/${candidateId}`);
    const etiqueta = reason === "TIE" ? "empate" : "plazo vencido";
    return {
      ok: true,
      exito: `Ronda reabierta por ${etiqueta}. Se notificó a los evaluadores activos.`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ErrorApi ? error.message : "No se pudo reabrir la ronda",
    };
  }
}
