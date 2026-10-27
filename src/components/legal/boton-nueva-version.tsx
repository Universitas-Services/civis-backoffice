"use client";

import { useTransition } from "react";
import type { TipoDocumentoLegal } from "@/contracts";
import { crearBorradorLegal } from "@/app/(panel)/documentos-legales/acciones";
import { useToast } from "@/components/toast-provider";

/** Crea el borrador de la siguiente versión y abre el editor. */
export function BotonNuevaVersion({
  kind,
  texto,
}: {
  readonly kind: TipoDocumentoLegal;
  readonly texto: string;
}) {
  const [pendiente, iniciar] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={pendiente}
      onClick={() =>
        iniciar(async () => {
          const estado = await crearBorradorLegal(kind);
          if (estado?.error) toast.error(estado.error);
        })
      }
      className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pendiente ? "Preparando…" : texto}
    </button>
  );
}
