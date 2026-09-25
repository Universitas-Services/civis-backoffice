"use client";

import { useMemo, useState, useTransition, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ExpedienteDetalle } from "@/contracts";
import { SALA_ETIQUETA, puntosBaremo } from "@/contracts";
import { guardarLineasBaremo } from "@/app/(panel)/evaluacion/[candidateId]/acciones";
import { InsigniaEstado } from "@/components/insignias";
import { useToast } from "@/components/toast-provider";
import { VistaDocumentosFormulario } from "@/components/vista-documentos-formulario";
import { documentosVigentes } from "@/lib/documentos-vigentes";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";

/** Puntaje del rango y el resultado que anotó el evaluador. */
type LineaRango = { puntaje: string; resultado: string };

/** criterioId -> rangoId -> línea. Varios rangos por criterio. */
type Seleccion = Record<string, Record<string, LineaRango>>;

type LineaEnvio = {
  readonly criterioId: string;
  readonly rangoId: string;
  readonly points: number;
  readonly resultado: string | null;
};

export type LineaBaremoGuardada = {
  readonly criterioId: string;
  readonly rangoId: string;
  readonly points: string | number;
  readonly resultado: string | null;
};

export type BaremoCongeladoVista = {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly totalPoints: number;
  readonly criterios: readonly {
    readonly id: string;
    readonly name: string;
    readonly description?: string | null;
    readonly points: number;
    readonly order: number;
    readonly rangos: readonly {
      readonly id: string;
      readonly title: string;
      readonly description?: string | null;
      readonly minPoints: number;
      readonly maxPoints: number;
      readonly order: number;
    }[];
  }[];
};

export type EvaluacionBaremoVista = {
  readonly id: string;
  readonly status: string;
  readonly evaluatorId: string;
  readonly totalPoints: string | number;
  readonly band: string;
  readonly ineligible?: boolean;
  readonly baremoCongelado: BaremoCongeladoVista | null;
  readonly lineasBaremo: readonly LineaBaremoGuardada[];
};

const BANDA: Record<string, string> = {
  HIGH: "Altamente idóneo",
  MEDIUM: "Idóneo medio",
  LOW: "Insuficiente",
};

/**
 * Aplicación del baremo congelado al abrir el borrador.
 * Varios rangos por criterio, con resultado. El total lo devuelve el servidor.
 */
