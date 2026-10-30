import Link from "next/link";
import { FileText } from "lucide-react";
import type { MiObjecion, SituacionMiObjecion } from "@/contracts";
import {
  AUTO_ETIQUETA,
  CAUSA_DENUNCIA_ETIQUETA,
  CAUSAL_ETIQUETA,
  SALA_ETIQUETA,
  SITUACION_MI_OBJECION,
} from "@/contracts";
import { fechaCorta } from "@/lib/plazos";

const PASTILLA: Record<SituacionMiObjecion, string> = {
  EN_COMITE: "bg-toga-100 text-toga-700",
  ADMITIDA: "bg-balanza-50 text-balanza-700",
  INADMITIDA: "bg-toga-100 text-toga-700",
  CON_LUGAR: "bg-balanza-50 text-balanza-700",
  SIN_LUGAR: "bg-validado-50 text-validado-700",
};

const BOTON =
  "inline-flex items-center gap-1.5 rounded-md border border-toga-300 bg-white px-2.5 py-1 text-xs font-semibold text-toga-700 hover:bg-toga-50";

function Estado({ o }: { readonly o: MiObjecion }) {
  const cuando =
    o.situacion === "CON_LUGAR" || o.situacion === "SIN_LUGAR" ? o.finalDecidedAt : o.notifiedAt;
  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PASTILLA[o.situacion]}`}
      >
        {SITUACION_MI_OBJECION[o.situacion]}
      </span>
      <p className="mt-1 text-xs text-toga-500">
        {o.situacion === "EN_COMITE"
          ? "El comité la está examinando. Le avisaremos por correo cuando se pronuncie."
          : cuando
            ? `Notificada el ${fechaCorta(cuando)}`
            : null}
      </p>
    </div>
  );
}

/**
 * Objeciones del visualizador en sesión: situación, motivo de la inadmisión y
 * los autos que ya se le notificaron. Nada se ve antes de la notificación.
 */
export function ListaMisObjeciones({
  objeciones,
  conPostulante = true,
}: {
  readonly objeciones: readonly MiObjecion[];
  /** En la ficha de un postulante no hace falta repetir su nombre. */
  readonly conPostulante?: boolean;
}) {
  return (
    <ul className="space-y-3">
      {objeciones.map((o) => {
        const causales =
          o.causes.length > 0
            ? o.causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c).join(" · ")
            : (CAUSAL_ETIQUETA[o.category] ?? o.category);
        const codigo = encodeURIComponent(o.trackingCode);
        return (
          <li key={o.id} className="rounded-lg border border-toga-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                {conPostulante && (
                  <p className="font-medium text-toga-900">
                    <Link
                      href={`/ranking/${o.candidate.id}`}
                      className="hover:text-balanza-700 hover:underline"
                    >
                      {o.candidate.fullName}
                    </Link>
                    <span className="ml-2 text-sm font-normal text-toga-500">
                      {SALA_ETIQUETA[o.candidate.chamber] ?? o.candidate.chamber}
                    </span>
                  </p>
                )}
                <p className="mt-0.5 text-xs text-toga-500">
                  <span className="codigo text-toga-700">{o.trackingCode}</span> · presentada el{" "}
                  {fechaCorta(o.receivedAt)}
                </p>
                <p className="mt-1 text-sm text-toga-600">{causales}</p>
              </div>
              <Estado o={o} />
            </div>

            {o.motivoInadmision && (
              <div className="mt-3 rounded-md border border-toga-200 bg-toga-50 px-4 py-3 text-sm">
                <p className="font-semibold text-toga-900">Motivo de la inadmisión</p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed text-toga-700">
                  {o.motivoInadmision}
                </p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`/api/objeciones/mias/${codigo}/pdf`} className={BOTON}>
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Denuncia
              </a>
              {o.autos.map((a) => (
                <a
                  key={a.id}
                  href={`/api/objeciones/mias/${codigo}/autos/${a.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BOTON}
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  {AUTO_ETIQUETA[a.kind]}
                </a>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
