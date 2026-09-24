"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { declararInelegible } from "@/app/(panel)/objeciones/acciones";
import { useToast } from "@/components/toast-provider";

export function DeclararInelegible({
  evaluationId,
  nombre,
  yaInelegible,
}: {
  readonly evaluationId: string;
  readonly nombre: string;
  readonly yaInelegible: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pendiente, iniciar] = useTransition();
  const toast = useToast();
  const router = useRouter();

  if (yaInelegible) return null;

  function confirmar() {
    const texto = motivo.trim();
    if (texto.length < 20) {
      toast.error("La motivación es obligatoria (mínimo 20 caracteres).");
      return;
    }
    if (texto.length > 3000) {
      toast.error("La motivación no puede superar 3000 caracteres.");
      return;
    }
    if (pendiente) return;
    iniciar(async () => {
      const r = await declararInelegible(evaluationId, texto);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo declarar la inelegibilidad");
        return;
      }
      setAbierto(false);
      setMotivo("");
      toast.exito(r.exito ?? "Quedó inelegible y ya no aparece en los rankings.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-toga-200 bg-white px-4 py-4">
      <h2 className="text-sm font-semibold text-toga-900">Inelegibilidad</h2>
      <p className="mt-1 text-sm text-toga-600">
        Si las objeciones lo justifican, {nombre} deja de aparecer en el ranking interno y en el
        público.
      </p>
      {!abierto ? (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="mt-3 rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
        >
          Declarar inelegible
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="motivo-inelegible"
              className="block text-sm font-semibold text-toga-900"
            >
              Fundamentación
            </label>
            <p className="mt-1 text-xs text-toga-500">Obligatoria (entre 20 y 3000 caracteres).</p>
            <textarea
              id="motivo-inelegible"
              rows={4}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Fundamentación jurídica del dictamen…"
              className="mt-2 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400 focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendiente}
              onClick={confirmar}
              className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {pendiente ? "Registrando…" : "Confirmar inelegibilidad"}
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => setAbierto(false)}
              className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
