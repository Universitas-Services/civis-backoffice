"use client";

import Link from "next/link";
import { useState } from "react";
import { ESTADO_ETIQUETA, type WorkflowStatus } from "@/contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TODAS = "__todas__";

export function FiltrosExpedientes({
  buscar,
  estado,
  etapas,
}: {
  readonly buscar: string;
  readonly estado: string;
  readonly etapas: readonly WorkflowStatus[];
}) {
  const [etapa, setEtapa] = useState(estado || TODAS);
  const hayFiltros = Boolean(buscar.trim() || estado);

  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-lg border border-toga-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="buscar" className="block text-xs font-medium text-toga-600">
          Nombre, cédula o número de expediente
        </label>
        <input
          id="buscar"
          name="buscar"
          type="search"
          defaultValue={buscar}
          placeholder="Ej.: Villalba, V-11223344, EXP-0009"
          className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400 focus:border-balanza-600 focus:ring-2 focus:ring-balanza-600/20"
        />
      </div>

      <div className="sm:w-64">
        <label htmlFor="estado-trigger" className="block text-xs font-medium text-toga-600">
          Etapa
        </label>
        {/* Radix Select no envía name nativo: el hidden mantiene el GET. */}
        <input type="hidden" name="estado" value={etapa === TODAS ? "" : etapa} />
        <Select value={etapa} onValueChange={setEtapa}>
          <SelectTrigger id="estado-trigger" className="mt-1" aria-label="Filtrar por etapa">
            <SelectValue placeholder="Todas las etapas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todas las etapas</SelectItem>
            {etapas.map((e) => (
              <SelectItem key={e} value={e}>
                {ESTADO_ETIQUETA[e]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {hayFiltros ? (
          <>
            <button
              type="submit"
              className="rounded-md border border-toga-300 bg-white px-5 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-50"
            >
              Aplicar
            </button>
            <Link
              href="/expedientes"
              className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
            >
              Limpiar
            </Link>
          </>
        ) : (
          <button
            type="submit"
            className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Filtrar
          </button>
        )}
      </div>
    </form>
  );
}
