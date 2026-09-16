"use client";

/**
 * Tooltip compartido para todos los gráficos Recharts del panel.
 * Sustituye el `title` nativo del navegador.
 */
export function TooltipGrafico({
  active,
  payload,
  label,
  unidad,
}: {
  readonly active?: boolean;
  readonly payload?: readonly {
    readonly name?: string;
    readonly value?: number | string;
    readonly color?: string;
    readonly payload?: { readonly color?: string };
  }[];
  readonly label?: string | number;
  /** Texto opcional junto al valor (p. ej. "pts"). */
  readonly unidad?: string;
}) {
  if (!active || !payload?.length) return null;

  const titulo = label === undefined || label === null || label === "" ? null : String(label);

  return (
    <div className="rounded-md border border-toga-200 bg-white px-3 py-2 text-xs shadow-md">
      {titulo && <p className="font-medium text-toga-900">{titulo}</p>}
      <ul className={`space-y-1 ${titulo ? "mt-1.5" : ""}`}>
        {payload.map((item, i) => {
          const color = item.color ?? item.payload?.color ?? "#64748b";
          const valor = item.value ?? 0;
          return (
            <li key={`${String(item.name)}-${i}`} className="flex items-center gap-2 text-toga-700">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: color }} />
              <span className="min-w-0 truncate">{item.name ?? "Valor"}</span>
              <span className="cifra ml-auto shrink-0 font-semibold text-toga-900">
                {valor}
                {unidad ? ` ${unidad}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
