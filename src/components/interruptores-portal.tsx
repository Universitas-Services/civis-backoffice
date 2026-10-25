"use client";

import { useState, useTransition } from "react";
import { cambiarInterruptor, type AjusteInterruptor } from "@/app/(panel)/ranking/acciones";
import { useToast } from "@/components/toast-provider";

export interface Interruptor {
  readonly ajuste: AjusteInterruptor;
  readonly titulo: string;
  readonly encendido: string;
  readonly apagado: string;
  readonly valor: boolean;
}

/**
 * Interruptores del portal que se manejan desde el ranking. La página decide
 * cuáles ve cada rol; la API vuelve a comprobar quién puede cambiar cada uno.
 */
export function InterruptoresPortal({ items }: { readonly items: readonly Interruptor[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="ajustes-ranking" className="space-y-3">
      <h2 id="ajustes-ranking" className="text-base font-semibold text-toga-900">
        Ajustes de objeciones y publicación
      </h2>
      {items.map((i) => (
        <FilaInterruptor key={i.ajuste} {...i} />
      ))}
    </section>
  );
}

function FilaInterruptor({ ajuste, titulo, encendido, apagado, valor: inicial }: Interruptor) {
  const toast = useToast();
  const [valor, setValor] = useState(inicial);
  const [pendiente, iniciar] = useTransition();

  function cambiar(siguiente: boolean) {
    const previo = valor;
    setValor(siguiente);
    iniciar(async () => {
      const r = await cambiarInterruptor(ajuste, siguiente);
      if (r.error) {
        setValor(previo);
        toast.error(r.error);
        return;
      }
      toast.exito(r.exito ?? "Ajuste actualizado");
    });
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-toga-200 bg-white px-4 py-4 sm:px-5">
      <div>
        <p className="text-sm font-semibold text-toga-900">{titulo}</p>
        <p className="mt-1.5 text-base leading-relaxed text-toga-600">
          <span className="font-semibold text-toga-900">
            {valor ? "Activado. " : "Desactivado. "}
          </span>
          {valor ? encendido : apagado}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        aria-label={titulo}
        disabled={pendiente}
        onClick={() => cambiar(!valor)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-out disabled:opacity-60 ${
          valor ? "bg-balanza-600" : "bg-toga-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
            valor ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
