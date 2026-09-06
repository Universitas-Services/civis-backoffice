import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { ExpedienteDetalle } from "@/contracts";
import { CATEGORIA_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { tieneRol, usuarioActual } from "@/lib/sesion";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import {
  InsigniaAnalisis,
  InsigniaBanda,
  InsigniaClasificacion,
  InsigniaEstado,
  Puntaje,
} from "@/components/insignias";

export const metadata: Metadata = { title: "Expediente" };

export default async function DetalleExpediente({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  const { id } = await params;

  let e: ExpedienteDetalle;
  try {
    e = await llamarApi<ExpedienteDetalle>(`/internal/candidates/${id}`);
  } catch (error) {
    if (error instanceof NoAutorizado) redirect("/login");
    if (error instanceof ErrorApi && error.status === 404) notFound();
    throw error;
  }

  const expediente = e.submissions[0];
  const evaluacion = e.evaluations[0];
  const puedeEvaluar =
    tieneRol(usuario, "SUPER_ADMIN", "EVALUATOR") &&
    ["READY_FOR_EVALUATION", "EVALUATION_IN_PROGRESS"].includes(e.workflowStatus);

  return (
    <>
      <CabeceraPagina
        titulo={`${e.firstName} ${e.lastName}`}
        descripcion={`${SALA_ETIQUETA[e.chamber]} · expediente ${expediente?.fileNumber ?? "—"}`}
        ruta={[
          { href: "/expedientes", texto: "Expedientes" },
          { texto: `${e.firstName} ${e.lastName}` },
        ]}
        acciones={
          puedeEvaluar ? (
            <Link
              href={`/evaluacion/${e.id}`}
              className="rounded-md bg-toga-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-toga-800"
            >
              Evaluar expediente →
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* ── Documentos ──────────────────────────────────────────── */}
        <section aria-labelledby="documentos">
          <h2 id="documentos" className="text-base font-semibold text-toga-900">
            Documentos del expediente
          </h2>

          {!expediente || expediente.documents.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-toga-300 bg-white p-8 text-center text-sm text-toga-500">
              Este expediente todavía no tiene documentos cargados.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {expediente.documents.map((d) => (
                <li key={d.id} className="rounded-lg border border-toga-200 bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate font-medium text-toga-900">
                      {d.originalName}
                    </span>
                    <span className="shrink-0 text-xs text-toga-500">
                      {CATEGORIA_ETIQUETA[d.category]} · {Math.round(d.sizeBytes / 1024)} KB
                      {d.version > 1 && ` · versión ${d.version}`}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <InsigniaClasificacion valor={d.classification} />
                    <InsigniaAnalisis valor={d.scanStatus} />
                  </div>
                  <p className="codigo mt-2 break-all text-[0.7rem] text-toga-400">
                    SHA-256: {d.sha256}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Estado ──────────────────────────────────────────────── */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-toga-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-toga-900">Estado</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-xs text-toga-500">Etapa del flujo</p>
                <div className="mt-1">
                  <InsigniaEstado estado={e.workflowStatus} />
                </div>
              </div>
              <div>
                <p className="text-xs text-toga-500">Publicación</p>
                <p className="mt-0.5 font-medium text-toga-900">{e.publicationStatus}</p>
              </div>
              <div>
                <p className="text-xs text-toga-500">Recibido</p>
                <p className="mt-0.5 text-toga-700">
                  {new Date(e.receivedAt).toLocaleString("es-VE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              {e._count.objections > 0 && (
                <div>
                  <p className="text-xs text-toga-500">Objeciones</p>
                  <Link
                    href={`/objeciones?candidato=${e.id}`}
                    className="mt-0.5 inline-block font-semibold text-balanza-700 hover:underline"
                  >
                    <span className="cifra">{e._count.objections}</span> recibidas →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {evaluacion && (
            <div className="rounded-lg border border-toga-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-toga-900">Evaluación vigente</h2>
              <div className="mt-3">
                <Puntaje valor={Number(evaluacion.totalPoints)} />
              </div>
              <div className="mt-3">
                <InsigniaBanda
                  banda={evaluacion.ineligible ? "INELIGIBLE" : (evaluacion.band as never)}
                />
              </div>
            </div>
          )}

          {/* Los datos internos van aparte y rotulados: quien mira la pantalla
              debe saber en todo momento qué se publica y qué no. */}
          <div className="rounded-lg border border-toga-300 bg-toga-100 p-5">
            <h2 className="text-sm font-semibold text-toga-900">
              <span aria-hidden="true" className="mr-1.5">
                🔒
              </span>
              Datos internos
            </h2>
            <p className="mt-1 text-xs text-toga-500">No se publican en ningún caso.</p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-toga-500">Cédula</dt>
                <dd className="codigo text-toga-900">{e.nationalId}</dd>
              </div>
              {e.email && (
                <div>
                  <dt className="text-xs text-toga-500">Correo</dt>
                  <dd className="break-all text-toga-900">{e.email}</dd>
                </div>
              )}
              {e.phone && (
                <div>
                  <dt className="text-xs text-toga-500">Teléfono</dt>
                  <dd className="text-toga-900">{e.phone}</dd>
                </div>
              )}
              {e.internalNotes && (
                <div>
                  <dt className="text-xs text-toga-500">Notas</dt>
                  <dd className="leading-relaxed text-toga-700">{e.internalNotes}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
