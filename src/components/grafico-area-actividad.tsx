"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipGrafico } from "@/components/tooltip-grafico";

const COLOR_POSTULANTES = "#4a5d73"; // toga-600
const COLOR_OBJECIONES = "#7a1e2d"; // balanza-600

type PuntoActividad = {
  readonly date: string;
  readonly candidates: number;
  readonly objections: number;
};

function etiquetaDia(iso: string) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Área dual con Recharts.
 * Rellena el alto de la card para alinear con «Objeciones por estado».
 */
export function GraficoAreaActividad({ activity }: { readonly activity: readonly PuntoActividad[] }) {
  const datos = activity.map((item) => ({
    fecha: etiquetaDia(item.date),
    Postulantes: item.candidates,
    Objeciones: item.objections,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-56 flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={224}>
          <AreaChart data={datos} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPostulantes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_POSTULANTES} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLOR_POSTULANTES} stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="gradObjeciones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_OBJECIONES} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLOR_OBJECIONES} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="fecha"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              content={<TooltipGrafico />}
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="Postulantes"
              stroke={COLOR_POSTULANTES}
              strokeWidth={2}
              fill="url(#gradPostulantes)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="Objeciones"
              stroke={COLOR_OBJECIONES}
              strokeWidth={2}
              fill="url(#gradObjeciones)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-toga-600">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR_POSTULANTES }} />
          Postulantes
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR_OBJECIONES }} />
          Objeciones
        </span>
      </div>
    </div>
  );
}
