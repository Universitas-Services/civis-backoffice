"use client";

import { useTransition } from "react";
import { prepararRanking } from "@/app/(panel)/publicaciones/acciones";
import { useToast } from "@/components/toast-provider";

export function BotonPrepararRanking() {
  const [pendiente, iniciar] = useTransition();
  const toast = useToast();

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          iniciar(async () => {
            const r = await prepararRanking();
            if (r.error) toast.error(r.error);
            else if (r.exito) toast.exito(r.exito);
          })
        }
        className="rounded-md border border-toga-300 bg-white px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-60"
      >
        {pendiente ? "Preparando…" : "Preparar ranking público"}
      </button>
    </div>
  );
}
