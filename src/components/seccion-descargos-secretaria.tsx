import type { ObjecionParaDescargo } from "@/contracts";
import { CAUSA_DENUNCIA_ETIQUETA, ETAPA_OBJECION_ETIQUETA, admiteDescargo } from "@/contracts";
import { CLASE_TONO, fechaHora, fechaLarga as fecha, restante } from "@/lib/plazos";
import { VistaDescargo } from "@/components/vista-descargo";
import { FormularioDescargo } from "@/components/formulario-descargo";
import { ListaAutos } from "@/components/lista-autos";

/**
 * Objeciones admitidas de un postulante sin cuenta, para que la secretaría
 * cargue su descargo dentro del plazo. Nunca muestra quién la presentó.
 */
export function SeccionDescargosSecretaria({
  objeciones,
  contacto,
}: {
  readonly objeciones: readonly ObjecionParaDescargo[];
  readonly contacto: React.ReactNode;
}) {
  if (objeciones.length === 0) return null;
  const pendientes = objeciones.filter((o) => admiteDescargo(o)).length;

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
              {pendientes}{" "}
              {pendientes === 1 ? "objeción admitida espera" : "objeciones admitidas esperan"} el
              descargo del postulante.
            </span>{" "}
            Contáctelo, entréguele el auto de admisión y la denuncia, y cargue aquí su respuesta
            antes de que venza el plazo.
          </>
        ) : (
          "Ninguna objeción espera descargo."
        )}
      </p>
      {pendientes > 0 && <p className="mt-2 text-sm text-toga-700">{contacto}</p>}

      <ol className="mt-4 space-y-4">
        {objeciones.map((o) => {
          const causales = o.causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c);
          if (o.otherCause) causales.push(o.otherCause);
          const abierto = admiteDescargo(o);
          const plazo = o.descargoDueAt ? restante(o.descargoDueAt) : null;
          return (
            <li key={o.id} className="rounded-lg border border-toga-200 p-4">
              <p className="text-xs text-toga-500">
                <span className="codigo">{o.trackingCode}</span> · recibida el {fecha(o.receivedAt)}{" "}
                · {ETAPA_OBJECION_ETIQUETA[o.stage]}
              </p>
              {abierto && plazo && o.descargoDueAt && (
                <p className="mt-1 text-sm">
                  Plazo de descargo: hasta el {fechaHora(o.descargoDueAt)} ·{" "}
                  <span className={CLASE_TONO[plazo.tono]}>{plazo.texto}</span>
                </p>
              )}
              {causales.length > 0 && (
                <p className="mt-1.5 text-sm font-medium text-toga-800">{causales.join(" · ")}</p>
              )}
              <p className="prosa mt-2 whitespace-pre-wrap text-base leading-relaxed text-toga-700">
                {o.description}
              </p>
              {o.autos.length > 0 && (
                <div className="mt-3">
                  <ListaAutos objectionId={o.id} autos={o.autos} />
                </div>
              )}
              <div className="mt-4 border-t border-toga-100 pt-4">
                {abierto ? (
                  <FormularioDescargo objectionId={o.id} trackingCode={o.trackingCode} />
                ) : (
                  <VistaDescargo
                    objectionId={o.id}
                    descargo={o.descargo}
                    motivoSinDescargo={
                      o.descargo ? null : "Venció el plazo sin que se presentara descargo."
                    }
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
