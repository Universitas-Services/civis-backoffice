import type { ResumenDashboard } from "@/contracts";
import { ESTADO_ETIQUETA, OBJECION_ETIQUETA } from "@/contracts";
import { GraficoAreaActividad } from "@/components/grafico-area-actividad";
import { GraficoBarrasHorizontales } from "@/components/grafico-barras-horizontales";

const COLOR = {
  toga: "#4a5d73",
  balanza: "#7a1e2d",
  validado: "#047857",
  objetado: "#64748b",
} as const;

const BAND_LABEL: Record<string, string> = {
  HIGH: "Idoneidad alta",
  MEDIUM: "Idoneidad media",
  LOW: "Idoneidad baja",
  INELIGIBLE: "Inhabilitados",
};

function PanelGrafico({
  title,
  description,
  children,
  estirar = false,
}: {
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
  /** Si true, la card iguala la altura de su vecina en la fila. */
  readonly estirar?: boolean;
}) {
  return (
    <section
      className={`rounded-lg border border-toga-200 bg-white p-5 ${
        estirar ? "flex h-full flex-col" : ""
      }`}
      aria-label={title}
    >
      <h2 className="text-base font-semibold text-toga-900">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-toga-500">{description}</p>
      <div className={estirar ? "mt-5 flex min-h-0 flex-1 flex-col" : "mt-5"}>{children}</div>
    </section>
  );
}

export function GraficosDashboard({ data }: { readonly data: ResumenDashboard }) {
  const workflow = data.workflow.map((item) => ({
    nombre: ESTADO_ETIQUETA[item.status],
    valor: item.count,
    color: COLOR.toga,
  }));

  const bands = data.bands.map((item) => ({
    nombre: BAND_LABEL[item.band] ?? item.band,
    valor: item.count,
    color: item.band === "INELIGIBLE" ? COLOR.objetado : COLOR.validado,
  }));

  const objections = data.objections.map((item) => ({
    nombre: OBJECION_ETIQUETA[item.status],
    valor: item.count,
    color: item.status.startsWith("RESOLVED") ? COLOR.validado : COLOR.balanza,
  }));

  const ranking = data.topRanking.map((item) => ({
    nombre: `${item.position ?? "—"}. ${item.fullName}${item.tied ? " (empate)" : ""}`,
    valor: item.total,
    color: COLOR.validado,
  }));

  return (
    <div className="space-y-5">
      {/* Cada card con su altura natural: evita el hueco blanco al estirar la vecina. */}
      <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
        <PanelGrafico
          title="Expedientes por etapa"
          description="Distribución de todos los postulantes en el flujo interno."
        >
          <GraficoBarrasHorizontales
            items={workflow}
            serie="Expedientes"
            ariaLabel="Cantidad de expedientes por etapa"
          />
        </PanelGrafico>

        <PanelGrafico
          title="Evaluaciones por banda"
          description="Sólo evaluaciones aprobadas y vigentes; los borradores no afectan estas cifras."
        >
          <GraficoBarrasHorizontales
            items={bands}
            serie="Evaluaciones"
            ariaLabel="Evaluaciones aprobadas por banda"
          />
        </PanelGrafico>
      </div>

      <div className="grid gap-5 xl:grid-cols-2 xl:items-stretch">
        <PanelGrafico
          title="Actividad de los últimos 14 días"
          description="Altas de postulantes y objeciones recibidas por fecha UTC."
          estirar
        >
          <GraficoAreaActividad activity={data.activity} />
        </PanelGrafico>

        <PanelGrafico
          title="Objeciones por estado"
          description="Carga acumulada de la bandeja, incluidas las resoluciones."
          estirar
        >
          <GraficoBarrasHorizontales
            items={objections}
            serie="Objeciones"
            ariaLabel="Cantidad de objeciones por estado"
          />
        </PanelGrafico>
      </div>

      {ranking.length > 0 && (
        <PanelGrafico
          title="Primeras posiciones del ranking interno"
          description="Puntajes calculados por la API a partir de evaluaciones aprobadas."
        >
          <GraficoBarrasHorizontales
            items={ranking}
            serie="Puntaje"
            unidad="pts"
            ariaLabel="Primeras posiciones del ranking interno"
          />
        </PanelGrafico>
      )}
    </div>
  );
}
