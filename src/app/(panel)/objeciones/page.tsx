import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ObjecionBandeja } from "@/contracts";
import { CAUSAL_ETIQUETA, SALA_ETIQUETA } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { InsigniaObjecion } from "@/components/insignias";
import { FichaObjecion } from "@/components/ficha-objecion";

export const metadata: Metadata = { title: "Objeciones" };

interface Respuesta {
  readonly items: readonly ObjecionBandeja[];
  readonly total: number;
  readonly resumen: Record<string, number>;
}

export default async function Objeciones({
  searchParams,
}: {
  readonly searchParams: Promise<{ abiertas?: string; candidato?: string }>;
}) {
  const usuario = await exigirRol("SUPER_ADMIN", "EVALUATOR");
  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.abiertas !== "false") query.set("soloAbiertas", "true");

  let datos: Respuesta;
  try {
    datos = await llamarApi<Respuesta>(`/internal/objections?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) redirect("/login");
    throw error;
  }

  const items = params.candidato
    ? datos.items.filter((o) => o.candidate.id === params.candidato)
    : datos.items;

  const soloAbiertas = params.abiertas !== "false";

  return (
    <>
      <CabeceraPagina
        titulo="Objeciones ciudadanas"
        descripcion="Esta bandeja no muestra los datos de quien objetó. Para verlos hay que abrir la objeción, y esa apertura queda registrada en la bitácora."
      />

      <div className="px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={soloAbiertas ? "/objeciones?abiertas=false" : "/objeciones"}
            className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-100"
          >
            {soloAbiertas ? "Ver también las resueltas" : "Ver sólo las abiertas"}
          </Link>
          {params.candidato && (
            <Link href="/objeciones" className="text-sm font-medium text-balanza-700 underline">
              Quitar filtro por postulante
            </Link>
          )}
          <span className="ml-auto flex flex-wrap gap-2">
            {Object.entries(datos.resumen).map(([estado, n]) => (
              <span key={estado} className="flex items-center gap-1.5">
                <InsigniaObjecion estado={estado as never} />
                <span className="cifra text-xs font-semibold text-toga-600">{n}</span>
              </span>
            ))}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="mt-6">
            <EstadoVacio
              titulo="No hay objeciones que mostrar"
              detalle="Las objeciones ciudadanas llegan desde el sitio público y aparecen aquí para su tramitación."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {items.map((o) => (
              <li key={o.id}>
                <FichaObjecion
                  objecion={o}
                  causa={CAUSAL_ETIQUETA[o.category] ?? o.category}
                  sala={SALA_ETIQUETA[o.candidate.chamber]}
                  usuarioId={usuario.id}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
