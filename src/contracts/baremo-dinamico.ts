import { z } from "zod";

/**
 * Espejo de civis-api `baremo-dinamico.ts`.
 * Los rangos de un criterio son alternativas: se elige uno, y su máximo
 * no puede superar los puntos del criterio.
 */
const puntos = z
  .number("Indique el puntaje")
  .finite("Indique el puntaje")
  .nonnegative("No puede ser negativo")
  .max(1000, "Máximo 1000");

export const baremoRangoSchema = z
  .object({
    title: z.string().trim().min(1, "Indique el título del rango").max(200),
    description: z.string().trim().max(2000).optional(),
    minPoints: puntos,
    maxPoints: puntos,
  })
  .refine((r) => r.minPoints <= r.maxPoints, {
    message: "El mínimo no puede ser mayor que el máximo",
    path: ["minPoints"],
  });

export const baremoCriterioSchema = z
  .object({
    name: z.string().trim().min(1, "Indique el nombre del criterio").max(200),
    description: z.string().trim().max(2000).optional(),
    points: puntos,
    rangos: z.array(baremoRangoSchema).default([]),
  })
  .superRefine((c, ctx) => {
    c.rangos.forEach((r, i) => {
      if (r.maxPoints > c.points) {
        ctx.addIssue({
          code: "custom",
          path: ["rangos", i, "maxPoints"],
          message: `El máximo del rango (${r.maxPoints}) excede los puntos del criterio (${c.points})`,
        });
      }
    });
  });

export const baremoSchema = z
  .object({
    title: z.string().trim().min(1, "Indique el título").max(200),
    description: z.string().trim().max(2000).optional(),
    totalPoints: puntos.refine((n) => n > 0, "La puntuación total debe ser mayor que 0"),
    criterios: z.array(baremoCriterioSchema).default([]),
  })
  .superRefine((b, ctx) => {
    const suma = b.criterios.reduce((acc, c) => acc + c.points, 0);
    if (suma > b.totalPoints) {
      ctx.addIssue({
        code: "custom",
        path: ["criterios"],
        message: `La suma de los criterios (${suma}) excede el total (${b.totalPoints})`,
      });
    }
  });

export type BaremoInput = z.infer<typeof baremoSchema>;

export type BaremoListado = {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly totalPoints: number;
  readonly active: boolean;
  readonly criterios: number;
  readonly updatedAt: string;
};

export type BaremoRangoDetalle = {
  readonly id: string;
  readonly criterioId: string;
  readonly title: string;
  readonly description: string | null;
  readonly minPoints: string | number;
  readonly maxPoints: string | number;
  readonly order: number;
};

export type BaremoCriterioDetalle = {
  readonly id: string;
  readonly baremoId: string;
  readonly name: string;
  readonly description: string | null;
  readonly points: string | number;
  readonly order: number;
  readonly rangos: readonly BaremoRangoDetalle[];
};

export type BaremoDetalle = {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly totalPoints: string | number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly criterios: readonly BaremoCriterioDetalle[];
};

export function puntosBaremo(valor: string | number): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}
