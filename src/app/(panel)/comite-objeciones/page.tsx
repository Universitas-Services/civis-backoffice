import type { Metadata } from "next";
import Link from "next/link";
import type { BandejaComite, EtapaComite, ObjecionComite, PlazosComite } from "@/contracts";
import { CAUSA_DENUNCIA_ETIQUETA, CAUSAL_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { CLASE_TONO, fechaCorta as fecha, fechaLarga, restante } from "@/lib/plazos";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { Paginacion } from "@/components/paginacion";

export const metadata: Metadata = { title: "Comité de objeciones" };

const PAGE_SIZE = 10;

/** Pestañas: valor en la URL, etapa de la API y etiqueta. */
const FILTROS = [
  { valor: undefined, etapa: "RECIBIDAS", etiqueta: "Por admitir" },
  { valor: "por_notificar", etapa: "POR_NOTIFICAR", etiqueta: "Por notificar" },
  { valor: "en_descargo", etapa: "EN_DESCARGO", etiqueta: "En descargo" },
  { valor: "por_decidir", etapa: "POR_DECIDIR", etiqueta: "Por decidir" },
  { valor: "decididas", etapa: "DECIDIDAS", etiqueta: "Decididas" },
] as const satisfies readonly {
  valor: string | undefined;
  etapa: EtapaComite;
  etiqueta: string;
}[];

const VACIO: Record<EtapaComite, string> = {
  RECIBIDAS: "No hay objeciones pendientes de admisión.",
  POR_NOTIFICAR: "No hay pronunciamientos de admisión esperando su notificación.",
  EN_DESCARGO: "Ninguna objeción admitida espera el descargo del postulante.",
  POR_DECIDIR: "No hay objeciones pendientes de decisión.",
  DECIDIDAS: "Todavía no se ha decidido ninguna objeción.",
};

export default async function BandejaDelComite({
  searchParams,
}: {
  readonly searchParams: Promise<{ etapa?: string; page?: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "COMMITTEE");

  const params = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === params.etapa) ?? FILTROS[0];
  const page = Math.max(1, Number(params.page) || 1);
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    etapa: filtro.etapa,
  });

  let datos: BandejaComite;
  try {
    datos = await llamarApi<BandejaComite>(`/internal/comite/objeciones?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/comite-objeciones");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Comité de objeciones"
        descripcion="Toda objeción llega primero aquí. Cada etapa transcurre completa antes de la siguiente: terminado el lapso, admítala o inadmítala en los días de admisión (se notifica al día siguiente del último); vencido el descargo del postulante, decida con lugar (pasa al Consejo) o sin lugar."
      />

      <div className="px-5 py-6 sm:px-8">
        <AvisoLapso plazos={datos.plazos} />
        <nav aria-label="Filtrar por etapa" className="-mx-1 flex flex-wrap gap-1.5">
          {FILTROS.map((f) => {
            const activo = f.etapa === filtro.etapa;
            return (
              <Link
                key={f.etapa}
                href={f.valor ? `/comite-objeciones?etapa=${f.valor}` : "/comite-objeciones"}
                aria-current={activo ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activo
                    ? "border-balanza-600 bg-balanza-50 text-balanza-700"
                    : "border-toga-200 bg-white text-toga-600 hover:border-toga-300 hover:text-toga-900"
                }`}
              >
                {f.etiqueta}
                <span className="cifra ml-1.5 text-xs text-toga-400">
                  ({datos.resumen[f.etapa] ?? 0})
                </span>
              </Link>
            );
          })}
        </nav>

        {datos.items.length === 0 ? (
          <div className="mt-4">
            <EstadoVacio titulo="Nada en esta etapa" detalle={VACIO[filtro.etapa]} />
          </div>
        ) : (
          <>
            {/* Escritorio */}
            <div className="mt-4 hidden overflow-hidden rounded-lg border border-toga-200 bg-white xl:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Objeciones en manos del comité</caption>
                <thead className="border-b-2 border-toga-300 bg-toga-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Objeción
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Postulante
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Causales
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Situación
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Abrir</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-toga-100">
                  {datos.items.map((o) => (
                    <tr key={o.id} className="align-top hover:bg-toga-50">
                      <th scope="row" className="px-4 py-3 text-left font-normal">
                        <span className="codigo text-toga-900">{o.trackingCode}</span>
                        <p className="mt-0.5 text-xs text-toga-500">
                          Recibida el {fecha(o.receivedAt)}
                        </p>
                      </th>
                      <td className="px-4 py-3">
                        <p className="font-medium text-toga-900">{o.candidate.fullName}</p>
                        <p className="mt-0.5 text-xs text-toga-500">
                          {SALA_ETIQUETA[o.candidate.chamber] ?? o.candidate.chamber}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-toga-600">
                        <Causales causes={o.causes} category={o.category} />
                      </td>
                      <td className="px-4 py-3">
                        <Situacion o={o} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <EnlaceAbrir id={o.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tableta y teléfono */}
            <ul className="mt-4 space-y-3 xl:hidden">
              {datos.items.map((o) => (
                <li key={o.id} className="rounded-lg border border-toga-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-toga-900">{o.candidate.fullName}</p>
                      <p className="mt-0.5 text-xs text-toga-500">
                        <span className="codigo">{o.trackingCode}</span> · recibida el{" "}
                        {fecha(o.receivedAt)}
                      </p>
                    </div>
                    <EnlaceAbrir id={o.id} />
                  </div>
                  <div className="mt-2 text-sm text-toga-600">
                    <Causales causes={o.causes} category={o.category} />
                  </div>
                  <div className="mt-3 border-t border-toga-100 pt-3">
                    <Situacion o={o} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <Paginacion
          ruta="/comite-objeciones"
          page={datos.page}
          pageSize={datos.pageSize || PAGE_SIZE}
          total={datos.total}
          params={{ etapa: filtro.valor }}
        />
      </div>
    </>
  );
}

function Causales({
  causes,
  category,
}: {
  readonly causes: readonly string[];
  readonly category: string;
}) {
  // Las objeciones anteriores a las causales solo traen la categoría.
  if (causes.length === 0) return <>{CAUSAL_ETIQUETA[category] ?? category}</>;
  return <>{causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c).join(" · ")}</>;
}

const AVISO = "mb-4 rounded-md border border-toga-200 bg-toga-50 px-4 py-3 text-sm text-toga-700";

/** Recordatorio de los plazos del comité según el calendario del proceso. */
function AvisoLapso({ plazos }: { readonly plazos: PlazosComite }) {
  if (!plazos.finAdmision) {
    return plazos.lapsoAbierto ? (
      <p className={AVISO}>
        El lapso de objeciones está abierto, pero el calendario del proceso todavía no tiene fechas:
        se calculan al cerrar las postulaciones o al fijar el inicio del lapso.
      </p>
    ) : null;
  }
  if (plazos.admision === "ANTES") {
    return (
      <p className={AVISO}>
        El lapso de objeciones corre
        {plazos.finLapsoObjeciones && <> hasta el {fechaLarga(plazos.finLapsoObjeciones)}</>}. El
        comité podrá pronunciarse sobre la admisión desde el{" "}
        {plazos.inicioAdmision ? fechaLarga(plazos.inicioAdmision) : "día siguiente"}, durante{" "}
        {plazos.admisionDias} días continuos.
      </p>
    );
  }
  if (plazos.admision === "DESPUES") {
    return (
      <p className={AVISO}>
        Los días de admisión terminaron el {fechaLarga(plazos.finAdmision)}. Sólo se puede
        pronunciar sobre las objeciones pendientes indicando un motivo de fuerza mayor.
      </p>
    );
  }
  const r = restante(plazos.finAdmision);
  return (
    <p className={AVISO}>
      Días de admisión: hasta el {fechaLarga(plazos.finAdmision)} ·{" "}
      <span className={CLASE_TONO[r.tono]}>{r.texto}</span>
      {plazos.notificacion && (
        <> · Los pronunciamientos se notifican el {fechaLarga(plazos.notificacion)}.</>
      )}
    </p>
  );
}

const PASTILLA = "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold";

/** Etapa y plazo de cada objeción. */
function Situacion({ o }: { readonly o: ObjecionComite }) {
  switch (o.stage) {
    case "RECIBIDA":
      return (
        <div>
          <span className={`${PASTILLA} bg-toga-100 text-toga-700`}>Por admitir</span>
          <p className="mt-1 text-xs text-toga-500">
            {o.candidate.conCuenta ? "Postulante con cuenta" : "Expediente de secretaría"}
          </p>
          <EnTrabajo o={o} />
        </div>
      );
    case "ADMITIDA":
    case "INADMITIDA":
      if (o.etapa === "POR_NOTIFICAR") {
        return (
          <div>
            <span className={`${PASTILLA} bg-toga-100 text-toga-700`}>
              {o.stage === "ADMITIDA" ? "Admitida" : "Inadmitida"} · por notificar
            </span>
            {o.notificationDueAt && (
              <p className="mt-1 text-xs text-toga-500">
                Se notifica el {fecha(o.notificationDueAt)}
              </p>
            )}
          </div>
        );
      }
      return <Decidida o={o} />;
    case "EN_DESCARGO": {
      const r = o.descargoDueAt ? restante(o.descargoDueAt) : null;
      return (
        <div>
          <span className={`${PASTILLA} bg-balanza-50 text-balanza-700`}>En descargo</span>
          <p className="mt-1 text-xs text-toga-500">
            {o.candidate.conCuenta ? "Lo presenta el postulante" : "Lo carga la secretaría"}
            {r && (
              <>
                {" · "}
                <span className={CLASE_TONO[r.tono]}>{r.texto}</span>
              </>
            )}
          </p>
        </div>
      );
    }
    case "DESCARGO_PRESENTADO":
    case "SIN_DESCARGO": {
      const r = o.verificationDueAt ? restante(o.verificationDueAt) : null;
      return (
        <div>
          <span
            className={`${PASTILLA} ${
              o.stage === "SIN_DESCARGO"
                ? "bg-objetado-100 text-objetado-600"
                : "bg-validado-50 text-validado-700"
            }`}
          >
            {o.stage === "SIN_DESCARGO" ? "Sin descargos" : "Con descargo"}
          </span>
          {o.descargoDueAt && new Date(o.descargoDueAt).getTime() > Date.now() ? (
            <p className="mt-1 text-xs text-toga-500">
              Podrá decidir desde el {fecha(o.descargoDueAt)} (al vencer el descargo)
            </p>
          ) : (
            r && (
              <p className="mt-1 text-xs text-toga-500">
                Comprobación · <span className={CLASE_TONO[r.tono]}>{r.texto}</span>
              </p>
            )
          )}
          <EnTrabajo o={o} />
        </div>
      );
    }
    default:
      return <Decidida o={o} />;
  }
}

/** Quién la tiene abierta ahora, si es otra persona del comité. */
function EnTrabajo({ o }: { readonly o: ObjecionComite }) {
  if (!o.bloqueo || o.bloqueo.mio) return null;
  return (
    <p className="mt-1 text-xs font-medium text-balanza-700">
      La está trabajando {o.bloqueo.fullName}
    </p>
  );
}

function Decidida({ o }: { readonly o: ObjecionComite }) {
  const etiqueta =
    o.stage === "CON_LUGAR"
      ? "Con lugar · en el Consejo"
      : o.stage === "SIN_LUGAR"
        ? "Sin lugar"
        : "Inadmitida";
  return (
    <div>
      <span
        className={`${PASTILLA} ${
          o.stage === "CON_LUGAR" ? "bg-balanza-50 text-balanza-700" : "bg-toga-100 text-toga-700"
        }`}
      >
        {etiqueta}
      </span>
      {o.finalDecidedAt && (
        <p className="mt-1 text-xs text-toga-500">El {fecha(o.finalDecidedAt)}</p>
      )}
    </div>
  );
}

function EnlaceAbrir({ id }: { readonly id: string }) {
  return (
    <Link
      href={`/comite-objeciones/${id}`}
      className="text-sm font-semibold text-balanza-700 hover:text-balanza-600"
    >
      Abrir
    </Link>
  );
}
