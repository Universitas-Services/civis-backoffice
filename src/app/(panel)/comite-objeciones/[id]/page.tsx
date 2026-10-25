import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ObjecionComiteDetalle } from "@/contracts";
import { CAUSA_DENUNCIA_ETIQUETA, CAUSAL_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { VistaDescargo } from "@/components/vista-descargo";
import { FormularioEnviarConsejo } from "@/components/formulario-enviar-consejo";

export const metadata: Metadata = { title: "Objeción — comité" };

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Caracas",
  });

export default async function ObjecionDelComite({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "COMMITTEE");
  const { id } = await params;

  let o: ObjecionComiteDetalle;
  try {
    // Abrirla expone la identidad del objetante: la API registra esta lectura.
    o = await llamarApi<ObjecionComiteDetalle>(`/internal/comite/objeciones/${id}`);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver(`/comite-objeciones/${id}`);
    if (error instanceof ErrorApi && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const causales =
    o.causes.length > 0
      ? o.causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c)
      : [CAUSAL_ETIQUETA[o.category] ?? o.category];
  if (o.otherCause) causales.push(o.otherCause);

  return (
    <>
      <CabeceraPagina
        titulo={`Objeción ${o.trackingCode}`}
        descripcion={`Contra ${o.candidate.fullName} · ${SALA_ETIQUETA[o.candidate.chamber] ?? o.candidate.chamber}${o.candidate.fileNumber ? ` · ${o.candidate.fileNumber}` : ""}`}
        ruta={[{ href: "/comite-objeciones", texto: "Comité" }, { texto: o.trackingCode }]}
      />

      <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section aria-labelledby="hechos">
            <h2 id="hechos" className="text-base font-semibold text-toga-900">
              Objeción
            </h2>
            {causales.length > 0 && (
              <p className="mt-2 text-sm text-toga-600">
                <span className="font-medium text-toga-800">Causales:</span> {causales.join(" · ")}
              </p>
            )}
            <div className="prosa mt-3 whitespace-pre-wrap rounded-lg border border-toga-200 bg-white p-5 text-base leading-relaxed text-toga-700">
              {o.description}
            </div>
            {o.evidenceUrl && (
              <p className="mt-2 text-sm">
                <span className="text-toga-500">Evidencia: </span>
                <a
                  href={o.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-balanza-700 hover:text-balanza-600"
                >
                  {o.evidenceUrl}
                </a>
              </p>
            )}
          </section>

          <section aria-labelledby="descargo">
            <h2 id="descargo" className="text-base font-semibold text-toga-900">
              Descargo del postulante
            </h2>
            {!o.descargo && !o.forwardedAt && (
              <p className="mt-1 text-sm text-toga-500">
                {o.candidate.conCuenta
                  ? "El postulante tiene cuenta y ya puede ver esta objeción para responderla."
                  : "El expediente lo cargó la secretaría: ella contacta al postulante y carga su descargo."}
              </p>
            )}
            <div className="mt-3">
              <VistaDescargo
                objectionId={o.id}
                descargo={o.descargo}
                motivoSinDescargo={o.forwardedAt ? o.forwardReason : null}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          {o.forwardedAt ? (
            <div className="rounded-lg border border-validado-700/25 bg-validado-50 p-4 text-sm text-validado-700">
              <p className="font-semibold">Enviada al Consejo</p>
              <p className="mt-1">
                {fechaHora(o.forwardedAt)}
                {o.forwardedBy ? ` · por ${o.forwardedBy.fullName}` : ""}
              </p>
            </div>
          ) : (
            <FormularioEnviarConsejo
              objectionId={o.id}
              trackingCode={o.trackingCode}
              postulante={o.candidate.fullName}
              conDescargo={o.descargo !== null}
            />
          )}

          <div className="rounded-lg border border-toga-200 bg-white p-4 text-sm">
            <h2 className="font-semibold text-toga-900">Quién objeta</h2>
            <p className="mt-0.5 text-xs text-toga-500">
              Reservado: el postulante y la secretaría no lo ven.
            </p>
            <dl className="mt-3 space-y-1.5 text-toga-700">
              <div>
                <dt className="sr-only">Nombre</dt>
                <dd className="font-medium text-toga-900">
                  {o.objectorFullName}
                  {o.submittedBy && (
                    <span className="font-normal text-toga-500"> (visualizador)</span>
                  )}
                </dd>
              </div>
              {o.objectorNationalId && (
                <div>
                  <dt className="inline text-toga-500">Cédula: </dt>
                  <dd className="codigo inline">{o.objectorNationalId}</dd>
                </div>
              )}
              <div>
                <dt className="inline text-toga-500">Correo: </dt>
                <dd className="inline break-all">{o.objectorEmail}</dd>
              </div>
              <div>
                <dt className="inline text-toga-500">Recibida: </dt>
                <dd className="inline">{fechaHora(o.receivedAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
