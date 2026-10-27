"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { DocumentoLegal } from "@/contracts";
import {
  descartarBorradorLegal,
  guardarBorradorLegal,
  publicarDocumentoLegal,
  type EstadoLegal,
} from "@/app/(panel)/documentos-legales/acciones";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";
import { useToast } from "@/components/toast-provider";
import { TextoLegal } from "./texto-legal";

const ENTRADA =
  "mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-base text-toga-900 focus:border-balanza-600";

function Enviar({
  texto,
  pendiente,
  principal,
}: {
  texto: string;
  pendiente: string;
  principal?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        principal
          ? "rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
          : "rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50 disabled:opacity-60"
      }
    >
      {pending ? pendiente : texto}
    </button>
  );
}

/**
 * Editor de un borrador: título, texto en Markdown con vista previa y
 * resumen de cambios. «Publicar» guarda lo escrito y lo vuelve vigente,
 * tras una confirmación en la misma pantalla.
 */
export function EditorLegal({ documento }: { readonly documento: DocumentoLegal }) {
  const [titulo, setTitulo] = useState(documento.title);
  const [contenido, setContenido] = useState(documento.content);
  const [resumen, setResumen] = useState(documento.changeSummary ?? "");
  const [vista, setVista] = useState<"escribir" | "previa">("escribir");
  const [confirmando, setConfirmando] = useState(false);
  const [descartando, iniciarDescarte] = useTransition();
  const toast = useToast();

  const [estadoGuardar, guardar] = useActionState<EstadoLegal, FormData>(
    guardarBorradorLegal.bind(null, documento.id),
    {},
  );
  const [estadoPublicar, publicar] = useActionState<EstadoLegal, FormData>(
    publicarDocumentoLegal.bind(null, documento.id),
    {},
  );
  useToastDesdeEstado(estadoGuardar);
  useToastDesdeEstado(estadoPublicar);
  const campos = { ...estadoGuardar.campos, ...estadoPublicar.campos };
  const esPrimera = documento.version === 1;

  // Los dos formularios envían los mismos campos (controlados).
  const ocultos = (
    <>
      <input type="hidden" name="title" value={titulo} />
      <input type="hidden" name="content" value={contenido} />
      <input type="hidden" name="changeSummary" value={resumen} />
    </>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-toga-200 bg-white p-4 sm:p-5">
        <label className="block">
          <span className="text-sm font-medium text-toga-800">Título</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={200}
            className={ENTRADA}
            aria-invalid={campos.title ? true : undefined}
          />
          {campos.title && (
            <span className="mt-1 block text-sm text-balanza-700">{campos.title}</span>
          )}
        </label>

        <div className="mt-5">
          <div
            role="tablist"
            aria-label="Texto del documento"
            className="flex gap-1 border-b border-toga-200"
          >
            {(["escribir", "previa"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={vista === v}
                onClick={() => setVista(v)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                  vista === v
                    ? "border-balanza-600 text-toga-900"
                    : "border-transparent text-toga-500 hover:text-toga-900"
                }`}
              >
                {v === "escribir" ? "Escribir" : "Vista previa"}
              </button>
            ))}
          </div>
          {vista === "escribir" ? (
            <>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                rows={24}
                aria-label="Texto del documento en Markdown"
                aria-invalid={campos.content ? true : undefined}
                className={`${ENTRADA} codigo text-sm leading-relaxed`}
              />
              <p className="mt-1 text-xs text-toga-500">
                Formato Markdown: <span className="codigo">## Título de sección</span>,{" "}
                <span className="codigo">**negrita**</span>, listas con{" "}
                <span className="codigo">- </span> y tablas con <span className="codigo">|</span>.
                Revise el resultado en «Vista previa».
              </p>
            </>
          ) : (
            <div className="mt-3 max-h-[36rem] overflow-y-auto rounded-md border border-toga-100 p-4">
              <TextoLegal contenido={contenido} />
            </div>
          )}
          {campos.content && (
            <span className="mt-1 block text-sm text-balanza-700">{campos.content}</span>
          )}
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-toga-800">
            Resumen de cambios{" "}
            <span className="font-normal text-toga-500">
              {esPrimera ? "(opcional en la primera versión)" : "(obligatorio)"}
            </span>
          </span>
          <span className="mt-0.5 block text-xs text-toga-500">
            Los postulantes con cuenta lo verán al aceptar la nueva versión.
          </span>
          <textarea
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            rows={3}
            maxLength={2000}
            className={ENTRADA}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <form action={guardar}>
          {ocultos}
          <Enviar texto="Guardar borrador" pendiente="Guardando…" />
        </form>
        {!confirmando && (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Publicar versión {documento.version}
          </button>
        )}
        <button
          type="button"
          disabled={descartando}
          onClick={() =>
            iniciarDescarte(async () => {
              const estado = await descartarBorradorLegal(documento.id);
              if (estado?.error) toast.error(estado.error);
            })
          }
          className="ml-auto rounded-md px-3 py-2 text-sm font-medium text-toga-600 hover:bg-toga-50 hover:text-balanza-700 disabled:opacity-60"
        >
          {descartando ? "Descartando…" : "Descartar borrador"}
        </button>
      </div>

      {confirmando && (
        <form
          action={publicar}
          className="space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/40 p-4"
        >
          {ocultos}
          <p className="text-sm text-toga-800">
            La versión {documento.version} pasará a ser la vigente
            {esPrimera ? "" : " y reemplazará a la anterior"}. Desde ese momento los nuevos
            postulantes la aceptarán al registrarse
            {esPrimera ? "" : ", y quienes ya tienen cuenta deberán aceptarla al ingresar"}. Una
            versión publicada no se puede modificar.
          </p>
          <div className="flex flex-wrap gap-2">
            <Enviar texto="Confirmar publicación" pendiente="Publicando…" principal />
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
