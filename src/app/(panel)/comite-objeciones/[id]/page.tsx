import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ObjecionComiteDetalle } from "@/contracts";
import {
  CAUSA_DENUNCIA_ETIQUETA,
  CAUSAL_ETIQUETA,
  ETAPA_OBJECION_ETIQUETA,
  SALA_ETIQUETA,
} from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CLASE_TONO, fechaHora, restante } from "@/lib/plazos";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { VistaDescargo } from "@/components/vista-descargo";
import { FormularioActoComite } from "@/components/formulario-acto-comite";
import { ListaAutos } from "@/components/lista-autos";

export const metadata: Metadata = { title: "Objeción — comité" };

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

  const responde = o.candidate.conCuenta
    ? "El postulante presenta el descargo desde su cuenta."
    : "El expediente lo cargó la secretaría: ella contacta al postulante y carga su descargo.";

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

          {o.stage !== "RECIBIDA" && o.stage !== "INADMITIDA" && (
            <section aria-labelledby="descargo">
              <h2 id="descargo" className="text-base font-semibold text-toga-900">
                Descargo del postulante
              </h2>
              {o.stage === "EN_DESCARGO" && (
                <p className="mt-1 text-sm text-toga-500">{responde}</p>
              )}
              {(o.descargo || o.stage !== "EN_DESCARGO") && (
                <div className="mt-3">
                  <VistaDescargo
                    objectionId={o.id}
                    descargo={o.descargo}
                    motivoSinDescargo={
                      o.stage === "SIN_DESCARGO" || (!o.descargo && o.finalDecidedAt)
                        ? "Venció el plazo sin que el postulante presentara descargo."
                        : null
                    }
                  />
                </div>
              )}
            </section>
          )}

          {o.autos.length > 0 && (
            <section aria-labelledby="autos">
              <h2 id="autos" className="text-base font-semibold text-toga-900">
                Autos del comité
              </h2>
              <div className="mt-3">
                <ListaAutos objectionId={o.id} autos={o.autos} />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <Acto o={o} />
          <LineaDeTiempo o={o} />

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
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}

/** Lo que el comité puede hacer en la etapa actual. */
function Acto({ o }: { readonly o: ObjecionComiteDetalle }) {
  if (o.stage === "RECIBIDA") {
    return (
      <FormularioActoComite
        objectionId={o.id}
        fase="ADMISION"
        trackingCode={o.trackingCode}
        postulante={o.candidate.fullName}
        titulo="Admisión"
        ayuda={
          o.plazos.lapsoAbierto
            ? "El lapso de objeciones sigue abierto. Puede pronunciarse ya, aunque lo habitual es hacerlo al cerrarlo."
            : `Admita la objeción si trae prueba y se refiere a requisitos de elegibilidad; si no, inadmítala. Tiene ${o.plazos.admisionDias} días continuos desde el cierre del lapso.`
        }
      />
    );
  }
  if (o.stage === "EN_DESCARGO") {
    const r = o.descargoDueAt ? restante(o.descargoDueAt) : null;
    return (
      <div className="rounded-lg border border-toga-200 bg-white p-4 text-sm">
        <h2 className="font-semibold text-toga-900">Esperando el descargo</h2>
        <p className="mt-1 text-toga-600">
          La decisión se habilita cuando llegue el descargo o venza el plazo.
        </p>
        {r && <p className={`mt-2 ${CLASE_TONO[r.tono]}`}>{r.texto}</p>}
      </div>
    );
  }
  if (o.stage === "DESCARGO_PRESENTADO" || o.stage === "SIN_DESCARGO") {
    const r = o.verificationDueAt ? restante(o.verificationDueAt) : null;
    return (
      <FormularioActoComite
        objectionId={o.id}
        fase="DECISION"
        trackingCode={o.trackingCode}
        postulante={o.candidate.fullName}
        titulo="Decisión final"
        ayuda={`${
          o.stage === "SIN_DESCARGO"
            ? "Venció el plazo sin descargo. "
            : "El postulante presentó su descargo. "
        }Use el periodo de comprobación para pedir informes o verificar datos; después decida.${
          r ? ` Comprobación: ${r.texto.toLowerCase()}.` : ""
        }`}
      />
    );
  }
  const clase =
    o.stage === "CON_LUGAR"
      ? "border-balanza-600/25 bg-balanza-50 text-balanza-700"
      : "border-toga-200 bg-toga-50 text-toga-700";
  return (
    <div className={`rounded-lg border p-4 text-sm ${clase}`}>
      <p className="font-semibold">{ETAPA_OBJECION_ETIQUETA[o.stage]}</p>
      <p className="mt-1">
        {o.stage === "CON_LUGAR"
          ? "Está en manos del Consejo, que declara la inelegibilidad o ajusta el puntaje."
          : o.stage === "SIN_LUGAR"
            ? "Se desestimó y se ratificó la elegibilidad del postulante."
            : "No se admitió. El postulante no la verá."}
      </p>
      {o.committeeNotes && (
        <p className="mt-2 whitespace-pre-wrap text-toga-700">{o.committeeNotes}</p>
      )}
    </div>
  );
}

/** Hitos del procedimiento con sus fechas. */
function LineaDeTiempo({ o }: { readonly o: ObjecionComiteDetalle }) {
  const hitos: { texto: string; fecha: string | null; futuro?: boolean }[] = [
    { texto: "Recibida", fecha: o.receivedAt },
  ];
  if (o.stage === "INADMITIDA") {
    hitos.push({ texto: "Inadmitida", fecha: o.admissionDecidedAt });
  } else if (o.admissionDecidedAt) {
    hitos.push({ texto: "Admitida y notificada", fecha: o.notifiedAt ?? o.admissionDecidedAt });
    if (o.descargo) {
      hitos.push({ texto: "Descargo presentado", fecha: o.descargo.createdAt });
    } else if (o.noDescargoAt) {
      hitos.push({ texto: "Venció sin descargo", fecha: o.descargoDueAt });
    } else if (o.descargoDueAt) {
      hitos.push({ texto: "Vence el descargo", fecha: o.descargoDueAt, futuro: true });
    }
    if (o.finalDecidedAt) {
      hitos.push({ texto: ETAPA_OBJECION_ETIQUETA[o.stage], fecha: o.finalDecidedAt });
    } else if (o.verificationDueAt) {
      hitos.push({ texto: "Fin de la comprobación", fecha: o.verificationDueAt, futuro: true });
    }
  }
  return (
    <div className="rounded-lg border border-toga-200 bg-white p-4 text-sm">
      <h2 className="font-semibold text-toga-900">Procedimiento</h2>
      <ol className="mt-3 space-y-2.5">
        {hitos.map((h) => (
          <li key={h.texto} className="flex gap-3">
            <span
              aria-hidden="true"
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                h.futuro ? "border border-toga-400 bg-white" : "bg-toga-700"
              }`}
            />
            <div>
              <p className={h.futuro ? "text-toga-500" : "font-medium text-toga-900"}>{h.texto}</p>
              {h.fecha && <p className="text-xs text-toga-500">{fechaHora(h.fecha)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
