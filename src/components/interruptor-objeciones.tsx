"use client";

import { useState, useTransition } from "react";
import { cambiarLapsoObjeciones } from "@/app/(panel)/objeciones/acciones";
import { useToast } from "@/components/toast-provider";

/** Abre o cierra el botón «Objetar candidato» de la landing. */
export function InterruptorObjeciones({ abierto }: { readonly abierto: boolean }) {
  const toast = useToast();
  const [valor, setValor] = useState(abierto);
  const [pendiente, iniciar] = useTransition();

  function cambiar(siguiente: boolean) {
    const previo = valor;
    setValor(siguiente);
    iniciar(async () => {
      const r = await cambiarLapsoObjeciones(siguiente);
      if (!r.ok) {
        setValor(previo);
        toast.error(r.error ?? "No se pudo cambiar el lapso");
        return;
      }
      toast.exito(r.exito ?? "Lapso actualizado");
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-toga-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-toga-900">Lapso de objeciones</p>
        <p className="mt-0.5 text-xs text-toga-500">
          {valor
            ? "El sitio público muestra el botón de objetar."
            : "El sitio público no muestra el botón de objetar."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        disabled={pendiente}
        onClick={() => cambiar(!valor)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
          valor ? "bg-balanza-600" : "bg-toga-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition ${
            valor ? "translate-x-5" : "translate-x-0"
          }`}
        />
        <span className="sr-only">{valor ? "Cerrar lapso" : "Abrir lapso"}</span>
      </button>
    </div>
  );
}
