import type { ResumenDashboard } from "@/contracts";
import { ESTADO_ETIQUETA, OBJECION_ETIQUETA } from "@/contracts";

const BAND_LABEL: Record<string, string> = {
  HIGH: "Idoneidad alta",
  MEDIUM: "Idoneidad media",
  LOW: "Idoneidad baja",
  INELIGIBLE: "Inhabilitados",
};

function BarraHorizontal({
  label,
  value,
  max,
  tone = "toga",
}: {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly tone?: "toga" | "balanza" | "validado" | "objetado";
}) {
  const width = value === 0 ? 0 : Math.max(4, Math.round((value / Math.max(max, 1)) * 100));
  const color = {
    toga: "bg-toga-600",
    balanza: "bg-balanza-600",
    validado: "bg-validado-700",
    objetado: "bg-objetado-600",
  }[tone];

  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-toga-700" title={label}>
          {label}
        </span>
        <span className="cifra shrink-0 font-semibold text-toga-900">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-toga-100" aria-hidden="true">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </li>
  );
}

function PanelGrafico({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-toga-200 bg-white p-5" aria-label={title}>
      <h2 className="text-base font-semibold text-toga-900">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-toga-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function GraficosDashboard({ data }: { readonly data: ResumenDashboard }) {
  const workflowMax = Math.max(...data.workflow.map((item) => item.count), 1);
  const bandMax = Math.max(...data.bands.map((item) => item.count), 1);
  const objectionMax = Math.max(...data.objections.map((item) => item.count), 1);
  const activityMax = Math.max(
    ...data.activity.flatMap((item) => [item.candidates, item.objections]),
    1,
  );
  const scoreMax = Math.max(...data.topRanking.map((item) => item.total), 1);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <PanelGrafico
        title="Expedientes por etapa"
        description="Distribución de todos los postulantes en el flujo interno."
      >
        <ul className="space-y-3" role="list" aria-label="Cantidad de expedientes por etapa">
          {data.workflow.map((item) => (
            <BarraHorizontal
              key={item.status}
              label={ESTADO_ETIQUETA[item.status]}
              value={item.count}
              max={workflowMax}
              tone="toga"
            />
          ))}
        </ul>
      </PanelGrafico>

      <PanelGrafico
        title="Evaluaciones por banda"
        description="Sólo evaluaciones aprobadas y vigentes; los borradores no afectan estas cifras."
      >
        <ul className="space-y-4" role="list" aria-label="Evaluaciones aprobadas por banda">
          {data.bands.map((item) => (
            <BarraHorizontal
              key={item.band}
              label={BAND_LABEL[item.band] ?? item.band}
              value={item.count}
              max={bandMax}
              tone={item.band === "INELIGIBLE" ? "objetado" : "validado"}
            />
          ))}
        </ul>
      </PanelGrafico>

      <PanelGrafico
        title="Actividad de los últimos 14 días"
        description="Altas de postulantes y objeciones recibidas por fecha UTC."
      >
        <div
          className="flex h-44 items-end gap-1.5 border-b border-l border-toga-300 px-2 pb-0"
          role="img"
          aria-label="Gráfico de barras de postulantes y objeciones recibidas durante los últimos 14 días"
        >
          {data.activity.map((item) => {
            const candidateHeight = Math.max(2, Math.round((item.candidates / activityMax) * 100));
            const objectionHeight = Math.max(2, Math.round((item.objections / activityMax) * 100));
            const shortDate = new Intl.DateTimeFormat("es-VE", {
              day: "2-digit",
              month: "2-digit",
              timeZone: "UTC",
            }).format(new Date(`${item.date}T00:00:00Z`));
            return (
              <div
                key={item.date}
                className="flex min-w-0 flex-1 items-end justify-center gap-px"
                style={{ height: "100%" }}
                title={`${shortDate}: ${item.candidates} postulantes, ${item.objections} objeciones`}
                aria-label={`${shortDate}: ${item.candidates} postulantes y ${item.objections} objeciones`}
              >
                <span
                  className="w-1/2 rounded-t-sm bg-toga-600"
                  style={{ height: `${candidateHeight}%` }}
                  aria-hidden="true"
                />
                <span
                  className="w-1/2 rounded-t-sm bg-balanza-600"
                  style={{ height: `${objectionHeight}%` }}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-toga-600">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-toga-600" />
            Postulantes
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-balanza-600" />
            Objeciones
          </span>
        </div>
      </PanelGrafico>

      <PanelGrafico
        title="Objeciones por estado"
        description="Carga acumulada de la bandeja, incluidas las resoluciones."
      >
        <ul className="space-y-3" role="list" aria-label="Cantidad de objeciones por estado">
          {data.objections.map((item) => (
            <BarraHorizontal
              key={item.status}
              label={OBJECION_ETIQUETA[item.status]}
              value={item.count}
              max={objectionMax}
              tone={item.status.startsWith("RESOLVED") ? "validado" : "balanza"}
            />
          ))}
        </ul>
      </PanelGrafico>

      {data.topRanking.length > 0 && (
        <div className="xl:col-span-2">
          <PanelGrafico
            title="Primeras posiciones del ranking interno"
            description="Puntajes calculados por la API a partir de evaluaciones aprobadas."
          >
            <ul
              className="grid gap-x-8 gap-y-3 md:grid-cols-2"
              role="list"
              aria-label="Primeras posiciones del ranking interno"
            >
              {data.topRanking.map((item) => (
                <BarraHorizontal
                  key={item.publicId}
                  label={`${item.position ?? "—"}. ${item.fullName}${item.tied ? " (empate)" : ""}`}
                  value={item.total}
                  max={scoreMax}
                  tone="validado"
                />
              ))}
            </ul>
          </PanelGrafico>
        </div>
      )}
    </div>
  );
}
