import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { AjustesPortal, MiObjecion, OpinionPostulante, ResultadoRanking } from "@/contracts";
import { ESTADO_PUBLICO_OBJECION } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { PastillaBanda, salaDe } from "@/components/ranking-interno";
import { FormularioObjecion, FormularioOpinion } from "@/components/formularios-visualizador";

export const metadata: Metadata = { title: "Opiniones y objeciones" };

const NO_DISPONIBLE = "Esta función todavía no está disponible en el servidor.";

function fecha(iso: string) {
  return new Date(iso).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Lee una lista que la API puede no tener aún (404) o no mostrar a este rol
 * (403). En esos casos la pantalla sigue en pie y explica qué falta.
 */
async function leerLista<T>(ruta: string, volver: string): Promise<readonly T[] | null> {
  try {
    return await llamarApi<T[]>(ruta);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver(volver);
    if (error instanceof ErrorApi && (error.status === 404 || error.status === 403)) return null;
    throw error;
  }
}

export default async function FichaRanking({
  params,
}: {
  readonly params: Promise<{ candidateId: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR", "VIEWER");
  const { candidateId } = await params;
  const volver = `/ranking/${candidateId}`;
  const esVisualizador = usuario.roles.includes("VIEWER");

  let ranking: ResultadoRanking;
  try {
    ranking = await llamarApi<ResultadoRanking>("/internal/ranking");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver(volver);
    throw error;
  }
  const fila = ranking.entries.find((e) => e.candidateId === candidateId && !e.ineligible);
  if (!fila) notFound();

  const [opiniones, misObjeciones, portal] = await Promise.all([
    leerLista<OpinionPostulante>(`/internal/candidates/${candidateId}/opinions`, volver),
    esVisualizador
      ? leerLista<MiObjecion>(
          `/internal/objections/mine?candidateId=${encodeURIComponent(candidateId)}`,
          volver,
        )
      : Promise.resolve(null),
    llamarApi<AjustesPortal>("/internal/portal").catch(() => null),
  ]);
  const objecionesAbiertas = portal?.viewerObjectionsOpen ?? false;

  return (
    <>
      <CabeceraPagina
        titulo={fila.fullName}
        descripcion={salaDe(fila.chamber)}
        ruta={[{ href: "/ranking", texto: "Ranking interno" }, { texto: fila.fullName }]}
        meta={
          <dl className="flex flex-wrap items-end gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-toga-500">Posición</dt>
              <dd className="cifra mt-0.5 font-semibold text-toga-900">
                {fila.position ?? "—"}
                {fila.tied && <span className="ml-1.5 text-xs text-balanza-700">empate</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Puntaje</dt>
              <dd className="cifra mt-0.5 font-semibold text-toga-900">{fila.total}</dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Estatus</dt>
              <dd className="mt-1">
                <PastillaBanda band={fila.band} />
              </dd>
            </div>
          </dl>
        }
        acciones={
          <Link
            href={`/expedientes/${candidateId}`}
            className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-50"
          >
            Ver expediente
          </Link>
        }
      />

      <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-2">
        <section id="opinar" aria-labelledby="titulo-opiniones" className="scroll-mt-6">
          <h2 id="titulo-opiniones" className="text-base font-semibold text-toga-900">
            Opiniones
          </h2>
          <p className="mt-1 text-sm text-toga-500">
            Comentarios de los visualizadores. No modifican el puntaje ni abren un trámite.
          </p>

          <div className="mt-4">
            {opiniones === null ? (
              <EstadoVacio titulo="Opiniones no disponibles" detalle={NO_DISPONIBLE} />
            ) : opiniones.length === 0 ? (
              <EstadoVacio
                titulo="Todavía nadie opinó sobre este postulante"
                detalle={
                  esVisualizador
                    ? "Sea el primero: su opinión la verán los demás visualizadores y el equipo del proceso."
                    : "Las opiniones de los visualizadores aparecerán aquí."
                }
              />
            ) : (
              <ol className="space-y-3">
                {opiniones.map((o) => (
                  <li key={o.id} className="rounded-lg border border-toga-200 bg-white p-4">
                    <p className="text-xs text-toga-500">
                      <span className="font-medium text-toga-700">{o.author.fullName}</span> ·{" "}
                      <time dateTime={o.createdAt}>{fecha(o.createdAt)}</time>
                    </p>
                    <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-toga-800">
                      {o.body}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {esVisualizador && opiniones !== null && (
            <div className="mt-5">
              <FormularioOpinion candidateId={candidateId} />
            </div>
          )}
        </section>

        {esVisualizador && (
          <section id="objetar" aria-labelledby="titulo-objetar" className="scroll-mt-6">
            <h2 id="titulo-objetar" className="text-base font-semibold text-toga-900">
              Objetar
            </h2>
            <p className="mt-1 text-sm text-toga-500">
              Una objeción formal queda registrada a su nombre. La recibe el comité, que pide el
              descargo del postulante y la envía al Consejo. Por sí sola no cambia el puntaje.
            </p>
            {objecionesAbiertas ? (
              <div className="mt-4">
                <FormularioObjecion candidateId={candidateId} postulante={fila.fullName} />
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-toga-200 bg-toga-50 px-4 py-3 text-sm text-toga-600">
                La presentación de objeciones no está habilitada en este momento. Puede seguir
                consultando las que ya presentó.
              </p>
            )}

            <h3 className="mt-8 text-sm font-semibold text-toga-900">
              Mis objeciones a este postulante
            </h3>
            {misObjeciones === null ? (
              <p className="mt-2 text-sm text-toga-500">{NO_DISPONIBLE}</p>
            ) : misObjeciones.length === 0 ? (
              <p className="mt-2 text-sm text-toga-500">
                No ha presentado objeciones a este postulante.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-toga-100 rounded-lg border border-toga-200 bg-white text-sm">
                {misObjeciones.map((m) => (
                  <li
                    key={m.trackingCode}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                  >
                    <span className="codigo text-toga-900">{m.trackingCode}</span>
                    <span className="flex flex-wrap items-center gap-3 text-xs text-toga-500">
                      <span>
                        {fecha(m.receivedAt)} ·{" "}
                        {ESTADO_PUBLICO_OBJECION[m.publicStatus] ?? m.publicStatus}
                      </span>
                      <a
                        href={`/api/objeciones/mias/${encodeURIComponent(m.trackingCode)}/pdf`}
                        className="rounded-md border border-toga-300 bg-white px-2.5 py-1 text-xs font-semibold text-toga-700 hover:bg-toga-50"
                      >
                        Descargar PDF
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
