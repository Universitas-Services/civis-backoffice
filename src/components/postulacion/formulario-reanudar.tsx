"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  reanudarPostulacion,
  type ResultadoPostulacion,
} from "@/app/(postulacion)/postulacion/acciones";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Comprobando…" : "Entrar a mi postulación"}
    </button>
  );
}

/** Vuelve a la postulación con el código de acceso (nunca va en la URL). */
export function FormularioReanudar() {
  const [estado, accion] = useActionState<ResultadoPostulacion, FormData>(reanudarPostulacion, {
    ok: false,
  });
  return (
    <form
      action={accion}
      className="mx-auto max-w-md space-y-4 rounded-xl border border-toga-200 bg-white p-6 sm:p-8"
    >
      <div>
        <h1 className="text-xl font-semibold text-toga-900">Reanudar mi postulación</h1>
        <p className="mt-1 text-sm leading-relaxed text-toga-500">
          Escriba el código de acceso que recibió al registrar su expediente. Con él continúa la
          carga de documentos o consulta el estado si ya lo envió.
        </p>
      </div>
      <div>
        <label htmlFor="codigo" className="block text-sm font-medium text-toga-800">
          Código de acceso
        </label>
        <input
          id="codigo"
          name="codigo"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="CIVIS-XXXX-XXXX-XXXX"
          className="codigo mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-base tracking-wider uppercase"
        />
      </div>
      {estado.error && (
        <p role="alert" className="text-sm text-objetado-600">
          {estado.error}
        </p>
      )}
      <Boton />
      <p className="text-xs leading-relaxed text-toga-500">
        Si perdió su código, comuníquese con la secretaría del Consejo con su número de expediente.
      </p>
    </form>
  );
}
