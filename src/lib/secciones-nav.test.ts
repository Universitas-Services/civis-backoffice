import { describe, expect, it } from "vitest";
import type { Role, Sesion } from "@/contracts";
import { puedeVerRuta, rutaInicio, seccionesDe } from "./secciones-nav";

const con = (...roles: Role[]): Sesion => ({
  id: "u1",
  email: "u@test.com",
  fullName: "Usuario",
  roles,
});

describe("visualizador (VIEWER)", () => {
  it("sólo ve Expedientes y Ranking interno", () => {
    expect(seccionesDe(con("VIEWER")).map((s) => s.href)).toEqual(["/expedientes", "/ranking"]);
  });

  it("entra directo al ranking", () => {
    expect(rutaInicio(["VIEWER"])).toBe("/ranking");
  });

  it("puede abrir la ficha del ranking pero no Objeciones ni Evaluación", () => {
    const v = con("VIEWER");
    expect(puedeVerRuta(v, "/ranking/abc")).toBe(true);
    expect(puedeVerRuta(v, "/expedientes/abc")).toBe(true);
    expect(puedeVerRuta(v, "/objeciones")).toBe(false);
    expect(puedeVerRuta(v, "/evaluacion")).toBe(false);
    expect(puedeVerRuta(v, "/usuarios")).toBe(false);
  });

  it("con otro rol operativo, conserva su pantalla de inicio", () => {
    expect(rutaInicio(["VIEWER", "EVALUATOR"])).toBe("/dashboard");
  });
});
