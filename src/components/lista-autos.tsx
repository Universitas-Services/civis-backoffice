import { AUTO_ETIQUETA, type AutoObjecion } from "@/contracts";
import { fechaLarga } from "@/lib/plazos";

/** Autos del comité con enlace al PDF (se abre en otra pestaña). */
export function ListaAutos({
  objectionId,
  autos,
}: {
  readonly objectionId: string;
  readonly autos: readonly AutoObjecion[];
}) {
  if (autos.length === 0) return null;
  return (
    <ul className="space-y-2">
      {autos.map((a) => (
        <li key={a.id}>
          <a
            href={`/api/autos/${objectionId}/${a.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-3 rounded-md border border-toga-200 bg-white px-3 py-2 text-sm hover:border-toga-300"
          >
            <span>
              <span className="font-medium text-toga-900 group-hover:text-balanza-700">
                {AUTO_ETIQUETA[a.kind]}
              </span>
              <span className="mt-0.5 block text-xs text-toga-500">
                <span className="codigo">{a.number}</span> · {fechaLarga(a.createdAt)}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-balanza-700">PDF</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
