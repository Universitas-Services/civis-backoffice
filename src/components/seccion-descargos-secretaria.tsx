import type { ObjecionParaDescargo } from "@/contracts";
import { CAUSA_DENUNCIA_ETIQUETA } from "@/contracts";
import { VistaDescargo } from "@/components/vista-descargo";
import { FormularioDescargo } from "@/components/formulario-descargo";

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Caracas",
  });

/**
 * Objeciones de un postulante sin cuenta, para que la secretaría cargue su
 * descargo. Nunca muestra quién presentó la objeción.
 */
export function SeccionDescargosSecretaria({
  objeciones,
  contacto,
}: {
  readonly objeciones: readonly ObjecionParaDescargo[];
  readonly contacto: React.ReactNode;
}) {
  if (objeciones.length === 0) return null;
  const pendientes = objeciones.filter((o) => !o.descargo && !o.forwardedAt).length;

  return (
    <section
      aria-labelledby="objeciones-descargo"
      className="rounded-lg border border-toga-200 bg-white p-4 sm:p-5"
    >
      <h2 id="objeciones-descargo" className="text-base font-semibold text-toga-900">
        Objeciones y descargos
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-toga-600">
        {pendientes > 0 ? (
          <>
            <span className="font-semibold text-toga-900">
              {pendientes} {pendientes === 1 ? "objeción espera" : "objeciones esperan"} el descargo
              del postulante.
            </span>{" "}
            Contáctelo, léale la objeción y cargue aquí su respuesta. El comité la enviará al
            Consejo.
          </>
        ) : (
          "Todas las objeciones tienen descargo o ya se enviaron al Consejo."
        )}
      </p>
      {pendientes > 0 && <p className="mt-2 text-sm text-toga-700">{contacto}</p>}

      <ol className="mt-4 space-y-4">
        {objeciones.map((o) => {
          const causales = o.causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c);
          if (o.otherCause) causales.push(o.otherCause);
          return (
            <li key={o.id} className="rounded-lg border border-toga-200 p-4">
              <p className="text-xs text-toga-500">
                <span className="codigo">{o.trackingCode}</span> · recibida el {fecha(o.receivedAt)}
                {o.forwardedAt && " · enviada al Consejo"}
              </p>
              {causales.length > 0 && (
                <p className="mt-1.5 text-sm font-medium text-toga-800">{causales.join(" · ")}</p>
              )}
              <p className="prosa mt-2 whitespace-pre-wrap text-base leading-relaxed text-toga-700">
                {o.description}
              </p>
              <div className="mt-4 border-t border-toga-100 pt-4">
                {o.descargo || o.forwardedAt ? (
                  <VistaDescargo objectionId={o.id} descargo={o.descargo} />
                ) : (
                  <FormularioDescargo objectionId={o.id} trackingCode={o.trackingCode} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
