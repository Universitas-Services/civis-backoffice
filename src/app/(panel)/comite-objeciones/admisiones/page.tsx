import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { AdmisionComite, ListaAdmisiones } from "@/contracts";
import { ETAPA_OBJECION_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { fechaCorta, fechaHora } from "@/lib/plazos";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { Paginacion } from "@/components/paginacion";

export const metadata: Metadata = { title: "Admisiones del comité" };

const PAGE_SIZE = 20;

const FILTROS = [
  { valor: undefined, decision: undefined, etiqueta: "Todas", clave: "TODAS" },
  { valor: "admitidas", decision: "ADMITIDAS", etiqueta: "Admitidas", clave: "ADMITIDAS" },
  { valor: "inadmitidas", decision: "INADMITIDAS", etiqueta: "Inadmitidas", clave: "INADMITIDAS" },
] as const;

/**
 * Control de los pronunciamientos de admisión: qué se admitió o inadmitió,
 * quién se pronunció, cuándo y si ya se notificó.
 */
export default async function AdmisionesDelComite({
  searchParams,
}: {
  readonly searchParams: Promise<{ decision?: string; page?: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "COMMITTEE");

  const params = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === params.decision) ?? FILTROS[0];
  const page = Math.max(1, Number(params.page) || 1);
  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (filtro.decision) query.set("decision", filtro.decision);

  let datos: ListaAdmisiones;
  try {
    datos = await llamarApi<ListaAdmisiones>(`/internal/comite/admisiones?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/comite-objeciones/admisiones");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Admisiones"
        descripcion="Control de las objeciones sobre las que el comité ya se pronunció: admitidas o inadmitidas, quién lo hizo, cuándo y si ya se notificó."
        ruta={[{ href: "/comite-objeciones", texto: "Comité" }, { texto: "Admisiones" }]}
      />

      <div className="px-5 py-6 sm:px-8">
        <nav aria-label="Filtrar por decisión" className="-mx-1 flex flex-wrap gap-1.5">
          {FILTROS.map((f) => {
            const activo = f.clave === filtro.clave;
            return (
              <Link
                key={f.clave}
                href={
                  f.valor
                    ? `/comite-objeciones/admisiones?decision=${f.valor}`
                    : "/comite-objeciones/admisiones"
                }
                aria-current={activo ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activo
                    ? "border-balanza-600 bg-balanza-50 text-balanza-700"
                    : "border-toga-200 bg-white text-toga-600 hover:border-toga-300 hover:text-toga-900"
                }`}
              >
                {f.etiqueta}
                <span className="cifra ml-1.5 text-xs text-toga-400">
                  ({datos.resumen[f.clave] ?? 0})
                </span>
              </Link>
            );
          })}
        </nav>

        {datos.items.length === 0 ? (
          <div className="mt-4">
            <EstadoVacio
              titulo="Sin pronunciamientos"
              detalle="Todavía no hay objeciones admitidas ni inadmitidas en esta vista."
            />
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-hidden rounded-lg border border-toga-200 bg-white xl:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Pronunciamientos de admisión del comité</caption>
                <thead className="border-b-2 border-toga-300 bg-toga-50">
                  <tr>
                    {["Objeción", "Postulante", "Decisión", "Notificación", "Etapa actual"].map(
                      (t) => (
                        <th key={t} scope="col" className="px-4 py-3 font-semibold text-toga-700">
                          {t}
                        </th>
                      ),
                    )}
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-toga-100">
                  {datos.items.map((a) => (
                    <tr key={a.id} className="align-top hover:bg-toga-50">
                      <th scope="row" className="px-4 py-3 text-left font-normal">
                        <span className="codigo text-toga-900">{a.trackingCode}</span>
                        <p className="mt-0.5 text-xs text-toga-500">
                          {a.porVisualizador ? "Visualizador" : "Ciudadana"} · {a.objectorFullName}
                        </p>
                      </th>
                      <td className="px-4 py-3">
                        <p className="font-medium text-toga-900">{a.candidate.fullName}</p>
                        <p className="mt-0.5 text-xs text-toga-500">
                          {SALA_ETIQUETA[a.candidate.chamber] ?? a.candidate.chamber}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Decision a={a} />
                      </td>
                      <td className="px-4 py-3 text-xs text-toga-600">
                        <Notificacion a={a} />
                      </td>
                      <td className="px-4 py-3 text-xs text-toga-600">
                        {ETAPA_OBJECION_ETIQUETA[a.stage]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Acciones a={a} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 space-y-3 xl:hidden">
              {datos.items.map((a) => (
                <li key={a.id} className="rounded-lg border border-toga-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-toga-900">{a.candidate.fullName}</p>
                      <p className="mt-0.5 text-xs text-toga-500">
                        <span className="codigo">{a.trackingCode}</span> ·{" "}
                        {a.porVisualizador ? "visualizador" : "ciudadana"}
                      </p>
                    </div>
                    <Decision a={a} />
                  </div>
                  <div className="mt-2 text-xs text-toga-600">
                    <Notificacion a={a} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 border-t border-toga-100 pt-3">
                    <Acciones a={a} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <Paginacion
          ruta="/comite-objeciones/admisiones"
          page={datos.page}
          pageSize={datos.pageSize || PAGE_SIZE}
          total={datos.total}
          params={{ decision: filtro.valor }}
        />
      </div>
    </>
  );
}

function Decision({ a }: { readonly a: AdmisionComite }) {
  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          a.decision === "ADMITIDA" ? "bg-balanza-50 text-balanza-700" : "bg-toga-100 text-toga-700"
        }`}
      >
        {a.decision === "ADMITIDA" ? "Admitida" : "Inadmitida"}
      </span>
      <p className="mt-1 text-xs text-toga-500">
        {fechaCorta(a.admissionDecidedAt)}
        {a.decididaPor && <> · {a.decididaPor}</>}
      </p>
      {a.fueraDePlazo && (
        <p className="mt-0.5 text-xs font-medium text-balanza-700">Fuera de plazo (fuerza mayor)</p>
      )}
    </div>
  );
}

function Notificacion({ a }: { readonly a: AdmisionComite }) {
  if (a.notifiedAt) return <>Notificada el {fechaHora(a.notifiedAt)}</>;
  if (a.notificationDueAt) return <>Se notifica el {fechaHora(a.notificationDueAt)}</>;
  // Anteriores a la notificación diferida: se notificaron en el acto.
  return <>Notificada al pronunciarse</>;
}

function Acciones({ a }: { readonly a: AdmisionComite }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      {a.auto && (
        <a
          href={`/api/autos/${a.id}/${a.auto.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-toga-700 hover:text-toga-900"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Auto
        </a>
      )}
      <Link
        href={`/comite-objeciones/${a.id}`}
        className="text-sm font-semibold text-balanza-700 hover:text-balanza-600"
      >
        Abrir
      </Link>
    </span>
  );
}
