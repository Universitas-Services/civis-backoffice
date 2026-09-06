import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ObjecionDetalle } from "@/contracts";
import { CAUSAL_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { InsigniaObjecion } from "@/components/insignias";

export const metadata: Metadata = { title: "Objeción" };

export default async function DetalleObjecion({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "EVALUATOR");
  const { id } = await params;

  let o: ObjecionDetalle;
  try {
    // Abrir la objeción es lo que expone la identidad del objetante, y por eso
    // la API registra esta lectura como `objection.opened`.
    o = await llamarApi<ObjecionDetalle>(`/internal/objections/${id}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/objeciones");
    if (error instanceof ErrorApi && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo={`Objeción ${o.trackingCode}`}
        descripcion={`Contra ${o.candidate.firstName} ${o.candidate.lastName} · ${SALA_ETIQUETA[o.candidate.chamber]} · ${CAUSAL_ETIQUETA[o.category] ?? o.category}`}
        ruta={[{ href: "/objeciones", texto: "Objeciones" }, { texto: o.trackingCode }]}
      />

      <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="hechos">
          <h2 id="hechos" className="text-base font-semibold text-toga-900">
            Relación de hechos
          </h2>
          <div className="prosa mt-3 whitespace-pre-wrap rounded-lg border border-toga-200 bg-white p-5 text-base leading-relaxed text-toga-700">
            {o.description}
          </div>

          {o.attachments.length > 0 && (
            <>
              <h2 className="mt-6 text-base font-semibold text-toga-900">Pruebas aportadas</h2>
              <ul className="mt-3 space-y-2">
                {o.attachments.map((a) => (
                  <li key={a.id} className="rounded-lg border border-toga-200 bg-white px-4 py-3">
                    <p className="text-sm font-medium text-toga-900">{a.originalName}</p>
                    <p className="codigo mt-1 break-all text-[0.7rem] text-toga-400">
                      {Math.round(a.sizeBytes / 1024)} KB · SHA-256: {a.sha256}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {o.resolution && (
            <>
              <h2 className="mt-6 text-base font-semibold text-toga-900">Resolución</h2>
              <div className="prosa mt-3 rounded-lg border border-toga-200 bg-white p-5 text-base leading-relaxed text-toga-700">
                {o.resolution}
              </div>
            </>
          )}

          {o.adjustments.length > 0 && (
            <>
              <h2 className="mt-6 text-base font-semibold text-toga-900">
                Ajustes derivados de esta objeción
              </h2>
              <ul className="mt-3 space-y-2">
                {o.adjustments.map((a) => (
                  <li key={a.id} className="rounded-lg border border-toga-200 bg-white px-4 py-3">
                    <p className="text-sm">
                      <span className="codigo">{a.criterionKey}</span>{" "}
                      <span className="cifra font-semibold text-toga-900">
                        {Number(a.previousValue)} → {Number(a.newValue)}
                      </span>
                      <span className="ml-2 text-xs text-toga-500">
                        por {a.requestedBy?.fullName ?? "—"}
                      </span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-toga-600">{a.reason}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-toga-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-toga-900">Estado</h2>
            <div className="mt-3">
              <InsigniaObjecion estado={o.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-toga-500">Recibida</dt>
                <dd className="text-toga-700">
                  {new Date(o.receivedAt).toLocaleString("es-VE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-toga-500">Asignada a</dt>
                <dd className="text-toga-700">{o.assignedTo?.fullName ?? "Sin asignar"}</dd>
              </div>
            </dl>
            <Link
              href={`/expedientes/${o.candidate.id}`}
              className="mt-4 inline-block text-sm font-medium text-balanza-700 hover:underline"
            >
              Ver el expediente →
            </Link>
          </div>

          {/* Los datos del objetante van en un recuadro aparte y rotulado:
              quien mira la pantalla debe saber que está viendo información
              protegida, y que su consulta quedó registrada. */}
          <div className="rounded-lg border border-toga-300 bg-toga-100 p-5">
            <h2 className="text-sm font-semibold text-toga-900">
              <span aria-hidden="true" className="mr-1.5">
                🔒
              </span>
              Identidad del objetante
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-toga-500">
              No se publica en ningún caso. Su consulta de esta pantalla quedó registrada en la
              bitácora.
            </p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-toga-500">Nombre</dt>
                <dd className="text-toga-900">{o.objectorFullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-toga-500">Correo</dt>
                <dd className="break-all text-toga-900">{o.objectorEmail}</dd>
              </div>
              {o.objectorNationalId && (
                <div>
                  <dt className="text-xs text-toga-500">Cédula</dt>
                  <dd className="codigo text-toga-900">{o.objectorNationalId}</dd>
                </div>
              )}
              {o.objectorPhone && (
                <div>
                  <dt className="text-xs text-toga-500">Teléfono</dt>
                  <dd className="text-toga-900">{o.objectorPhone}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-toga-500">Consintió el tratamiento</dt>
                <dd className="text-toga-700">
                  {new Date(o.privacyConsentAt).toLocaleDateString("es-VE", {
                    dateStyle: "medium",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
