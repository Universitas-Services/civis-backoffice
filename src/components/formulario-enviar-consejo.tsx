"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { enviarAlConsejo, type EstadoEnvioConsejo } from "@/app/(panel)/comite-objeciones/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";

function BotonConfirmar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Confirmar envío al Consejo"}
    </button>
  );
}

/**
 * Envío al Consejo con confirmación concreta. Sin descargo, el motivo es
 * obligatorio y el Consejo lo verá junto a la objeción.
 */
export function FormularioEnviarConsejo({
  objectionId,
  trackingCode,
  postulante,
  conDescargo,
}: {
  readonly objectionId: string;
  readonly trackingCode: string;
  readonly postulante: string;
  readonly conDescargo: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [estado, accion] = useActionState<EstadoEnvioConsejo, FormData>(
    enviarAlConsejo.bind(null, objectionId, conDescargo),
    {},
  );
  useToastDesdeEstado(estado);

  if (estado.enviada) return null;

  return (
    <form
      action={accion}
      className="space-y-3 rounded-lg border border-toga-200 bg-white p-4 sm:p-5"
    >
      <h2 className="text-base font-semibold text-toga-900">Enviar al Consejo</h2>
      {conDescargo ? (
        <p className="text-sm text-toga-600">
          El postulante ya presentó su descargo. El Consejo verá la objeción y el descargo juntos.
        </p>
      ) : (
        <>
          <p className="text-sm text-toga-600">
            Todavía no hay descargo. Puede esperar o enviarla igual explicando por qué; el Consejo
            verá ese motivo.
          </p>
          <label className="block">
            <span className="text-sm font-medium text-toga-800">
              Motivo para enviarla sin descargo
            </span>
            <textarea
              name="motivo"
              required
              minLength={10}
              maxLength={1000}
              rows={3}
              className="mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-base text-toga-900 focus:border-balanza-600"
              placeholder="P. ej.: se contactó al postulante el 20/10 y no respondió en el plazo acordado."
            />
          </label>
        </>
      )}

      {confirmando ? (
        <div className="space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/40 p-3">
          <p className="text-sm text-toga-800">
            ¿Enviar al Consejo la objeción{" "}
            <span className="codigo font-semibold">{trackingCode}</span> contra{" "}
            <span className="font-semibold">{postulante}</span>
            {conDescargo ? " con su descargo" : " sin descargo"}? Desde ese momento ya no se podrá
            cargar un descargo.
          </p>
          <div className="flex flex-wrap gap-2">
            <BotonConfirmar />
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="rounded-md border border-balanza-600 bg-white px-4 py-2 text-sm font-semibold text-balanza-700 hover:bg-balanza-50"
        >
          Enviar al Consejo
        </button>
      )}
    </form>
  );
}
