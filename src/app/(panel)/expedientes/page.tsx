import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ExpedienteListado } from "@/contracts";
import { WORKFLOW_STATUS, SALA_ETIQUETA } from "@/contracts";
import { renovarYVolver } from "@/lib/rutas";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { tieneRol, usuarioActual } from "@/lib/sesion";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { FiltrosExpedientes } from "@/components/filtros-expedientes";
import { InsigniaEstado } from "@/components/insignias";
import { Paginacion } from "@/components/paginacion";
import { TablaExpedientes } from "@/components/tabla-expedientes";

export const metadata: Metadata = { title: "Expedientes" };

const PAGE_SIZE = 10;

interface Respuesta {
  readonly items: readonly ExpedienteListado[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export default async function Expedientes({
  searchParams,
}: {
  readonly searchParams: Promise<{ buscar?: string; estado?: string; page?: string }>;
}) {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (params.buscar) query.set("buscar", params.buscar);
  if (params.estado) query.set("estado", params.estado);

  let datos: Respuesta;
  try {
    datos = await llamarApi<Respuesta>(`/internal/candidates?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/expedientes");
    throw error;
  }

  const puedeCrear = tieneRol(usuario, "SUPER_ADMIN", "SECRETARY");
  const pageSize = datos.pageSize || PAGE_SIZE;

  return (
    <>
      <CabeceraPagina
        titulo="Expedientes"
        descripcion="Todos los postulantes registrados, con su etapa, documentos y evaluación vigente."
        acciones={
          puedeCrear ? (
            <Link
              href="/expedientes/nuevo"
              className="rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
            >
              + Nuevo expediente
            </Link>
          ) : undefined
        }
      />

      <div className="px-5 py-6 sm:px-8">
        <FiltrosExpedientes
          buscar={params.buscar ?? ""}
          estado={params.estado ?? ""}
          etapas={WORKFLOW_STATUS}
        />

        {datos.items.length === 0 ? (
          <div className="mt-6">
            <EstadoVacio
              titulo="Ningún expediente coincide"
              detalle="Pruebe con otros filtros, o registre un postulante nuevo."
              accion={
                <Link
                  href="/expedientes"
                  className="text-sm font-medium text-balanza-700 underline"
                >
                  Limpiar filtros
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-toga-500">
              {datos.total} {datos.total === 1 ? "expediente" : "expedientes"}
              {" · "}
              página <span className="cifra font-medium text-toga-900">{datos.page}</span> de{" "}
              <span className="cifra font-medium text-toga-900">
                {Math.max(1, Math.ceil(datos.total / pageSize))}
              </span>
              {" · "}
              mostrando{" "}
              <span className="cifra">
                {(datos.page - 1) * pageSize + 1}–{Math.min(datos.page * pageSize, datos.total)}
              </span>
            </p>

            <ul className="mt-3 space-y-3 lg:hidden">
              {datos.items.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/expedientes/${e.id}`}
                    className="block rounded-lg border border-toga-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="codigo text-xs font-medium text-toga-500">
                        {e.submissions[0]?.fileNumber ?? "—"}
                      </span>
                      <InsigniaEstado estado={e.workflowStatus} />
                    </div>
                    <p className="mt-2 font-medium text-toga-900">
                      {e.firstName} {e.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-toga-500">
                      {SALA_ETIQUETA[e.chamber]} · {e.submissions[0]?._count.documents ?? 0}{" "}
                      documentos
                      {e._count.objections > 0 && ` · ${e._count.objections} objeciones`}
                      {e.evaluations[0] && ` · ${Number(e.evaluations[0].totalPoints)} pts`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <TablaExpedientes items={datos.items} />

            <Paginacion
              ruta="/expedientes"
              page={datos.page}
              pageSize={pageSize}
              total={datos.total}
              params={{
                buscar: params.buscar,
                estado: params.estado,
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