export function PantallaAplicarBaremo({
  expediente,
  evaluacion,
  puedeEditar,
  accionExtra,
  accionCabecera,
}: {
  readonly expediente: ExpedienteDetalle;
  readonly evaluacion: EvaluacionBaremoVista;
  readonly puedeEditar: boolean;
  readonly accionExtra?: ReactNode;
  readonly accionCabecera?: ReactNode;
}) {
  const documentos = useMemo(
    () => documentosVigentes(expediente.submissions[0]?.documents ?? []),
    [expediente.submissions],
  );
  const fileNumber = expediente.submissions[0]?.fileNumber ?? "—";
  const sala = SALA_ETIQUETA[expediente.chamber] ?? String(expediente.chamber);
  const baremo = evaluacion.baremoCongelado;

  useEffect(() => {
    marcarSidebarDocumentoAbierto(true);
    return () => marcarSidebarDocumentoAbierto(false);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6">
        <Link
          href="/baremo"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-balanza-700 hover:text-balanza-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a postulados
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="codigo text-xs text-toga-500">{fileNumber}</p>
            <h1 className="mt-0.5 text-lg font-semibold text-toga-900">
              {expediente.firstName} {expediente.lastName}
            </h1>
            <p className="mt-1 text-sm text-toga-500">{sala}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {accionCabecera}
            <InsigniaEstado estado={expediente.workflowStatus} />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.9fr)]">
        <div className="xl:sticky xl:top-4 xl:z-10 xl:max-h-[calc(100dvh-1.5rem)] xl:self-start xl:overflow-y-auto">
          <VistaDocumentosFormulario documentos={documentos} anclarVisor={false} ampliar />
        </div>
        <aside aria-label="Baremo de esta evaluación" className="space-y-4">
          {baremo ? (
            <>
              <FormularioBaremo
                baremo={baremo}
                evaluacion={evaluacion}
                candidateId={expediente.id}
                puedeEditar={puedeEditar}
              />
              {accionExtra}
            </>
          ) : (
            <p className="rounded-lg border border-toga-200 bg-white px-4 py-3 text-sm text-toga-600">
              Esta evaluación no tiene una copia del baremo. No se puede puntuar.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function FormularioBaremo({
  baremo,
  evaluacion,
  candidateId,
  puedeEditar,
}: {
  readonly baremo: BaremoCongeladoVista;
  readonly evaluacion: EvaluacionBaremoVista;
  readonly candidateId: string;
  readonly puedeEditar: boolean;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const criterios = useMemo(
    () => [...baremo.criterios].sort((a, b) => a.order - b.order),
    [baremo.criterios],
  );
  const inicial = useMemo(
    () => seleccionDesdeLineas(evaluacion.lineasBaremo),
    [evaluacion.lineasBaremo],
  );
  const [seleccion, setSeleccion] = useState<Seleccion>(inicial);
  const [firmaGuardada, setFirmaGuardada] = useState(() => firma(lineasDe(inicial)));
  const [totalServidor, setTotalServidor] = useState(puntosBaremo(evaluacion.totalPoints));
  const [band, setBand] = useState(evaluacion.band);
  const [estado, setEstado] = useState(evaluacion.status);

  const editable =
    puedeEditar && (estado === "DRAFT" || estado === "SUBMITTED" || estado === "APPROVED");
  const hayCambios = firma(lineasDe(seleccion)) !== firmaGuardada;

  const hayError = criterios.some((criterio) => {
    const marcas = seleccion[criterio.id] ?? {};
    const elegidos = criterio.rangos.filter((r) => marcas[r.id] !== undefined);
    if (
      elegidos.some((r) => !puntajeValido(marcas[r.id]?.puntaje ?? "", r.minPoints, r.maxPoints))
    ) {
      return true;
    }
    return sumaCriterio(marcas, elegidos) > puntosBaremo(criterio.points);
  });

  const lineas = lineasDe(seleccion);

  function alternar(criterioId: string, rangoId: string) {
    if (!editable) return;
    setSeleccion((prev) => {
      const actual = { ...(prev[criterioId] ?? {}) };
      if (actual[rangoId] !== undefined) delete actual[rangoId];
      else actual[rangoId] = { puntaje: "", resultado: "" };
      return { ...prev, [criterioId]: actual };
    });
  }

  function escribir(criterioId: string, rangoId: string, campo: keyof LineaRango, texto: string) {
    if (!editable) return;
    setSeleccion((prev) => {
      const previa = prev[criterioId]?.[rangoId] ?? { puntaje: "", resultado: "" };
      return {
        ...prev,
        [criterioId]: { ...(prev[criterioId] ?? {}), [rangoId]: { ...previa, [campo]: texto } },
      };
    });
  }

  function guardar() {
    if (!editable || hayError || lineas.length === 0 || pendiente) return;
    iniciar(async () => {
      const r = await guardarLineasBaremo(evaluacion.id, candidateId, lineas);
      if (!r.ok || r.totalPoints === undefined) {
        toast.error(r.error ?? "No se pudo guardar la nota.");
        return;
      }
      setTotalServidor(r.totalPoints);
      if (r.band) setBand(r.band);
      setEstado("APPROVED");
      setFirmaGuardada(firma(lineas));
      toast.exito("Puntuado correctamente.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-toga-200 bg-white px-4 py-3">
        <p className="text-xs font-medium text-balanza-700">Baremo de esta evaluación</p>
        <h2 className="mt-0.5 text-base font-semibold text-toga-900">{baremo.title}</h2>
        {baremo.description && (
          <p className="mt-2 text-sm leading-relaxed text-toga-600">{baremo.description}</p>
        )}
        <p className="mt-2 text-xs text-toga-500">
          {hayCambios
            ? "Hay cambios sin guardar. El total se actualiza al guardar."
            : "Puntaje total del servidor"}
        </p>
        <p className="cifra mt-1 text-3xl font-semibold tracking-tight text-toga-900">
          {totalServidor}
          <span className="ml-2 text-sm font-normal text-toga-500">
            / {puntosBaremo(baremo.totalPoints)}
          </span>
        </p>
        {!hayCambios && BANDA[band] && <p className="mt-1 text-xs text-toga-500">{BANDA[band]}</p>}
      </div>

      {criterios.map((criterio) => {
        const rangos = [...criterio.rangos].sort((a, b) => a.order - b.order);
        const marcas = seleccion[criterio.id] ?? {};
        const tope = puntosBaremo(criterio.points);
        const elegidos = rangos.filter((r) => marcas[r.id] !== undefined);
        const suma = sumaCriterio(marcas, elegidos);
        const sumaExcede = suma > tope;

        return (
          <section
            key={criterio.id}
            className="rounded-lg border border-toga-200 bg-white px-4 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-toga-900">{criterio.name}</h3>
              <p className="cifra text-xs text-toga-500">{tope} pts</p>
            </div>
            {criterio.description && (
              <p className="mt-1 text-sm leading-relaxed text-toga-600">{criterio.description}</p>
            )}
            <p
              className={`mt-2 text-sm ${sumaExcede ? "font-medium text-red-700" : "text-toga-600"}`}
            >
              Suma de este criterio: <span className="cifra">{suma}</span> /{" "}
              <span className="cifra">{tope}</span>
            </p>
            {sumaExcede && (
              <p className="mensaje-error-campo">
                La suma de los puntajes no puede superar los puntos del criterio.
              </p>
            )}

            {rangos.length === 0 ? (
              <p className="mt-3 text-sm text-toga-500">Este criterio no tiene rangos.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {rangos.map((rango) => {
                  const activo = marcas[rango.id] !== undefined;
                  const texto = marcas[rango.id]?.puntaje ?? "";
                  const resultado = marcas[rango.id]?.resultado ?? "";
                  const fuera =
                    activo &&
                    texto.trim() !== "" &&
                    !puntajeValido(texto, rango.minPoints, rango.maxPoints);
                  return (
                    <li
                      key={rango.id}
                      className={`rounded-md border px-3 py-2 ${
                        activo ? "border-balanza-600 bg-balanza-50" : "border-toga-200"
                      }`}
                    >
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={activo}
                          disabled={!editable}
                          onChange={() => alternar(criterio.id, rango.id)}
                          className="mt-1"
                        />
                        <span>
                          <span className="text-sm font-medium text-toga-900">{rango.title}</span>
                          <span className="mt-0.5 block text-sm text-toga-600">
                            Mínimo <span className="cifra">{puntosBaremo(rango.minPoints)}</span>
                            {" · "}Máximo{" "}
                            <span className="cifra">{puntosBaremo(rango.maxPoints)}</span>
                          </span>
                          {rango.description && (
                            <span className="mt-1 block text-sm leading-relaxed text-toga-600">
                              {rango.description}
                            </span>
                          )}
                        </span>
                      </label>
                      {activo && (
                        <div className="mt-3 pl-6">
                          <div className="flex flex-wrap items-end gap-3">
                            <div>
                              <label
                                className="block text-xs font-medium text-toga-600"
                                htmlFor={`puntaje-${rango.id}`}
                              >
                                Puntaje obtenido
                              </label>
                              <input
                                id={`puntaje-${rango.id}`}
                                inputMode="decimal"
                                value={texto}
                                disabled={!editable}
                                onChange={(e) =>
                                  escribir(criterio.id, rango.id, "puntaje", e.target.value)
                                }
                                className={`cifra mt-1 w-28 rounded-md border bg-white px-3 py-2 text-sm text-toga-900 ${
                                  fuera ? "campo-con-error" : "border-toga-300"
                                }`}
                              />
                            </div>
                            <div>
                              <label
                                className="block text-xs font-medium text-toga-600"
                                htmlFor={`resultado-${rango.id}`}
                              >
                                Resultado obtenido
                              </label>
                              <input
                                id={`resultado-${rango.id}`}
                                value={resultado}
                                disabled={!editable}
                                onChange={(e) =>
                                  escribir(criterio.id, rango.id, "resultado", e.target.value)
                                }
                                className="mt-1 w-40 rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 disabled:bg-toga-50"
                              />
                            </div>
                          </div>
                          {fuera && (
                            <p className="mensaje-error-campo">
                              El puntaje debe estar entre {puntosBaremo(rango.minPoints)} y{" "}
                              {puntosBaremo(rango.maxPoints)}.
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {editable && (
        <button
          type="button"
          onClick={guardar}
          disabled={hayError || lineas.length === 0 || pendiente || !hayCambios}
          className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
        >
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
      )}

      {estado === "APPROVED" && puedeEditar && !hayCambios && evaluacion.ineligible && (
        <p className="rounded-lg border border-toga-200 bg-white px-4 py-3 text-sm text-toga-600">
          Este postulante está inelegible y no aparece en los rankings. Guardar de nuevo lo devuelve
          solo al ranking interno.
        </p>
      )}

    </div>
  );
}

function lineasDe(seleccion: Seleccion): LineaEnvio[] {
  const lineas: LineaEnvio[] = [];
  for (const [criterioId, rangos] of Object.entries(seleccion)) {
    for (const [rangoId, linea] of Object.entries(rangos)) {
      lineas.push({
        criterioId,
        rangoId,
        points: Number(linea.puntaje),
        resultado: linea.resultado.trim() ? linea.resultado.trim() : null,
      });
    }
  }
  lineas.sort(
    (a, b) => a.criterioId.localeCompare(b.criterioId) || a.rangoId.localeCompare(b.rangoId),
  );
  return lineas;
}

function firma(lineas: readonly LineaEnvio[]): string {
  return JSON.stringify(lineas);
}

function seleccionDesdeLineas(lineas: readonly LineaBaremoGuardada[]): Seleccion {
  const seleccion: Seleccion = {};
  for (const linea of lineas) {
    const delCriterio = seleccion[linea.criterioId] ?? {};
    delCriterio[linea.rangoId] = {
      puntaje: String(linea.points),
      resultado: linea.resultado ?? "",
    };
    seleccion[linea.criterioId] = delCriterio;
  }
  return seleccion;
}

function sumaCriterio(marcas: Record<string, LineaRango>, elegidos: readonly { id: string }[]) {
  return elegidos.reduce((acc, rango) => {
    const n = Number(marcas[rango.id]?.puntaje);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function puntajeValido(texto: string, min: string | number, max: string | number) {
  const n = Number(texto);
  return texto.trim() !== "" && dentroDeRango(n, min, max);
}

function dentroDeRango(valor: number, min: string | number, max: string | number) {
  return Number.isFinite(valor) && valor >= puntosBaremo(min) && valor <= puntosBaremo(max);
}
