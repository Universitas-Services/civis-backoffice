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
  it("sólo ve Expedientes, Ranking interno y sus propias objeciones", () => {
    expect(seccionesDe(con("VIEWER")).map((s) => s.href)).toEqual([
      "/expedientes",
      "/ranking",
      "/mis-objeciones",
    ]);
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

describe("comité (COMMITTEE)", () => {
  it("sólo ve su bandeja y entra directo a ella", () => {
    expect(seccionesDe(con("COMMITTEE")).map((s) => s.href)).toEqual(["/comite-objeciones"]);
    expect(rutaInicio(["COMMITTEE"])).toBe("/comite-objeciones");
  });

  it("no entra a la bandeja del Consejo ni al ranking", () => {
    const c = con("COMMITTEE");
    expect(puedeVerRuta(c, "/comite-objeciones/abc")).toBe(true);
    expect(puedeVerRuta(c, "/objeciones")).toBe(false);
    expect(puedeVerRuta(c, "/ranking")).toBe(false);
  });

  it("los evaluadores no ven la bandeja del comité", () => {
    expect(puedeVerRuta(con("EVALUATOR"), "/comite-objeciones")).toBe(false);
  });
});
