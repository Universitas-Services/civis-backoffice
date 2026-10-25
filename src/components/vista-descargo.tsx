import type { Descargo } from "@/contracts";

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Caracas",
  });

const VIA: Record<Descargo["submittedVia"], string> = {
  POSTULANTE: "Presentado por el postulante desde su cuenta",
  SECRETARIA: "Cargado por la secretaría tras contactar al postulante",
};

/**
 * Descargo del postulante ante una objeción, o el aviso de que no lo hay.
 * Lo usan el comité, el Consejo y la secretaría.
 */
export function VistaDescargo({
  objectionId,
  descargo,
  motivoSinDescargo,
}: {
  readonly objectionId: string;
  readonly descargo: Descargo | null;
  /** Motivo del comité cuando la envió al Consejo sin descargo. */
  readonly motivoSinDescargo?: string | null;
}) {
  if (!descargo) {
    return (
      <div className="rounded-lg border border-dashed border-toga-300 bg-toga-50 px-4 py-3 text-sm text-toga-600">
        <p className="font-semibold text-toga-800">Sin descargo del postulante.</p>
        {motivoSinDescargo && (
          <p className="mt-1">
            Motivo del comité para enviarla así:{" "}
            <span className="text-toga-800">{motivoSinDescargo}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <article className="rounded-lg border border-toga-200 bg-white p-4 sm:p-5">
      <p className="text-xs text-toga-500">
        {VIA[descargo.submittedVia]} · {fechaHora(descargo.createdAt)}
      </p>
      <h3 className="mt-1.5 text-base font-semibold text-toga-900">{descargo.title}</h3>
      <p className="prosa mt-2 whitespace-pre-wrap text-base leading-relaxed text-toga-700">
        {descargo.description}
      </p>
      {descargo.originalName && (
        <a
          href={`/api/descargos/${objectionId}`}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-semibold text-toga-700 hover:bg-toga-50"
        >
          Ver documento adjunto
          <span className="text-xs font-normal text-toga-500">
            {descargo.originalName}
            {descargo.sizeBytes
              ? ` · ${Math.max(1, Math.round(descargo.sizeBytes / 1024))} KB`
              : ""}
          </span>
        </a>
      )}
    </article>
  );
}
