import Link from "next/link";
import type { Metadata } from "next";
import type { EventoAuditoria } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";

export const metadata: Metadata = { title: "Historial de una entidad" };

/** Los tipos de entidad son nombres del modelo de datos; la pantalla los
 *  traduce a lo que esa entidad significa para quien la consulta. */
const ENTIDAD: Record<string, string> = {
  Candidate: "un expediente",
  CandidateFile: "un expediente digital",
  Document: "un documento",
  Evaluation: "una evaluación",
  Objection: "una objeción",
  PublicationSnapshot: "una publicación",
  Report: "un informe",
  User: "una cuenta de usuario",
};

/**
 * Todo lo que le ha pasado a un expediente, un documento o una evaluación.
 *
 * Es la vista que responde "¿qué se hizo con esto y quién?" sin obligar a
 * filtrar la bitácora entera a mano.
 */
export default async function HistorialEntidad({
  params,
}: {
  readonly params: Promise<{ tipo: string; id: string }>;
}) {
  await exigirRol("SUPER_ADMIN");
  const { tipo, id } = await params;

  let eventos: readonly EventoAuditoria[];
  try {
    eventos = await llamarApi<EventoAuditoria[]>(`/internal/audit/entity/${tipo}/${id}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/auditoria");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo={`Historial de ${ENTIDAD[tipo] ?? tipo}`}
        descripcion="Todas las operaciones registradas sobre esta entidad, en orden cronológico."
        ruta={[{ href: "/auditoria", texto: "Bitácora" }, { texto: ENTIDAD[tipo] ?? tipo }]}
      />

      <div className="px-5 py-6 sm:px-8">
        <p className="codigo text-sm text-toga-500">{id}</p>

        {eventos.length === 0 ? (
          <div className="mt-4">
            <EstadoVacio
              titulo="Sin eventos registrados"
              detalle="Esta entidad no tiene operaciones auditadas todavía."
            />
          </div>
        ) : (
          <ol className="mt-4 space-y-2">
            {eventos.map((e) => (
              <li key={e.id} className="rounded-lg border border-toga-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <time dateTime={e.occurredAt} className="cifra text-xs text-toga-500">
                    {new Date(e.occurredAt).toLocaleString("es-VE", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
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
                  <Link
                    href={`/auditoria/traza/${e.correlationId}`}
                    className="codigo ml-auto text-[0.65rem] text-balanza-700 hover:underline"
                  >
                    traza →
                  </Link>
                </div>
                {e.reason && (
                  <p className="mt-1 text-sm leading-relaxed text-toga-600">{e.reason}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
