import Link from "next/link";
import type { Metadata } from "next";
import type { ResumenDashboard } from "@/contracts";
import { renovarYVolver } from "@/lib/rutas";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { usuarioActual } from "@/lib/sesion";
import { puedeVerRuta, rutaInicio } from "@/lib/secciones-nav";
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
  if (!usuario.roles.some((r) => ["SUPER_ADMIN", "ADMIN", "SECRETARY", "EVALUATOR"].includes(r))) {
    redirect(rutaInicio(usuario.roles));
  }

  let resumen: ResumenDashboard | null = null;

  try {
    resumen = await llamarApi<ResumenDashboard>("/internal/dashboard");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/dashboard");
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

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              etiqueta="Expedientes aprobados"
              detalle="Con el baremo aprobado y sin causal de exclusión."
              href="/ranking"
            />
            <Tarjeta
              valor={resumen.objections.reduce((suma, item) => suma + item.count, 0)}
              etiqueta="Objeciones recibidas"
              detalle="Denuncias del sitio público. Con ellas se corrige el baremo o se declara inelegible."
              href={puedeVerRuta(usuario, "/objeciones") ? "/objeciones" : undefined}
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
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-lg font-semibold text-toga-900">Estado del proceso</h2>
            <p className="text-xs text-toga-500 sm:text-right">
              Actualizado{" "}
              {new Intl.DateTimeFormat("es-VE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(resumen.generatedAt))}
            </p>
          </div>
          <GraficosDashboard data={resumen} />
        </div>
      )}
    </div>
  );
}
