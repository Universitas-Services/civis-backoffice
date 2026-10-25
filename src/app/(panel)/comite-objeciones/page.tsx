import type { Metadata } from "next";
import Link from "next/link";
import type { BandejaComite, EtapaComite, ObjecionComite } from "@/contracts";
import { CAUSA_DENUNCIA_ETIQUETA, CAUSAL_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { Paginacion } from "@/components/paginacion";

export const metadata: Metadata = { title: "Comité de objeciones" };

const PAGE_SIZE = 10;

/** Pestañas: valor en la URL, etapa de la API y etiqueta. */
const FILTROS = [
  { valor: undefined, etapa: "ESPERANDO_DESCARGO", etiqueta: "Esperando descargo" },
  { valor: "con_descargo", etapa: "CON_DESCARGO", etiqueta: "Con descargo" },
  { valor: "enviadas", etapa: "ENVIADAS", etiqueta: "Enviadas al Consejo" },
] as const satisfies readonly {
  valor: string | undefined;
  etapa: EtapaComite;
  etiqueta: string;
}[];

const VACIO: Record<EtapaComite, string> = {
  ESPERANDO_DESCARGO: "Ninguna objeción espera el descargo del postulante.",
  CON_DESCARGO: "No hay objeciones con descargo pendientes de enviar al Consejo.",
  ENVIADAS: "Todavía no se ha enviado ninguna objeción al Consejo.",
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    timeZone: "America/Caracas",
  });

function diasDesde(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

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
        descripcion="Toda objeción llega primero aquí. Espere el descargo del postulante y envíela al Consejo; sin descargo también puede enviarla, indicando el motivo."
      />

      <div className="px-5 py-6 sm:px-8">
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

/** Quién debe responder y desde cuándo, o cuándo se envió. */
function Situacion({ o }: { readonly o: ObjecionComite }) {
  if (o.etapa === "ENVIADAS") {
    return (
      <div>
        <span className="inline-flex rounded-full bg-validado-50 px-2.5 py-0.5 text-xs font-semibold text-validado-700">
          {o.descargo ? "Enviada con descargo" : "Enviada sin descargo"}
        </span>
        {o.forwardedAt && <p className="mt-1 text-xs text-toga-500">El {fecha(o.forwardedAt)}</p>}
      </div>
    );
  }
  if (o.etapa === "CON_DESCARGO") {
    return (
      <div>
        <span className="inline-flex rounded-full bg-balanza-50 px-2.5 py-0.5 text-xs font-semibold text-balanza-700">
          Descargo recibido
        </span>
        {o.descargo && (
          <p className="mt-1 text-xs text-toga-500">
            El {fecha(o.descargo.createdAt)} · listo para enviar al Consejo
          </p>
        )}
      </div>
    );
  }
  const dias = diasDesde(o.receivedAt);
  return (
    <div>
      <span className="inline-flex rounded-full bg-toga-100 px-2.5 py-0.5 text-xs font-semibold text-toga-700">
        Esperando descargo
      </span>
      <p className="mt-1 text-xs text-toga-500">
        {o.candidate.conCuenta ? "Lo presenta el postulante" : "Lo carga la secretaría"} ·{" "}
        <span className="cifra">{dias}</span> {dias === 1 ? "día" : "días"}
      </p>
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
