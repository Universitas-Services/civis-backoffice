import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { History, Lock, Scale } from "lucide-react";
import type { ExpedienteDetalle } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { renovarYVolver } from "@/lib/rutas";
import { tieneRol, usuarioActual } from "@/lib/sesion";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import {
  InsigniaBanda,
  InsigniaEstado,
  InsigniaPublicacion,
  Puntaje,
} from "@/components/insignias";
import { SeccionDocumentosExpediente } from "@/components/seccion-documentos-expediente";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    if (error instanceof NoAutorizado) renovarYVolver("/expedientes");
    if (error instanceof ErrorApi && error.status === 404) notFound();
    throw error;
  }

  const expediente = e.submissions[0];
  const evaluacion = e.evaluations[0];
  const puedeEvaluar =
    tieneRol(usuario, "SUPER_ADMIN", "EVALUATOR") &&
    ["READY_FOR_EVALUATION", "EVALUATION_IN_PROGRESS"].includes(e.workflowStatus);

  const puedeCargar =
    tieneRol(usuario, "SUPER_ADMIN", "SECRETARY") &&
    ["DRAFT", "DOCUMENT_REVIEW"].includes(e.workflowStatus);

  return (
    <>
      <CabeceraPagina
        titulo={`${e.firstName} ${e.lastName}`}
        descripcion={`${SALA_ETIQUETA[e.chamber]} · expediente ${expediente?.fileNumber ?? "—"}`}
        ruta={[
          { href: "/expedientes", texto: "Expedientes" },
          { texto: `${e.firstName} ${e.lastName}` },
        ]}
        meta={
          <dl className="flex flex-wrap items-end gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-toga-500">Etapa del flujo</dt>
              <dd className="mt-1">
                <InsigniaEstado estado={e.workflowStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Publicación</dt>
              <dd className="mt-1">
                <InsigniaPublicacion estado={e.publicationStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Recibido</dt>
              <dd className="mt-0.5 text-toga-700">
                {new Date(e.receivedAt).toLocaleString("es-VE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-toga-500">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Cédula
                <span className="font-normal text-toga-400">(interno)</span>
              </dt>
              <dd className="codigo mt-0.5 font-medium text-toga-900">{e.nationalId}</dd>
            </div>
            {e.email && (
              <div>
                <dt className="text-xs text-toga-500">
                  Correo <span className="font-normal text-toga-400">(interno)</span>
                </dt>
                <dd className="mt-0.5 break-all text-toga-900">{e.email}</dd>
              </div>
            )}
            {e.phone && (
              <div>
                <dt className="text-xs text-toga-500">
                  Teléfono <span className="font-normal text-toga-400">(interno)</span>
                </dt>
                <dd className="mt-0.5 text-toga-900">{e.phone}</dd>
              </div>
            )}
            {(e._count?.objections ?? 0) > 0 && (
              <div>
                <dt className="text-xs text-toga-500">Objeciones</dt>
                <dd className="mt-0.5">
                  <Link
                    href={`/objeciones?candidato=${e.id}`}
                    className="font-semibold text-balanza-700 hover:underline"
                  >
                    <span className="cifra">{e._count?.objections ?? 0}</span> recibidas →
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        }
        acciones={
          <div className="flex flex-wrap items-center gap-3">
            {tieneRol(usuario, "SUPER_ADMIN") && (
              <Link
                href={`/auditoria/entidad/Candidate/${e.id}`}
                className="inline-flex items-center gap-2 rounded-md border border-toga-300 px-4 py-2.5 text-sm font-medium text-toga-700 hover:border-toga-400"
              >
                <History className="h-4 w-4" aria-hidden="true" />
                Ver historial
              </Link>
            )}
            {puedeEvaluar && (
              <Link
                href={`/evaluacion/${e.id}`}
                className="inline-flex items-center gap-2 rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
              >
                <Scale className="h-4 w-4" aria-hidden="true" />
                Evaluar expediente
              </Link>
            )}
          </div>
        }
      />

      {/* Ancho completo como en «nuevo expediente» para alinear el checklist de docs. */}
      <div className="space-y-6 px-5 py-6 sm:px-8">
        <SeccionDocumentosExpediente
          candidateId={e.id}
          submissionId={expediente?.id ?? null}
          workflowStatus={e.workflowStatus}
          documentos={expediente?.documents ?? []}
          puedeCargar={puedeCargar}
        />

        {evaluacion && (
          <Card>
            <CardHeader>
              <CardTitle>Evaluación vigente</CardTitle>
            </CardHeader>
            <CardContent>
              <Puntaje valor={Number(evaluacion.totalPoints)} />
              <div className="mt-3">
                <InsigniaBanda
                  banda={evaluacion.ineligible ? "INELIGIBLE" : (evaluacion.band as never)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {e.internalNotes && (
          <Card className="border-toga-300 bg-toga-100 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-toga-600" aria-hidden="true" />
                Notas internas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-toga-700">{e.internalNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
