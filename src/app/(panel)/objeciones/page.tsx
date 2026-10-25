import type { Metadata } from "next";
import Link from "next/link";
import type { PostulanteObjetado, SituacionObjecion } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { Paginacion } from "@/components/paginacion";

export const metadata: Metadata = { title: "Gestión de impugnaciones y objeciones" };

const PAGE_SIZE = 10;

interface Respuesta {
  readonly items: readonly PostulanteObjetado[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly resumen: Record<SituacionObjecion | "TODAS", number>;
}

/** Pestañas de filtro: valor en la URL, situación que cuenta y etiqueta. */
const FILTROS = [
  { valor: undefined, clave: "TODAS", etiqueta: "Todas" },
  { valor: "pendientes", clave: "PENDIENTE", etiqueta: "Pendientes de re-evaluar" },
  { valor: "en_ronda", clave: "EN_RONDA", etiqueta: "En ronda" },
  { valor: "reevaluados", clave: "REEVALUADO", etiqueta: "Re-evaluados" },
  { valor: "inelegibles", clave: "INELEGIBLE", etiqueta: "Inelegibles" },
  { valor: "escaladas", clave: "ESCALADA", etiqueta: "Escaladas" },
] as const;

const VACIO: Record<string, string> = {
  pendientes:
    "Ningún postulante espera re-evaluación: todas las objeciones ya pasaron por una ronda.",
  en_ronda: "No hay rondas de objeción abiertas.",
  reevaluados: "Todavía no se ha re-evaluado a ningún postulante objetado.",
  inelegibles: "Ninguna ronda de objeción ha terminado en inelegibilidad.",
  escaladas: "No hay rondas escaladas esperando al administrador.",
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    timeZone: "America/Caracas",
  });
const puntos = (n: number) => n.toLocaleString("es-VE", { maximumFractionDigits: 2 });

