import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { EventoAuditoria } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";

export const metadata: Metadata = { title: "Bitácora" };

interface Respuesta {
  readonly items: readonly EventoAuditoria[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
}

interface Facetas {
  readonly acciones: readonly { readonly action: string; readonly total: number }[];
  readonly actores: readonly { readonly id: string; readonly fullName: string }[];
}

/** Traducción de las acciones a lenguaje llano para quien audita. */
const ACCION: Record<string, string> = {
  "auth.login.succeeded": "Inició sesión",
  "auth.login.failed": "Intento de acceso fallido",
  "auth.login.locked": "Cuenta bloqueada por intentos",
  "auth.logout": "Cerró sesión",
  "auth.token.refreshed": "Renovó su sesión",
  "auth.token.reuse_detected": "Reuso de token detectado",
  "auth.password.changed": "Cambió su contraseña",
  "user.created": "Creó un usuario",
  "user.roles.changed": "Cambió roles",
  "user.suspended": "Suspendió una cuenta",
  "user.reactivated": "Reactivó una cuenta",
  "candidate.created": "Registró un postulante",
  "candidate.updated": "Editó un expediente",
  "candidate.transitioned": "Cambió la etapa de un expediente",
  "document.uploaded": "Cargó un documento",
  "document.replaced": "Reemplazó un documento",
  "document.reclassified": "Cambió la privacidad de un documento",
  "document.verified": "Verificó un documento",
  "document.downloaded": "Descargó un documento",
  "evaluation.created": "Abrió una evaluación",
  "evaluation.scored": "Registró puntajes",
  "evaluation.submitted": "Envió una evaluación",
  "evaluation.approved": "Aprobó una evaluación",
  "evaluation.adjusted": "Ajustó un puntaje",
  "objection.received": "Se recibió una objeción",
  "objection.opened": "Abrió una objeción (vio la identidad del objetante)",
  "objection.assigned": "Asignó una objeción",
  "objection.resolved": "Resolvió una objeción",
  "publication.snapshot.prepared": "Preparó una publicación",
  "publication.snapshot.published": "Publicó contenido",
  "publication.snapshot.withdrawn": "Retiró contenido publicado",
  "ranking.recalculated": "Recalculó el ranking",
  "report.generated": "Generó un informe",
  "report.published": "Publicó un informe",
  "audit.searched": "Consultó la bitácora",
  "audit.exported": "Exportó la bitácora",
};

export default async function Auditoria({
  searchParams,
}: {
  readonly searchParams: Promise<{ action?: string; actorId?: string; page?: string }>;
}) {
  await exigirRol("SUPER_ADMIN");
  const params = await searchParams;

  const query = new URLSearchParams({ page: params.page ?? "1", pageSize: "50" });
  if (params.action) query.set("action", params.action);
  if (params.actorId) query.set("actorId", params.actorId);

  let datos: Respuesta;
  let facetas: Facetas;
  try {
    [datos, facetas] = await Promise.all([
      llamarApi<Respuesta>(`/internal/audit?${query}`),
      llamarApi<Facetas>("/internal/audit/facets"),
    ]);
  } catch (error) {
    if (error instanceof NoAutorizado) redirect("/login");
    throw error;
  }

  const exportar = new URLSearchParams();
  if (params.action) exportar.set("action", params.action);

  return (
    <>
      <CabeceraPagina
        titulo="Bitácora de auditoría"
        descripcion="Registro inmutable de toda operación sensible. Nadie puede editarlo ni borrarlo desde la aplicación — y esta misma consulta queda registrada."
        acciones={
          <a
            href={`/api/auditoria/exportar?${exportar}`}
            className="rounded-md border border-toga-300 bg-white px-4 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
          >
            Exportar a CSV
          </a>
        }
      />

      <div className="px-5 py-6 sm:px-8">
        <form
          method="get"
          className="flex flex-col gap-3 rounded-lg border border-toga-200 bg-white p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="action" className="block text-xs font-medium text-toga-600">
              Tipo de acción
            </label>
            <select
              id="action"
              name="action"
              defaultValue={params.action ?? ""}
              className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todas las acciones</option>
              {facetas.acciones.map((a) => (
                <option key={a.action} value={a.action}>
                  {ACCION[a.action] ?? a.action} ({a.total})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-60">
            <label htmlFor="actorId" className="block text-xs font-medium text-toga-600">
              Persona
            </label>
            <select
              id="actorId"
              name="actorId"
              defaultValue={params.actorId ?? ""}
              className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {facetas.actores.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
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
            <EstadoVacio titulo="Sin eventos" detalle="Ningún evento coincide con el filtro." />
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-toga-500">
              {datos.total} eventos · página {datos.page} de {datos.totalPages}
            </p>

            <ol className="mt-3 space-y-2">
              {datos.items.map((e) => (
                <li key={e.id} className="rounded-lg border border-toga-200 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <time dateTime={e.occurredAt} className="cifra shrink-0 text-xs text-toga-500">
                      {new Date(e.occurredAt).toLocaleString("es-VE", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </time>
                    <span className="font-medium text-toga-900">
                      {ACCION[e.action] ?? e.action}
                    </span>
                    <span className="text-sm text-toga-600">
                      — {e.actor?.fullName ?? "sistema"}
                      {e.effectiveRole && (
                        <span className="ml-1.5 rounded bg-toga-100 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-toga-600">
                          {e.effectiveRole}
                        </span>
                      )}
                    </span>
                  </div>
                  {e.reason && (
                    <p className="mt-1 text-sm leading-relaxed text-toga-600">{e.reason}</p>
                  )}
                  <p className="codigo mt-1 text-[0.65rem] text-toga-400">
                    {e.entityType}
                    {e.entityId && `:${e.entityId.slice(0, 8)}`} · corr.{" "}
                    {e.correlationId.slice(0, 8)}
                  </p>
                </li>
              ))}
            </ol>

            {datos.totalPages > 1 && (
              <nav aria-label="Paginación" className="mt-6 flex justify-center gap-2">
                {datos.page > 1 && (
                  <Link
                    href={`/auditoria?${new URLSearchParams({ ...params, page: String(datos.page - 1) })}`}
                    className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-100"
                  >
                    ← Anterior
                  </Link>
                )}
                {datos.page < datos.totalPages && (
                  <Link
                    href={`/auditoria?${new URLSearchParams({ ...params, page: String(datos.page + 1) })}`}
                    className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-100"
                  >
                    Siguiente →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}
