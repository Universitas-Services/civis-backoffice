"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const MENSAJES = [
  "Leyendo el expediente…",
  "Analizando documentos…",
  "Preparando la redacción…",
  "Redactando el informe…",
  "Revisando el texto…",
] as const;

/**
 * Barra de progreso ficticia mientras la IA responde.
 * No refleja avance real: avanza por temporizador y se detiene cerca del 90 %.
 */
export function CargaIa({
  activo,
  etiqueta = "Generando con IA",
}: {
  readonly activo: boolean;
  readonly etiqueta?: string;
}) {
  const [progreso, setProgreso] = useState(8);
  const [indiceMsg, setIndiceMsg] = useState(0);

  useEffect(() => {
    if (!activo) {
      setProgreso(8);
      setIndiceMsg(0);
      return;
    }

    const tickProgreso = window.setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 90) return prev;
        const salto = prev < 40 ? 7 : prev < 70 ? 4 : 2;
        return Math.min(90, prev + salto);
      });
    }, 1500);

    const tickMensaje = window.setInterval(() => {
      setIndiceMsg((i) => (i + 1) % MENSAJES.length);
    }, 3200);

    return () => {
      window.clearInterval(tickProgreso);
      window.clearInterval(tickMensaje);
    };
  }, [activo]);

  if (!activo) return null;

  const mensaje = MENSAJES[indiceMsg] ?? MENSAJES[0];

  return (
    <div className="m-auto flex w-full max-w-md flex-col gap-4 py-8" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-medium text-toga-800">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-balanza-50 text-balanza-700 ring-1 ring-balanza-600/15">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="flex items-center gap-2">
          {etiqueta}
          <Spinner className="h-3.5 w-3.5 text-balanza-600" />
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-toga-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progreso)}
        aria-label={etiqueta}
      >
        <div
          className="h-full rounded-full bg-balanza-600 transition-[width] duration-700 ease-out"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <p className="text-sm text-toga-600">{mensaje}</p>
      <p className="text-xs text-toga-500">
        Esto puede tardar unos minutos. No cierre esta ventana.
      </p>
    </div>
  );
}