export default async function Objeciones({
  searchParams,
}: {
  readonly searchParams: Promise<{ situacion?: string; page?: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");
  // ADMIN abre la ronda de objeción; EVALUATOR/SUPER_ADMIN puntúan o votan inelegible.
  const puedeAjustar = usuario.roles.some(
    (r) => r === "SUPER_ADMIN" || r === "ADMIN" || r === "EVALUATOR",
  );

  const params = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === params.situacion) ?? FILTROS[0];
  const page = Math.max(1, Number(params.page) || 1);
  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (filtro.valor) query.set("situacion", filtro.valor);

  let datos: Respuesta;
  try {
    datos = await llamarApi<Respuesta>(`/internal/objections/por-postulante?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/objeciones");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Gestión de impugnaciones y objeciones"
        descripcion="Postulantes con objeciones que el comité envió al Consejo, y si el Consejo ya los re-evaluó. Primero aparecen los que esperan una ronda de objeción."
      />

      <div className="px-5 py-6 sm:px-8">
        {datos.resumen.TODAS === 0 ? (
          <EstadoVacio
            titulo="No hay objeciones que mostrar"
            detalle="Las objeciones llegan aquí cuando el comité las envía al Consejo, con el descargo del postulante. Aparecen agrupadas por postulante."
          />
        ) : (
          <>
            <nav aria-label="Filtrar por re-evaluación" className="-mx-1 flex flex-wrap gap-1.5">
              {FILTROS.map((f) => {
                const activo = f.valor === filtro.valor;
                return (
                  <Link
                    key={f.clave}
                    href={f.valor ? `/objeciones?situacion=${f.valor}` : "/objeciones"}
                    aria-current={activo ? "page" : undefined}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                      activo
                        ? "border-balanza-600 bg-balanza-50 text-balanza-700"
                        : "border-toga-200 bg-white text-toga-600 hover:border-toga-300 hover:text-toga-900"
                    }`}
                  >
                    {f.etiqueta}
                    <span className="cifra ml-1.5 text-xs text-toga-400">
                      ({datos.resumen[f.clave] ?? 0})
                    </span>
                  </Link>
                );
              })}
            </nav>

            {datos.items.length === 0 ? (
              <div className="mt-4">
                <EstadoVacio
                  titulo="Nada en este filtro"
                  detalle={VACIO[filtro.valor ?? ""] ?? "No hay postulantes en esta página."}
                />
              </div>
            ) : (
              <>
                {/* Escritorio */}
                <div className="mt-4 hidden overflow-hidden rounded-lg border border-toga-200 bg-white xl:block">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Postulantes con objeciones</caption>
                    <thead className="border-b-2 border-toga-300 bg-toga-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                          Postulante
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                          Sala
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right font-semibold text-toga-700"
                        >
                          Objeciones
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                          Re-evaluación
                        </th>
                        {puedeAjustar && (
                          <th scope="col" className="px-4 py-3">
                            <span className="sr-only">Ajustar</span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-toga-100">
                      {datos.items.map((p) => (
                        <tr key={p.candidateId} className="hover:bg-toga-50">
                          <th scope="row" className="px-4 py-3 text-left font-medium text-toga-900">
                            {p.fullName}
                          </th>
                          <td className="whitespace-nowrap px-4 py-3 text-toga-600">
                            {SALA_ETIQUETA[p.chamber as keyof typeof SALA_ETIQUETA] ?? p.chamber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <Conteo p={p} />
                          </td>
                          <td className="px-4 py-3">
                            <Situacion p={p} />
                          </td>
                          {puedeAjustar && (
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                              <EnlaceAjustar id={p.candidateId} />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tableta y teléfono */}
                <ul className="mt-4 space-y-3 xl:hidden">
                  {datos.items.map((p) => (
                    <li
                      key={p.candidateId}
                      className="rounded-lg border border-toga-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-toga-900">{p.fullName}</p>
                          <p className="mt-0.5 text-xs text-toga-500">
                            {SALA_ETIQUETA[p.chamber as keyof typeof SALA_ETIQUETA] ?? p.chamber}
                          </p>
                        </div>
                        <Conteo p={p} />
                      </div>
                      <div className="mt-3">
                        <Situacion p={p} />
                      </div>
                      {puedeAjustar && (
                        <div className="mt-3 border-t border-toga-100 pt-3">
                          <EnlaceAjustar id={p.candidateId} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <Paginacion
              ruta="/objeciones"
              page={datos.page}
              pageSize={datos.pageSize || PAGE_SIZE}
              total={datos.total}
              params={{ situacion: filtro.valor }}
            />
          </>
        )}
      </div>
    </>
  );
}

function Conteo({ p }: { readonly p: PostulanteObjetado }) {
  return (
    <span className="text-sm text-toga-600">
      <span className="cifra font-semibold text-toga-900">{p.total}</span>
      {p.nuevas > 0 && p.ronda && (
        <span className="ml-1.5 rounded bg-balanza-50 px-1.5 py-0.5 text-xs font-medium text-balanza-700">
          {p.nuevas} {p.nuevas === 1 ? "nueva" : "nuevas"}
        </span>
      )}
    </span>
  );
}

/** Insignia de la situación y, debajo, el detalle: fecha, nota o participación. */
function Situacion({ p }: { readonly p: PostulanteObjetado }) {
  const { ronda, nota } = p;
  let insignia: { texto: string; clase: string };
  let detalle: string | null = null;

  switch (p.situacion) {
    case "PENDIENTE":
      insignia = { texto: "Pendiente de re-evaluar", clase: "bg-balanza-50 text-balanza-700" };
      detalle = ronda?.closedAt
        ? `Llegaron objeciones después de la ronda del ${fecha(ronda.closedAt)}`
        : `Sin ronda de objeción · primera objeción el ${fecha(p.primeraAt)}`;
      break;
    case "EN_RONDA":
      insignia = { texto: "Ronda abierta", clase: "bg-oro-viejo/15 text-toga-800" };
      detalle = ronda
        ? `Abierta el ${fecha(ronda.openedAt)} · ${ronda.actuaron} de ${ronda.participantes} actuaron`
        : null;
      break;
    case "REEVALUADO":
      insignia = { texto: "Re-evaluado", clase: "bg-validado-50 text-validado-700" };
      detalle = [
        ronda?.closedAt ? `El ${fecha(ronda.closedAt)}` : null,
        nota.actual !== null
          ? nota.anterior !== null
            ? `${puntos(nota.anterior)} → ${puntos(nota.actual)} pts`
            : `nota ${puntos(nota.actual)} pts`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      break;
    case "INELEGIBLE":
      insignia = { texto: "Inelegible por objeción", clase: "bg-objetado-100 text-objetado-600" };
      detalle = ronda?.closedAt ? `Ronda cerrada el ${fecha(ronda.closedAt)}` : null;
      break;
    case "ESCALADA":
      insignia = { texto: "Escalada", clase: "bg-toga-100 text-toga-700" };
      detalle = ronda?.motivo ?? "La ronda no llegó a una decisión";
      break;
  }

  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${insignia.clase}`}
      >
        {insignia.texto}
      </span>
      {detalle && <p className="mt-1 text-xs text-toga-500">{detalle}</p>}
    </div>
  );
}

function EnlaceAjustar({ id }: { readonly id: string }) {
  return (
    <Link
      href={`/objeciones/baremo/${id}`}
      className="text-sm font-semibold text-balanza-700 hover:text-balanza-600"
    >
      Ajustar baremo
    </Link>
  );
}
