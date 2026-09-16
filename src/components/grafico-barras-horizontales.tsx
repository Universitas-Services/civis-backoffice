"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipGrafico } from "@/components/tooltip-grafico";

export type ItemBarraDashboard = {
  readonly nombre: string;
  readonly valor: number;
  readonly color: string;
};

const COLOR_EJE = "#94a3b8";
const COLOR_REJILLA = "#e2e8f0";

/**
 * Barras horizontales con tooltip CIVIS (Recharts).
 * Por defecto oculta filas en cero para no inflar la card con huecos vacíos.
 */
export function GraficoBarrasHorizontales({
  items,
  serie,
  unidad,
  ariaLabel,
  omitirCeros = true,
}: {
  readonly items: readonly ItemBarraDashboard[];
  /** Nombre de la serie en el tooltip (p. ej. «Expedientes»). */
  readonly serie: string;
  readonly unidad?: string;
  readonly ariaLabel: string;
  readonly omitirCeros?: boolean;
}) {
  const visibles = omitirCeros ? items.filter((item) => item.valor > 0) : [...items];
  const omitidos = items.length - visibles.length;

  if (visibles.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-toga-500">
        No hay datos con valor mayor a cero en este momento.
      </p>
    );
  }

  const datos = visibles.map((item) => ({
    nombre: item.nombre,
    [serie]: item.valor,
    color: item.color,
  }));

  // Fila compacta: evita que 4–9 categorías dejen media card en blanco.
  const alto = Math.max(120, visibles.length * 34 + 20);

  return (
    <div>
      <div style={{ height: alto }} role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={datos}
            margin={{ top: 2, right: 36, left: 4, bottom: 2 }}
            barCategoryGap="18%"
          >
            <CartesianGrid stroke={COLOR_REJILLA} strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: COLOR_EJE, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              type="category"
              dataKey="nombre"
              width={118}
              tick={{ fill: "#4a5d73", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => (v.length > 20 ? `${v.slice(0, 18)}…` : v)}
            />
            <Tooltip
              cursor={{ fill: "rgb(15 42 68 / 0.04)" }}
              content={<TooltipGrafico unidad={unidad} />}
            />
            <Bar dataKey={serie} name={serie} radius={[0, 4, 4, 0]} maxBarSize={18}>
              {datos.map((item) => (
                <Cell key={item.nombre} fill={item.color} />
              ))}
              <LabelList
                dataKey={serie}
                position="right"
                className="cifra fill-toga-700"
                style={{ fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {omitidos > 0 && (
        <p className="mt-2 text-xs text-toga-400">
          {omitidos === 1
            ? "1 categoría en cero no se muestra."
            : `${omitidos} categorías en cero no se muestran.`}
        </p>
      )}
    </div>
  );
}
