"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BaremoListado } from "@/contracts";
import { activarBaremo } from "@/app/(panel)/baremo/configuracion/acciones";
import { useToast } from "@/components/toast-provider";

const AVISOS: Record<string, string> = {
  creado: "Baremo creado. Actívelo desde esta lista cuando tenga criterios.",
  actualizado: "Baremo guardado.",
};

/** El guardado redirige aquí: el aviso no puede vivir en el formulario que se cierra. */
export function AvisoListaBaremo({ aviso }: { readonly aviso?: string }) {
  const toast = useToast();
  const router = useRouter();
  const visto = useRef(false);

  useEffect(() => {
    const mensaje = aviso ? AVISOS[aviso] : undefined;
    if (!mensaje || visto.current) return;
    visto.current = true;
    toast.exito(mensaje);
    router.replace("/baremo/configuracion");
  }, [aviso, router, toast]);

  return null;
}

function fecha(iso: string) {
  return new Date(iso).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" });
}

function InsigniaActivo() {
  return (
    <span className="inline-flex rounded-full bg-validado-50 px-2 py-0.5 text-xs font-medium text-validado-700">
      Activo
    </span>
  );
}

export function ListaConfiguracionBaremo({
  baremos,
}: {
  readonly baremos: readonly BaremoListado[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function activar(baremo: BaremoListado) {
    setError(null);
    startTransition(async () => {
      const resultado = await activarBaremo(baremo.id, true);
      if (resultado) {
        setError(resultado.error);
        setConfirmarId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {error}
        </p>
      )}

      <div className="hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Baremos configurados</caption>
          <thead className="border-b-2 border-toga-300 bg-toga-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Título
              </th>
              <th scope="col" className="px-4 py-3 text-center font-semibold text-toga-700">
                Total
              </th>
              <th scope="col" className="px-4 py-3 text-center font-semibold text-toga-700">
                Criterios
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Actualizado
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {baremos.map((baremo) => (
              <tr key={baremo.id} className="hover:bg-toga-50">
                <th scope="row" className="px-4 py-3 font-medium text-toga-900">
                  <Link
                    href={`/baremo/configuracion/${baremo.id}`}
                    className="hover:text-balanza-700 hover:underline"
                  >
                    {baremo.title}
                  </Link>
                </th>
                <td className="cifra px-4 py-3 text-center text-toga-700">{baremo.totalPoints}</td>
                <td className="cifra px-4 py-3 text-center text-toga-700">{baremo.criterios}</td>
                <td className="px-4 py-3">
                  {baremo.active ? (
                    <InsigniaActivo />
                  ) : (
                    <span className="text-xs text-toga-500">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-toga-500">{fecha(baremo.updatedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <AccionActivar
                    baremo={baremo}
                    confirmando={confirmarId === baremo.id}
                    pending={pending}
                    onPedir={() => {
                      setError(null);
                      setConfirmarId(baremo.id);
                    }}
                    onCancelar={() => setConfirmarId(null)}
                    onConfirmar={() => activar(baremo)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {baremos.map((baremo) => (
          <li key={baremo.id} className="rounded-lg border border-toga-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/baremo/configuracion/${baremo.id}`}
                className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
              >
                {baremo.title}
              </Link>
              {baremo.active ? (
                <InsigniaActivo />
              ) : (
                <span className="shrink-0 text-xs text-toga-500">Inactivo</span>
              )}
            </div>
            <p className="mt-1 text-xs text-toga-500">
              <span className="cifra">{baremo.totalPoints}</span> pts ·{" "}
              <span className="cifra">{baremo.criterios}</span> criterios ·{" "}
              {fecha(baremo.updatedAt)}
            </p>
            <div className="mt-3">
              <AccionActivar
                baremo={baremo}
                confirmando={confirmarId === baremo.id}
                pending={pending}
                onPedir={() => {
                  setError(null);
                  setConfirmarId(baremo.id);
                }}
                onCancelar={() => setConfirmarId(null)}
                onConfirmar={() => activar(baremo)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccionActivar({
  baremo,
  confirmando,
  pending,
  onPedir,
  onCancelar,
  onConfirmar,
}: {
  readonly baremo: BaremoListado;
  readonly confirmando: boolean;
  readonly pending: boolean;
  readonly onPedir: () => void;
  readonly onCancelar: () => void;
  readonly onConfirmar: () => void;
}) {
  if (baremo.active) return null;
  if (baremo.criterios === 0) {
    return <span className="text-xs text-toga-500">Sin criterios, no se puede activar</span>;
  }
  if (confirmando) {
    return (
      <span className="flex flex-wrap items-center justify-end gap-2 text-sm text-toga-700">
        ¿Activar «{baremo.title}»? El baremo activo actual dejará de estarlo.
        <button
          type="button"
          onClick={onConfirmar}
          disabled={pending}
          className="rounded-md bg-balanza-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
        >
          {pending ? "Activando…" : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={pending}
          className="rounded-md border border-toga-300 px-3 py-1.5"
        >
          Cancelar
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onPedir}
      disabled={pending}
      className="rounded-md bg-balanza-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      Activar
    </button>
  );
}
