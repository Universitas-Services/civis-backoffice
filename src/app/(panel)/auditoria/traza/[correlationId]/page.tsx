import type { Metadata } from "next";
import type { EventoAuditoria } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";

export const metadata: Metadata = { title: "Traza de una petición" };

export default async function Traza({
  params,
}: {
  readonly params: Promise<{ correlationId: string }>;
}) {
  await exigirRol("SUPER_ADMIN");
  const { correlationId } = await params;

  let eventos: readonly EventoAuditoria[];
  try {
    eventos = await llamarApi<EventoAuditoria[]>(`/internal/audit/trace/${correlationId}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/auditoria");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Traza de una petición"
        descripcion="Todo lo que ocurrió en una misma llamada al sistema. Con el identificador que la API devuelve en cualquier error se reconstruye exactamente qué pasó."
        ruta={[{ href: "/auditoria", texto: "Bitácora" }, { texto: "Traza" }]}
      />

      <div className="px-5 py-6 sm:px-8">
        <p className="codigo text-sm text-toga-500">{correlationId}</p>

        {eventos.length === 0 ? (
          <div className="mt-4">
            <EstadoVacio
              titulo="Sin eventos para este identificador"
              detalle="O la petición no generó ningún evento auditable, o el identificador no corresponde a este sistema."
            />
          </div>
        ) : (
          <ol className="mt-4 space-y-2">
            {eventos.map((e, i) => (
              <li key={e.id} className="rounded-lg border border-toga-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="cifra text-xs font-semibold text-toga-400">{i + 1}</span>
                  <time dateTime={e.occurredAt} className="cifra text-xs text-toga-500">
                    {new Date(e.occurredAt).toLocaleTimeString("es-VE")}
                  </time>
                  <span className="codigo font-medium text-toga-900">{e.action}</span>
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
                  {e.entityId && `:${e.entityId}`}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
