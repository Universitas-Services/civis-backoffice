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
import { CLASE_TONO, fechaHora, fechaLarga, restante } from "@/lib/plazos";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { BloqueoTrabajo } from "@/components/bloqueo-trabajo";
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

  // Una objeción abierta la trabaja un solo miembro del comité a la vez. Si
  // otra persona la tiene, se puede leer pero no pronunciarse.
  let ocupada: string | null = null;
  const abierta = ETAPAS_ABIERTAS.includes(o.stage);
  if (abierta) {
    try {
      await llamarApi(`/internal/comite/objeciones/${id}/bloqueo`, { method: "POST" });
    } catch (error) {
      if (error instanceof NoAutorizado) await renovarYVolver(`/comite-objeciones/${id}`);
      if (error instanceof ErrorApi && error.status === 409) ocupada = error.message;
      else throw error;
    }
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
          {abierta && !ocupada && (
            <BloqueoTrabajo
              api={`/api/comite/${encodeURIComponent(o.id)}`}
              volver="/comite-objeciones"
              textoVolver="Volver a la bandeja"
              aviso="Usted tiene esta objeción abierta: los demás miembros del comité la ven bloqueada. Se libera al salir o tras 15 minutos sin actividad."
              perdidoPorDefecto="Otro miembro del comité tomó esta objeción."
            />
          )}
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

          {o.stage !== "RECIBIDA" && o.stage !== "ADMITIDA" && o.stage !== "INADMITIDA" && (
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
          {ocupada ? (
            <div
              role="status"
              className="rounded-lg border border-balanza-600/25 bg-balanza-50 p-4 text-sm text-balanza-700"
            >
              <p className="font-semibold">Objeción en trabajo</p>
              <p className="mt-1">{ocupada}</p>
            </div>
          ) : (
            <Acto o={o} />
          )}
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

/** Aviso del panel lateral cuando todavía no se puede actuar. */
function Espera({
  titulo,
  children,
}: {
  readonly titulo: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-toga-200 bg-white p-4 text-sm">
      <h2 className="font-semibold text-toga-900">{titulo}</h2>
      <div className="mt-1 space-y-2 text-toga-600">{children}</div>
    </div>
  );
}

const pasado = (iso: string | null) => iso !== null && new Date(iso).getTime() <= Date.now();

/**
 * Lo que el comité puede hacer en la etapa actual. Cada etapa transcurre
 * completa: antes de su ventana no hay botones; vencida, se pide el motivo de
 * fuerza mayor.
 */
function Acto({ o }: { readonly o: ObjecionComiteDetalle }) {
  const p = o.plazos;
  if (o.stage === "RECIBIDA") {
    if (p.admision === "ANTES") {
      return (
        <Espera titulo="Admisión">
          <p>
            El lapso de objeciones sigue corriendo
            {p.finLapsoObjeciones && <> hasta el {fechaLarga(p.finLapsoObjeciones)}</>}. El comité
            podrá pronunciarse desde el{" "}
            {p.inicioAdmision ? fechaLarga(p.inicioAdmision) : "día siguiente"}.
          </p>
        </Espera>
      );
    }
    const vencida = p.admision === "DESPUES";
    return (
      <FormularioActoComite
        objectionId={o.id}
        fase="ADMISION"
        trackingCode={o.trackingCode}
        postulante={o.candidate.fullName}
        titulo="Admisión"
        extemporaneo={vencida}
        notificacion={
          vencida
            ? "Por ser fuera de plazo, se notifica en el acto y el descargo corre desde hoy."
            : p.notificacion
              ? `Se notifica el ${fechaLarga(p.notificacion)}, al terminar los días de admisión.`
              : undefined
        }
        ayuda={
          vencida
            ? `Los días de admisión terminaron${p.finAdmision ? ` el ${fechaLarga(p.finAdmision)}` : ""}. Sólo puede pronunciarse indicando un motivo de fuerza mayor.`
            : `Admita la objeción si trae prueba y se refiere a requisitos de elegibilidad; si no, inadmítala. Puede pronunciarse hasta el ${p.finAdmision ? fechaLarga(p.finAdmision) : "fin de los días de admisión"}.`
        }
      />
    );
  }
  if ((o.stage === "ADMITIDA" || o.stage === "INADMITIDA") && o.etapa === "POR_NOTIFICAR") {
    return (
      <Espera
        titulo={o.stage === "ADMITIDA" ? "Admitida · por notificar" : "Inadmitida · por notificar"}
      >
        <p>
          El auto ya está dictado.{" "}
          {o.stage === "ADMITIDA"
            ? "Se notifica al postulado (o a la secretaría)"
            : "Se notifica a la persona objetante"}{" "}
          el{" "}
          {o.notificationDueAt
            ? fechaLarga(o.notificationDueAt)
            : "día siguiente al último día de admisión"}
          {o.stage === "ADMITIDA" && "; desde ese momento corre su plazo de descargo"}.
        </p>
      </Espera>
    );
  }
  if (o.stage === "EN_DESCARGO" || (o.etapa === "POR_DECIDIR" && !pasado(o.decision.desde))) {
    const r = o.descargoDueAt ? restante(o.descargoDueAt) : null;
    return (
      <Espera titulo={o.stage === "EN_DESCARGO" ? "Esperando el descargo" : "Descargo presentado"}>
        <p>
          El plazo de descargo transcurre completo, aunque el postulante ya haya respondido. La
          decisión se habilita
          {o.decision.desde ? <> el {fechaLarga(o.decision.desde)}</> : " al vencer el plazo"}.
        </p>
        {r && <p className={CLASE_TONO[r.tono]}>{r.texto}</p>}
      </Espera>
    );
  }
  if (o.stage === "DESCARGO_PRESENTADO" || o.stage === "SIN_DESCARGO") {
    const vencida = pasado(o.decision.hasta);
    const r = o.verificationDueAt ? restante(o.verificationDueAt) : null;
    return (
      <FormularioActoComite
        objectionId={o.id}
        fase="DECISION"
        trackingCode={o.trackingCode}
        postulante={o.candidate.fullName}
        titulo="Decisión final"
        extemporaneo={vencida}
        ayuda={
          vencida
            ? `El periodo de comprobación terminó${o.verificationDueAt ? ` el ${fechaLarga(o.verificationDueAt)}` : ""}. Sólo puede decidir indicando un motivo de fuerza mayor.`
            : `${
                o.stage === "SIN_DESCARGO"
                  ? "Venció el plazo sin descargo. "
                  : "El postulante presentó su descargo. "
              }Use el periodo de comprobación para pedir informes o verificar datos ante órganos públicos o privados; puede decidir en cualquier momento dentro de él.${
                r ? ` Comprobación: ${r.texto.toLowerCase()}.` : ""
              }`
        }
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
      {(o.admissionLateReason || o.decisionLateReason) && (
        <p className="mt-2 text-xs text-toga-600">
          Fuera de plazo por fuerza mayor: {o.decisionLateReason ?? o.admissionLateReason}
        </p>
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
    if (o.notificationDueAt) {
      hitos.push(
        o.notifiedAt
          ? { texto: "Notificada a quien objetó", fecha: o.notifiedAt }
          : { texto: "Se notifica", fecha: o.notificationDueAt, futuro: true },
      );
    }
  } else if (o.admissionDecidedAt) {
    hitos.push({ texto: "Admitida", fecha: o.admissionDecidedAt });
    if (!o.notifiedAt && o.notificationDueAt) {
      hitos.push({ texto: "Se notifica al postulado", fecha: o.notificationDueAt, futuro: true });
    } else {
      hitos.push({ texto: "Notificada al postulado", fecha: o.notifiedAt ?? o.admissionDecidedAt });
    }
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

/** Etapas en las que el comité todavía tiene algo que hacer: se bloquean al abrirlas. */
const ETAPAS_ABIERTAS: readonly string[] = [
  "RECIBIDA",
  "ADMITIDA",
  "EN_DESCARGO",
  "DESCARGO_PRESENTADO",
  "SIN_DESCARGO",
];
