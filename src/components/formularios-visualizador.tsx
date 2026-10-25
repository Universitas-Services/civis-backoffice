"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CAUSA_DENUNCIA_ETIQUETA } from "@/contracts";
import {
  objetar,
  opinar,
  type EstadoObjecion,
  type EstadoRanking,
} from "@/app/(panel)/ranking/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";

const CAUSALES = Object.entries(CAUSA_DENUNCIA_ETIQUETA);

function BotonEnvio({ texto, cargando }: { readonly texto: string; readonly cargando: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? cargando : texto}
    </button>
  );
}

/** Comentario del visualizador. No se edita ni se borra una vez enviado. */
export function FormularioOpinion({ candidateId }: { readonly candidateId: string }) {
  const [estado, accion] = useActionState<EstadoRanking, FormData>(
    opinar.bind(null, candidateId),
    {},
  );
  useToastDesdeEstado(estado);
  const formulario = useRef<HTMLFormElement>(null);

  // Cada envío devuelve un estado nuevo; si salió bien, se vacía el campo.
  useEffect(() => {
    if (estado.exito) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} action={accion} className="space-y-3">
      <label htmlFor="opinion" className="block text-sm font-medium text-toga-800">
        Su opinión
      </label>
      <textarea
        id="opinion"
        name="body"
        rows={4}
        required
        minLength={10}
        maxLength={2000}
        className="w-full rounded-md border border-toga-300 px-3 py-2 text-base"
      />
      <p className="text-xs text-toga-500">
        La verán los demás visualizadores y el equipo del proceso. Las opiniones no modifican el
        puntaje ni se pueden borrar.
      </p>
      {estado.error && (
        <p role="alert" className="text-sm text-objetado-600">
          {estado.error}
        </p>
      )}
      <BotonEnvio texto="Publicar opinión" cargando="Enviando…" />
    </form>
  );
}

/**
 * Objeción formal. La identidad la pone el servidor desde la sesión, así que
 * no se pide nombre, cédula, correo ni código. Antes de enviar se confirma
 * con el nombre del postulante y las causales marcadas.
 */
export function FormularioObjecion({
  candidateId,
  postulante,
}: {
  readonly candidateId: string;
  readonly postulante: string;
}) {
  const [estado, accion] = useActionState<EstadoObjecion, FormData>(
    objetar.bind(null, candidateId),
    {},
  );
  useToastDesdeEstado(estado);
  const [causas, setCausas] = useState<readonly string[]>([]);
  const [confirmando, setConfirmando] = useState(false);

  if (estado.trackingCode) {
    return (
      <div className="rounded-lg border border-validado-600/30 bg-validado-50 p-4">
        <p className="text-sm font-semibold text-toga-900">Objeción registrada</p>
        <p className="mt-1 text-sm text-toga-700">
          Código de seguimiento: <span className="codigo font-semibold">{estado.trackingCode}</span>
        </p>
        <p className="mt-1 text-sm text-toga-600">
          Puede consultar su estado más abajo, en «Mis objeciones a este postulante».
        </p>
      </div>
    );
  }

  function alternar(causa: string) {
    setConfirmando(false);
    setCausas((prev) =>
      prev.includes(causa) ? prev.filter((c) => c !== causa) : [...prev, causa],
    );
  }

  const otra = causas.includes("OTHER");

  return (
    <form action={accion} className="space-y-4 rounded-lg border border-toga-200 bg-white p-4">
      <div>
        <label htmlFor="cedula-objetante" className="block text-sm font-medium text-toga-800">
          Su cédula de identidad <span className="text-balanza-700">*</span>
        </label>
        <div className="mt-1 flex w-fit max-w-full gap-2">
          <select
            name="cedulaPrefijo"
            aria-label="Tipo de cédula"
            defaultValue="V"
            className="rounded-md border border-toga-300 bg-white px-2 py-2 text-base"
          >
            <option value="V">V</option>
            <option value="E">E</option>
          </select>
          <input
            id="cedula-objetante"
            name="cedulaDigitos"
            inputMode="numeric"
            autoComplete="off"
            required
            pattern="\d{6,9}"
            maxLength={14}
            placeholder="12345678"
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 9);
              setConfirmando(false);
            }}
            className="codigo w-36 rounded-md border border-toga-300 px-3 py-2 text-base"
          />
        </div>
        <p className="mt-1 text-xs text-toga-500">Aparece en el documento de la denuncia.</p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-toga-800">
          Causales <span className="text-balanza-700">*</span>
        </legend>
        <div className="mt-2 grid gap-2">
          {CAUSALES.map(([valor, texto]) => (
            <label key={valor} className="flex items-start gap-2 text-sm text-toga-700">
              <input
                type="checkbox"
                name="causes"
                value={valor}
                checked={causas.includes(valor)}
                onChange={() => alternar(valor)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-balanza-600"
              />
              {texto}
            </label>
          ))}
        </div>
      </fieldset>

      {otra && (
        <div>
          <label htmlFor="otra-causa" className="block text-sm font-medium text-toga-800">
            Otra razón <span className="text-balanza-700">*</span>
          </label>
          <input
            id="otra-causa"
            name="otherCause"
            required
            maxLength={500}
            className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-base"
          />
        </div>
      )}

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-toga-800">
          Descripción de los hechos <span className="text-balanza-700">*</span>
        </label>
        <textarea
          id="descripcion"
          name="description"
          rows={5}
          required
          minLength={50}
          maxLength={8000}
          onChange={() => setConfirmando(false)}
          className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-base"
        />
        <p className="mt-1 text-xs text-toga-500">Mínimo 50 caracteres.</p>
      </div>

      <div>
        <label htmlFor="pruebas" className="block text-sm font-medium text-toga-800">
          Enlace a las pruebas <span className="text-balanza-700">*</span>
        </label>
        <input
          id="pruebas"
          name="evidenceUrl"
          type="url"
          required
          maxLength={2000}
          placeholder="https://"
          className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-base"
        />
      </div>

      {estado.error && (
        <p role="alert" className="text-sm text-objetado-600">
          {estado.error}
        </p>
      )}

      {confirmando ? (
        <div className="space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/40 p-3">
          <p className="text-sm text-toga-800">
            ¿Presentar la objeción contra <span className="font-semibold">{postulante}</span> por:{" "}
            {causas.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c).join("; ")}? Quedará registrada a su
            nombre; la recibe el comité y, con el descargo del postulante, la envía al Consejo. Una
            objeción no cambia el puntaje por sí sola.
          </p>
          <div className="flex flex-wrap gap-2">
            <BotonEnvio texto="Confirmar objeción" cargando="Registrando…" />
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Revisar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={causas.length === 0}
          onClick={(ev) => {
            // Usa la validación nativa (mínimos, URL) antes de pedir confirmación.
            if (ev.currentTarget.form?.reportValidity()) setConfirmando(true);
          }}
          className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
        >
          Presentar objeción
        </button>
      )}
    </form>
  );
}
