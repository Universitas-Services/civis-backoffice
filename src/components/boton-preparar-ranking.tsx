"use client";

import { useState, useTransition } from "react";
import { prepararRanking } from "@/app/(panel)/publicaciones/acciones";

export function BotonPrepararRanking() {
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          iniciar(async () => {
            const r = await prepararRanking();
            setMensaje({ texto: r.error ?? r.exito ?? "", error: Boolean(r.error) });
          })
        }
        className="rounded-md border border-toga-300 bg-white px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-60"
      >
        {pendiente ? "Preparando…" : "Preparar ranking público"}
      </button>
      {mensaje && (
        <p
          role="status"
          className={`mt-2 max-w-xs text-xs ${mensaje.error ? "text-balanza-700" : "text-validado-700"}`}
        >
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
