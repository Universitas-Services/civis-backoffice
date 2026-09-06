import type { Metadata } from "next";
import type { ResultadoRanking } from "@/contracts";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { AccionesRanking } from "@/components/acciones-ranking";
import { llamarApi, NoAutorizado } from "@/lib/api";

export const metadata: Metadata = { title: "Ranking interno" };

const BANDAS: Record<string, { texto: string; clases: string; simbolo: string }> = {
  HIGH: { texto: "Altamente idóneo", clases: "bg-validado-50 text-validado-700", simbolo: "●" },
  MEDIUM: { texto: "Idóneo medio", clases: "bg-balanza-50 text-balanza-700", simbolo: "◐" },
  LOW: { texto: "Insuficiente", clases: "bg-objetado-100 text-objetado-600", simbolo: "○" },
  INELIGIBLE: { texto: "Inhabilitado", clases: "bg-toga-800 text-toga-100", simbolo: "✕" },
};

export default async function RankingInterno() {
  const usuario = await exigirRol("SUPER_ADMIN", "EVALUATOR", "PUBLISHER");
  let ranking: ResultadoRanking;
  try {
    ranking = await llamarApi<ResultadoRanking>("/internal/ranking");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/ranking");
    throw error;
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-toga-900">Ranking interno</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-toga-600">
        Calculado en el servidor a partir de evaluaciones <strong>aprobadas</strong>. Esta vista
        incluye a todos los postulantes evaluados, estén publicados o no — no es lo que ve la
        ciudadanía.
      </p>

      <p className="mt-4 text-sm text-toga-500">
        {ranking.eligibleCount} en competencia · {ranking.ineligibleCount} inhabilitados · baremo{" "}
        <strong className="text-toga-700">{ranking.rubricVersion ?? "—"}</strong>
      </p>

      <div className="mt-6">
        <AccionesRanking
          puedePublicar={usuario.roles.some((r) => r === "SUPER_ADMIN" || r === "PUBLISHER")}
        />
      </div>

      {/* Móvil: tarjetas. Escritorio: tabla. Sin desplazamiento horizontal. */}
      <ul className="mt-6 space-y-3 lg:hidden">
        {ranking.entries.map((e) => {
          const b = BANDAS[e.band] ?? BANDAS.LOW!;
          return (
            <li key={e.publicId} className="rounded-lg border border-toga-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="cifra text-sm font-semibold text-toga-900">
                  {e.position ?? "—"}
                  {e.tied && <span className="ml-2 text-xs text-balanza-700">empate</span>}
                </span>
                <span className="cifra text-lg font-semibold text-toga-900">{e.total}</span>
              </div>
              <p className="mt-1.5 font-medium text-toga-900">{e.fullName}</p>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs ${b.clases}`}>
                <span aria-hidden="true" className="mr-1.5">
                  {b.simbolo}
                </span>
                {b.texto}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {ranking.entries.map((e) => {
              const b = BANDAS[e.band] ?? BANDAS.LOW!;
              return (
                <tr key={e.publicId} className="hover:bg-toga-50">
                  <th scope="row" className="cifra px-4 py-3 text-left font-semibold text-toga-900">
                    {e.position ?? <span className="font-normal text-toga-400">—</span>}
                    {e.tied && (
                      <span className="ml-1.5 text-xs font-medium text-balanza-700">empate</span>
                    )}
                  </th>
                  <td className="px-4 py-3 font-medium text-toga-900">{e.fullName}</td>
                  <td className="px-4 py-3 text-toga-600">
                    {e.chamber.toLowerCase().replace(/_/g, " ")}
                  </td>
                  <td className="cifra px-4 py-3 text-right font-semibold text-toga-900">
                    {e.total} <span className="text-xs font-normal text-toga-500">/ 100</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${b.clases}`}>
                      <span aria-hidden="true" className="mr-1.5">
                        {b.simbolo}
                      </span>
                      {b.texto}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
