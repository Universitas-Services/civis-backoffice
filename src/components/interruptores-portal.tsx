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
  /** Pide confirmación antes de encender (decisiones de alto impacto). */
  readonly confirmarAlEncender?: string;
}

/**
 * Interruptores del portal. La página decide cuáles ve cada rol; la API
 * vuelve a comprobar quién puede cambiar cada uno.
 */
export function InterruptoresPortal({
  items,
  titulo = "Ajustes de objeciones y publicación",
  id = "ajustes-ranking",
}: {
  readonly items: readonly Interruptor[];
  readonly titulo?: string;
  readonly id?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-base font-semibold text-toga-900">
        {titulo}
      </h2>
      {items.map((i) => (
        <FilaInterruptor key={i.ajuste} {...i} />
      ))}
    </section>
  );
}

function FilaInterruptor({
  ajuste,
  titulo,
  encendido,
  apagado,
  valor: inicial,
  confirmarAlEncender,
}: Interruptor) {
  const toast = useToast();
  const [valor, setValor] = useState(inicial);
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, iniciar] = useTransition();

  function pulsar() {
    if (!valor && confirmarAlEncender) {
      setConfirmando(true);
      return;
    }
    cambiar(!valor);
  }

  function cambiar(siguiente: boolean) {
    setConfirmando(false);
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
    <div className="rounded-lg border border-toga-200 bg-white px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-4">
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
          onClick={pulsar}
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
      {confirmando && confirmarAlEncender && (
        <div className="mt-3 space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/40 p-3">
          <p className="text-sm text-toga-800">{confirmarAlEncender}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cambiar(true)}
              className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
            >
              Confirmar
            </button>
            <button
              type="button"
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
