import Link from "next/link";
import type { EntradaRanking } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";

const BANDAS: Record<string, { texto: string; clases: string }> = {
  HIGH: { texto: "Altamente idóneo", clases: "bg-validado-50 text-validado-700" },
  MEDIUM: { texto: "Idóneo medio", clases: "bg-balanza-50 text-balanza-700" },
  LOW: { texto: "Insuficiente", clases: "bg-objetado-100 text-objetado-600" },
  INELIGIBLE: { texto: "Inhabilitado", clases: "bg-balanza-600 text-white" },
};

export function PastillaBanda({ band }: { readonly band: string }) {
  const b = BANDAS[band] ?? BANDAS.LOW!;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${b.clases}`}
    >
      {b.texto}
    </span>
  );
}

export function salaDe(chamber: string) {
  return SALA_ETIQUETA[chamber] ?? chamber;
}

function Opiniones({ n }: { readonly n: number | undefined }) {
  if (n === undefined) return <span className="text-toga-400">—</span>;
  return (
    <span className="cifra whitespace-nowrap">
      {n} {n === 1 ? "opinión" : "opiniones"}
    </span>
  );
}

/**
 * Acciones de una fila. Todos los que entran al ranking leen las opiniones;
 * el visualizador además opina u objeta. Las dos cosas se hacen en la ficha
 * del postulante (`/ranking/[candidateId]`), no aquí.
 */
function AccionesFila({
  e,
  esVisualizador,
  puedeObjetar,
}: {
  readonly e: EntradaRanking;
  readonly esVisualizador: boolean;
  readonly puedeObjetar: boolean;
}) {
  if (!e.candidateId) return null;
  const base = `/ranking/${e.candidateId}`;
  const enlace = "text-sm font-semibold text-balanza-700 hover:text-balanza-600";
  if (!esVisualizador) {
    return (
      <Link href={base} className={enlace}>
        Ver opiniones
      </Link>
    );
  }
  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap">
      <Link href={`${base}#opinar`} className={enlace}>
        Opinar
      </Link>
      {puedeObjetar && (
        <Link
          href={`${base}#objetar`}
          className="rounded-md border border-balanza-600 bg-white px-3 py-1.5 text-sm font-semibold text-balanza-700 hover:bg-balanza-50"
        >
          Objetar
        </Link>
      )}
    </span>
  );
}

/**
 * Ranking interno: una sola lista. La publicación va aparte
 * (`PublicacionRanking`). «Objetar» solo aparece si el interruptor de
 * objeciones de visualizadores está activo.
 */
export function RankingInterno({
  entries,
  esVisualizador,
  puedeObjetar,
}: {
  readonly entries: readonly EntradaRanking[];
  readonly esVisualizador: boolean;
  readonly puedeObjetar: boolean;
}) {
  return (
    <>
      <ul className="space-y-3 xl:hidden">
        {entries.map((e) => (
          <li key={e.publicId} className="rounded-lg border border-toga-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="cifra text-sm font-semibold text-toga-900">
                {e.position ?? "—"}
                {e.tied && <span className="ml-2 text-xs text-balanza-700">empate</span>}
              </span>
              <span className="cifra text-lg font-semibold text-toga-900">{e.total}</span>
            </div>
            <p className="mt-1.5 font-medium text-toga-900">{e.fullName}</p>
            <p className="mt-0.5 text-sm text-toga-600">{salaDe(e.chamber)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-toga-600">
              <PastillaBanda band={e.band} />
              <Opiniones n={e.opinionCount} />
            </div>
            <div className="mt-3">
              <AccionesFila e={e} esVisualizador={esVisualizador} puedeObjetar={puedeObjetar} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-lg border border-toga-200 bg-white xl:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Ranking interno de postulantes evaluados</caption>
          <thead className="border-b-2 border-toga-300 bg-toga-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Pos.
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Postulante
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Sala
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-toga-700">
                Puntaje
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Estatus
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                Opiniones
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {entries.map((e) => (
              <tr key={e.publicId} className="hover:bg-toga-50">
                <th scope="row" className="cifra px-4 py-3 text-left font-semibold text-toga-900">
                  {e.position ?? <span className="font-normal text-toga-400">—</span>}
                  {e.tied && (
                    <span className="ml-1.5 text-xs font-medium text-balanza-700">empate</span>
                  )}
                </th>
                <td className="px-4 py-3 font-medium text-toga-900">{e.fullName}</td>
                <td className="px-4 py-3 text-toga-600">{salaDe(e.chamber)}</td>
                <td className="cifra px-4 py-3 text-right font-semibold text-toga-900">
                  {e.total}
                </td>
                <td className="px-4 py-3">
                  <PastillaBanda band={e.band} />
                </td>
                <td className="px-4 py-3 text-toga-600">
                  <Opiniones n={e.opinionCount} />
                </td>
                <td className="px-4 py-3 text-right">
                  <AccionesFila e={e} esVisualizador={esVisualizador} puedeObjetar={puedeObjetar} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
