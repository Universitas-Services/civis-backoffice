"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { descargoSchema } from "@/contracts";
import { useToast } from "@/components/toast-provider";

/**
 * La secretaría carga el descargo de un postulante sin cuenta, tras
 * contactarlo. Va por un Route Handler porque lleva un archivo opcional.
 */
export function FormularioDescargo({
  objectionId,
  trackingCode,
}: {
  readonly objectionId: string;
  readonly trackingCode: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const formulario = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function validar(): FormData | null {
    const datos = new FormData(formulario.current!);
    const analisis = descargoSchema.safeParse({
      title: datos.get("title"),
      description: datos.get("description"),
    });
    if (!analisis.success) {
      setError(analisis.error.issues[0]?.message ?? "Revise el descargo");
      return null;
    }
    setError(null);
    return datos;
  }

  async function enviar() {
    const datos = validar();
    if (!datos) {
      setConfirmando(false);
      return;
    }
    setEnviando(true);
    try {
      const respuesta = await fetch(`/api/descargos/${objectionId}`, {
        method: "POST",
        body: datos,
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
      if (!respuesta.ok) {
        setError(cuerpo?.message ?? "No se pudo cargar el descargo");
        setConfirmando(false);
        return;
      }
      toast.exito("Descargo cargado. El comité ya puede enviarlo al Consejo.");
      router.refresh();
    } catch {
      setError("No se pudo contactar con el servidor");
      setConfirmando(false);
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-base text-toga-900 focus:border-balanza-600";

  return (
    <form
      ref={formulario}
      onSubmit={(ev) => {
        ev.preventDefault();
        if (validar()) setConfirmando(true);
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="text-sm font-medium text-toga-800">Título</span>
        <input name="title" required minLength={3} maxLength={200} className={campo} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-toga-800">Descripción</span>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className={campo}
          placeholder="Lo que el postulante responde a la objeción, con sus propias palabras."
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-toga-800">Documento de respaldo (opcional)</span>
        <input
          name="file"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="mt-1.5 block w-full text-sm text-toga-700 file:mr-3 file:rounded-md file:border file:border-toga-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-toga-700"
        />
        <span className="mt-1 block text-xs text-toga-500">PDF, JPEG o PNG.</span>
      </label>

      {error && (
        <p role="alert" className="mensaje-error-campo text-sm">
          {error}
        </p>
      )}

      {confirmando ? (
        <div className="space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/40 p-3">
          <p className="text-sm text-toga-800">
            ¿Cargar este descargo para la objeción{" "}
            <span className="codigo font-semibold">{trackingCode}</span>? No se podrá cambiar
            después.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enviando}
              onClick={enviar}
              className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {enviando ? "Cargando…" : "Confirmar descargo"}
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={() => setConfirmando(false)}
              className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="submit"
          className="rounded-md border border-balanza-600 bg-white px-4 py-2 text-sm font-semibold text-balanza-700 hover:bg-balanza-50"
        >
          Cargar descargo
        </button>
      )}
    </form>
  );
}
