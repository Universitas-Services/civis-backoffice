import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ExpedienteListado, WorkflowStatus } from "@/contracts";
import { ESTADO_ETIQUETA, SALA_ETIQUETA, WORKFLOW_STATUS } from "@/contracts";
import { renovarYVolver } from "@/lib/rutas";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { tieneRol, usuarioActual } from "@/lib/sesion";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { InsigniaBanda, InsigniaEstado } from "@/components/insignias";

export const metadata: Metadata = { title: "Expedientes" };

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

  const query = new URLSearchParams({ page: params.page ?? "1", pageSize: "25" });
  if (params.buscar) query.set("buscar", params.buscar);
  if (params.estado) query.set("estado", params.estado);

  let datos: Respuesta;
  try {
    datos = await llamarApi<Respuesta>(`/internal/candidates?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/expedientes");
    throw error;
  }

  const puedeCrear = tieneRol(usuario, "SUPER_ADMIN", "SECRETARY", "EVALUATOR");

  return (
    <>
      <CabeceraPagina
        titulo="Expedientes"
        descripcion="Todos los postulantes registrados, con su etapa, documentos y evaluación vigente."
        acciones={
          puedeCrear ? (
            <Link
              href="/expedientes/nuevo"
              className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
            >
              + Nuevo expediente
            </Link>
          ) : undefined
        }
      />

      <div className="px-5 py-6 sm:px-8">
        {/* Filtros por GET: enlazables y funcionan sin JavaScript. */}
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
              defaultValue={params.buscar ?? ""}
              placeholder="Ej.: Villalba, V-11223344, EXP-0009"
              className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:w-60">
            <label htmlFor="estado" className="block text-xs font-medium text-toga-600">
              Etapa
            </label>
            <select
              id="estado"
              name="estado"
              defaultValue={params.estado ?? ""}
              className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todas las etapas</option>
              {WORKFLOW_STATUS.map((e) => (
                <option key={e} value={e}>
                  {ESTADO_ETIQUETA[e]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-toga-900 px-5 py-2 text-sm font-semibold text-white hover:bg-toga-800"
          >
            Filtrar
          </button>
        </form>

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
            </p>

            {/* Móvil: tarjetas. Escritorio: tabla. Sin scroll horizontal. */}
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
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Expedientes registrados</caption>
                <thead className="border-b-2 border-toga-300 bg-toga-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Expediente
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Postulante
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Sala
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Etapa
                    </th>
                    <th scope="col" className="px-4 py-3 text-center font-semibold text-toga-700">
                      Docs.
                    </th>
                    <th scope="col" className="px-4 py-3 text-center font-semibold text-toga-700">
                      Obj.
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Evaluación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-toga-100">
                  {datos.items.map((e) => {
                    const evaluacion = e.evaluations[0];
                    return (
                      <tr key={e.id} className="hover:bg-toga-50">
                        <th
                          scope="row"
                          className="codigo px-4 py-3 text-left text-xs font-medium text-toga-600"
                        >
                          {e.submissions[0]?.fileNumber ?? "—"}
                        </th>
                        <td className="px-4 py-3">
                          <Link
                            href={`/expedientes/${e.id}`}
                            className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
                          >
                            {e.firstName} {e.lastName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-toga-600">{SALA_ETIQUETA[e.chamber]}</td>
                        <td className="px-4 py-3">
                          <InsigniaEstado estado={e.workflowStatus as WorkflowStatus} />
                        </td>
                        <td className="cifra px-4 py-3 text-center text-toga-600">
                          {e.submissions[0]?._count.documents ?? 0}
                        </td>
                        <td className="cifra px-4 py-3 text-center">
                          {e._count.objections > 0 ? (
                            <span className="font-semibold text-balanza-700">
                              {e._count.objections}
                            </span>
                          ) : (
                            <span className="text-toga-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {evaluacion ? (
                            <span className="flex items-center gap-2">
                              <span className="cifra font-semibold text-toga-900">
                                {Number(evaluacion.totalPoints)}
                              </span>
                              <InsigniaBanda
                                banda={
                                  evaluacion.ineligible ? "INELIGIBLE" : (evaluacion.band as never)
                                }
                              />
                            </span>
                          ) : (
                            <span className="text-xs text-toga-400">Sin evaluar</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
