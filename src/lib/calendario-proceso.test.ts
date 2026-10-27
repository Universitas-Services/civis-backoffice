import { describe, expect, it } from "vitest";
import { periodosProceso } from "./calendario-proceso";

const BASE = {
  applicationsClosedAt: "2026-10-23T18:00:00.000Z",
  inicio: null,
  objectionPeriodDays: 15,
  objectionBusinessDays: true,
  admissionDays: 8,
  descargoDays: 3,
  verificationDays: 5,
  holidays: [],
};

describe("calendario del proceso (vista previa)", () => {
  // Mismos casos que civis-api src/plazos: la vista previa no debe discrepar.
  it("encadena los periodos desde el día hábil siguiente al cierre", () => {
    expect(periodosProceso(BASE).map((p) => [p.clave, p.inicio, p.fin])).toEqual([
      ["LAPSO_OBJECIONES", "2026-10-26", "2026-11-13"],
      ["ADMISION", "2026-11-14", "2026-11-21"],
      ["DESCARGOS", "2026-11-22", "2026-11-24"],
      ["COMPROBACION", "2026-11-25", "2026-11-29"],
    ]);
  });

  it("salta los feriados en días hábiles", () => {
    const p = periodosProceso({ ...BASE, inicio: "2026-10-05", holidays: ["2026-10-12"] });
    expect(p[0]).toMatchObject({ inicio: "2026-10-05", fin: "2026-10-26" });
  });

  it("sin cierre ni inicio no hay calendario", () => {
    expect(periodosProceso({ ...BASE, applicationsClosedAt: null })).toEqual([]);
  });
});
