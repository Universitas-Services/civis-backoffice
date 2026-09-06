import Link from "next/link";
import type { Metadata } from "next";
import type { ResumenDashboard } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { usuarioActual } from "@/lib/sesion";
import { redirect } from "next/navigation";
import { GraficosDashboard } from "@/components/graficos-dashboard";

export const metadata: Metadata = { title: "Panel" };

function Tarjeta({
  valor,
  etiqueta,
  detalle,
  href,
}: {
  readonly valor: number | string;
  readonly etiqueta: string;
  readonly detalle: string;
  readonly href?: string;
}) {
  const contenido = (
    <>
      <p className="cifra text-3xl font-semibold tracking-tight text-toga-900">{valor}</p>
      <p className="mt-1 text-sm font-medium text-toga-700">{etiqueta}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-toga-500">{detalle}</p>
    </>
  );
  const clases =
    "block rounded-lg border border-toga-200 bg-white p-5 transition-colors duration-150 hover:border-toga-400";
  return href ? (
    <Link href={href} className={clases}>
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  );
}

export default async function Dashboard() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");

  let resumen: ResumenDashboard | null = null;

  try {
    resumen = await llamarApi<ResumenDashboard>("/internal/dashboard");
  } catch (error) {
    if (error instanceof NoAutorizado) redirect("/login");
    // El panel conserva navegación y recordatorios aunque las métricas fallen.
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-toga-900">
        Buen día, {usuario.fullName.split(" ")[0]}
      </h1>
      <p className="mt-1.5 text-sm text-toga-600">
        Resumen del proceso según los permisos de su cuenta.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resumen && (
          <>
            <Tarjeta
              valor={resumen.candidateTotal}
              etiqueta="Expedientes registrados"
              detalle="Total de postulantes en todas las etapas."
              href="/expedientes"
            />
            <Tarjeta
              valor={resumen.eligibleCount}
              etiqueta="En competencia"
              detalle="Con evaluación aprobada y sin causal de exclusión."
              href="/ranking"
            />
            <Tarjeta
              valor={resumen.openObjectionCount}
              etiqueta="Objeciones abiertas"
              detalle="Pendientes de triaje, asignación o resolución."
              href="/objeciones"
            />
            <Tarjeta
              valor={resumen.pendingPublicationCount}
              etiqueta="Pendientes de publicar"
              detalle="Snapshots esperando revisión y aprobación."
              href="/publicaciones"
            />
          </>
        )}
      </div>

      {!resumen && (
        <p className="mt-7 rounded-lg border border-toga-200 bg-white p-8 text-center text-sm text-toga-500">
          Las métricas no están disponibles en este momento. Puede seguir usando las secciones del
          menú lateral.
        </p>
      )}

      {resumen && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-toga-900">Estado del proceso</h2>
              <p className="mt-1 text-sm text-toga-500">
                Datos agregados por la API; última consulta{" "}
                {new Intl.DateTimeFormat("es-VE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(resumen.generatedAt))}
                .
              </p>
            </div>
            <p className="codigo text-xs text-toga-500">
              Baremo {resumen.rubricVersion ?? "sin versión"}
            </p>
          </div>
          <GraficosDashboard data={resumen} />
        </div>
      )}

      <section className="mt-10 rounded-lg border border-balanza-600/25 bg-balanza-50 p-5">
        <h2 className="text-sm font-semibold text-toga-900">Recordatorio operativo</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-toga-700">
          <li>
            · El puntaje lo calcula el servidor. Usted registra valores por criterio, no totales.
          </li>
          <li>
            · Nada llega al público sin un snapshot aprobado por una persona distinta a quien lo
            preparó.
          </li>
          <li>· Una objeción no cambia un puntaje: sólo lo hace un ajuste resuelto y aprobado.</li>
          <li>· Toda acción sensible queda en la bitácora, con su nombre y el rol que usó.</li>
        </ul>
      </section>
    </div>
  );
}
