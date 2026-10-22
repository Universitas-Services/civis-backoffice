import { describe, expect, it } from "vitest";
import { objecionVisualizadorSchema, opinionSchema } from "./index";

const objecionValida = {
  causes: ["POLITICAL_MILITANCY"],
  description: "x".repeat(60),
  evidenceUrl: "https://ejemplo.org/pruebas.pdf",
};

describe("opinionSchema", () => {
  it("rechaza una opinión de menos de 10 caracteres", () => {
    expect(opinionSchema.safeParse({ body: "corta" }).success).toBe(false);
  });

  it("acepta una opinión normal", () => {
    expect(opinionSchema.safeParse({ body: "Tiene buena trayectoria." }).success).toBe(true);
  });
});

describe("objecionVisualizadorSchema", () => {
  it("acepta una objeción completa sin datos de identidad", () => {
    expect(objecionVisualizadorSchema.safeParse(objecionValida).success).toBe(true);
  });

  it("exige al menos una causal", () => {
    expect(objecionVisualizadorSchema.safeParse({ ...objecionValida, causes: [] }).success).toBe(
      false,
    );
  });

  it("«Otra» exige el texto de la otra razón", () => {
    const r = objecionVisualizadorSchema.safeParse({ ...objecionValida, causes: ["OTHER"] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["otherCause"]);
  });

  it("rechaza un enlace de pruebas inválido", () => {
    expect(
      objecionVisualizadorSchema.safeParse({ ...objecionValida, evidenceUrl: "no-es-url" }).success,
    ).toBe(false);
  });
});
