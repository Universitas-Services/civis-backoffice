import type { BaremoDetalle, BaremoInput } from "@/contracts";
import { puntosBaremo } from "@/contracts";

export type RangoForm = {
  key: string;
  title: string;
  description: string;
  minPoints: string;
  maxPoints: string;
};

export type CriterioForm = {
  key: string;
  name: string;
  description: string;
  points: string;
  rangos: RangoForm[];
};

export type FormularioBaremo = {
  title: string;
  description: string;
  totalPoints: string;
  criterios: CriterioForm[];
};

function clave() {
  return crypto.randomUUID();
}

export function rangoVacio(): RangoForm {
  return { key: clave(), title: "", description: "", minPoints: "", maxPoints: "" };
}

export function criterioVacio(): CriterioForm {
  return { key: clave(), name: "", description: "", points: "", rangos: [] };
}

/** Arma el formulario con los puntos ya numéricos. Los UUID solo sirven de clave local. */
export function formularioDesdeDetalle(baremo: BaremoDetalle): FormularioBaremo {
  return {
    title: baremo.title,
    description: baremo.description ?? "",
    totalPoints: String(puntosBaremo(baremo.totalPoints)),
    criterios: [...baremo.criterios]
      .sort((a, b) => a.order - b.order)
      .map((criterio) => ({
        key: criterio.id,
        name: criterio.name,
        description: criterio.description ?? "",
        points: String(puntosBaremo(criterio.points)),
        rangos: [...criterio.rangos]
          .sort((a, b) => a.order - b.order)
          .map((rango) => ({
            key: rango.id,
            title: rango.title,
            description: rango.description ?? "",
            minPoints: String(puntosBaremo(rango.minPoints)),
            maxPoints: String(puntosBaremo(rango.maxPoints)),
          })),
      })),
  };
}

function textoOpcional(valor: string) {
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : undefined;
}

/** Vacío no es cero: el esquema lo rechaza en lugar de guardar un 0 implícito. */
function puntaje(valor: string): number {
  const limpio = valor.trim();
  if (!limpio) return Number.NaN;
  return Number(limpio);
}

/** Cuerpo de POST y PATCH: sin id, order ni active. */
export function payloadBaremo(form: FormularioBaremo): BaremoInput {
  return {
    title: form.title,
    description: textoOpcional(form.description),
    totalPoints: puntaje(form.totalPoints),
    criterios: form.criterios.map((criterio) => ({
      name: criterio.name,
      description: textoOpcional(criterio.description),
      points: puntaje(criterio.points),
      rangos: criterio.rangos.map((rango) => ({
        title: rango.title,
        description: textoOpcional(rango.description),
        minPoints: puntaje(rango.minPoints),
        maxPoints: puntaje(rango.maxPoints),
      })),
    })),
  };
}

export function mover<T>(lista: readonly T[], desde: number, delta: number): T[] {
  const hacia = desde + delta;
  if (hacia < 0 || hacia >= lista.length) return [...lista];
  const copia = [...lista];
  const [item] = copia.splice(desde, 1);
  if (item === undefined) return copia;
  copia.splice(hacia, 0, item);
  return copia;
}
