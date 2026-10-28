"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  decidirObjecion,
  pronunciarAdmision,
  type EstadoActoComite,
} from "@/app/(panel)/comite-objeciones/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";

type Acto = "ADMITIR" | "INADMITIR" | "CON_LUGAR" | "SIN_LUGAR";

const TEXTO: Record<Acto, { boton: string; confirmar: string; efecto: string }> = {
  ADMITIR: {
    boton: "Admitir",
    confirmar: "Confirmar admisión",
    efecto:
      "Se dicta el auto de admisión. Al notificarse, el postulado (o la secretaría) recibe el auto y la denuncia, sin revelar quién objetó, y desde ese momento corre su plazo de descargo.",
  },
  INADMITIR: {
    boton: "Inadmitir",
    confirmar: "Confirmar inadmisión",
    efecto:
      "Se dicta el auto de inadmisión. Al notificarse lo recibe sólo la persona objetante; el postulado nunca verá esta objeción.",
  },
  CON_LUGAR: {
    boton: "Con lugar",
    confirmar: "Confirmar: con lugar",
    efecto:
      "Se dicta el auto con lugar, la objeción pasa al Consejo (que declara la inelegibilidad o ajusta el puntaje) y se notifica al postulado y a la persona objetante.",
  },
  SIN_LUGAR: {
    boton: "Sin lugar",
    confirmar: "Confirmar: sin lugar",
    efecto:
      "Se dicta el auto sin lugar, se ratifica la elegibilidad del postulado y se notifica a ambas partes.",
  },
};

function BotonConfirmar({ texto }: { readonly texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Dictando el auto…" : texto}
    </button>
  );
}

function Formulario({
  objectionId,
  acto,
  trackingCode,
  postulante,
  notificacion,
  extemporaneo,
  onCancelar,
}: {
  readonly objectionId: string;
  readonly acto: Acto;
  readonly trackingCode: string;
  readonly postulante: string;
  readonly notificacion?: string;
  readonly extemporaneo: boolean;
  readonly onCancelar: () => void;
}) {
  const accion =
    acto === "ADMITIR" || acto === "INADMITIR"
      ? pronunciarAdmision.bind(null, objectionId, acto === "ADMITIR")
      : decidirObjecion.bind(null, objectionId, acto);
  const [estado, enviar] = useActionState<EstadoActoComite, FormData>(accion, {});
  useToastDesdeEstado(estado);
  if (estado.hecho) return null;

  return (
    <form action={enviar} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-toga-800">
          Consideraciones adicionales <span className="font-normal text-toga-500">(opcional)</span>
        </span>
        <span className="mt-0.5 block text-xs text-toga-500">
          El auto ya trae su fundamentación completa. Lo que escriba aquí se añade al auto.
        </span>
        <textarea
          name="consideraciones"
          maxLength={3000}
          rows={3}
          className="mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-base text-toga-900 focus:border-balanza-600"
        />
      </label>
      {extemporaneo && (
        <label className="block">
          <span className="text-sm font-medium text-toga-800">Motivo de fuerza mayor</span>
          <span className="mt-0.5 block text-xs text-toga-500">
            El plazo venció. Explique el caso fortuito que impidió pronunciarse a tiempo (mínimo 20
            caracteres). Queda en el auto y en la bitácora.
          </span>
          <textarea
            name="motivoExtemporaneo"
            required
            minLength={20}
            maxLength={2000}
            rows={3}
            className="mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-base text-toga-900 focus:border-balanza-600"
          />
        </label>
      )}
      <div className="space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/40 p-3">
        <p className="text-sm text-toga-800">
          Objeción <span className="codigo font-semibold">{trackingCode}</span> contra{" "}
          <span className="font-semibold">{postulante}</span>. {TEXTO[acto].efecto}{" "}
          {notificacion && <strong>{notificacion} </strong>}El auto no se puede modificar después.
        </p>
        <div className="flex flex-wrap gap-2">
          <BotonConfirmar texto={TEXTO[acto].confirmar} />
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

/**
 * Pronunciamiento del comité: admisión (admitir o inadmitir) o decisión final
 * (con lugar o sin lugar). Cada acto dicta un auto en PDF. Fuera de plazo pide
 * el motivo de fuerza mayor.
 */
export function FormularioActoComite({
  objectionId,
  fase,
  trackingCode,
  postulante,
  titulo,
  ayuda,
  notificacion,
  extemporaneo = false,
}: {
  readonly objectionId: string;
  readonly fase: "ADMISION" | "DECISION";
  readonly trackingCode: string;
  readonly postulante: string;
  readonly titulo: string;
  readonly ayuda: string;
  /** Cuándo se notifica el acto, si no es en el momento. */
  readonly notificacion?: string;
  /** El plazo venció: se pide el motivo de fuerza mayor. */
  readonly extemporaneo?: boolean;
}) {
  const [acto, setActo] = useState<Acto | null>(null);
  const opciones: readonly Acto[] =
    fase === "ADMISION" ? ["ADMITIR", "INADMITIR"] : ["CON_LUGAR", "SIN_LUGAR"];

  return (
    <div className="space-y-3 rounded-lg border border-toga-200 bg-white p-4 sm:p-5">
      <h2 className="text-base font-semibold text-toga-900">{titulo}</h2>
      <p className="text-sm text-toga-600">{ayuda}</p>
      {acto ? (
        <Formulario
          // Una instancia por acto: cambiar de opción reinicia el formulario.
          key={acto}
          objectionId={objectionId}
          acto={acto}
          trackingCode={trackingCode}
          postulante={postulante}
          notificacion={notificacion}
          extemporaneo={extemporaneo}
          onCancelar={() => setActo(null)}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {opciones.map((o, i) => (
            <button
              key={o}
              type="button"
              onClick={() => setActo(o)}
              className={
                i === 0
                  ? "rounded-md border border-balanza-600 bg-white px-4 py-2 text-sm font-semibold text-balanza-700 hover:bg-balanza-50"
                  : "rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
              }
            >
              {TEXTO[o].boton}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
