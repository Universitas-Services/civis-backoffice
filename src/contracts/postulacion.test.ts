import { describe, expect, it } from "vitest";
import {
  FORMATO_CODIGO_ACCESO,
  normalizarCodigoAcceso,
  normalizarTelefono,
  TELEFONO_VE,
} from "./index";

const valido = (v: string) => TELEFONO_VE.test(normalizarTelefono(v));

describe("teléfono venezolano", () => {
  it.each([
    "04121234567",
    "04141234567",
    "04161234567",
    "04221234567",
    "04241234567",
    "04261234567",
    "02121234567",
    "02617654321",
  ])("acepta %s", (v) => expect(valido(v)).toBe(true));

  it("normaliza +58 y separadores al formato nacional", () => {
    expect(normalizarTelefono("+58 414-123.45.67")).toBe("04141234567");
    expect(valido("+58 414 1234567")).toBe(true);
  });

  it.each(["04131234567", "0414123456", "041412345678", "14141234567", "0800123456"])(
    "rechaza %s",
    (v) => expect(valido(v)).toBe(false),
  );
});

describe("código de acceso", () => {
  it("se normaliza aunque se escriba en minúsculas, sin guiones o con espacios", () => {
    expect(normalizarCodigoAcceso(" civis 7k3m-q9xa 2f8p ")).toBe("CIVIS-7K3M-Q9XA-2F8P");
    expect(FORMATO_CODIGO_ACCESO.test(normalizarCodigoAcceso("7k3mq9xa2f8p"))).toBe(true);
  });

  it("rechaza códigos con caracteres ambiguos o de largo incorrecto", () => {
    expect(FORMATO_CODIGO_ACCESO.test(normalizarCodigoAcceso("CIVIS-0O1I-Q9XA-2F8P"))).toBe(false);
    expect(FORMATO_CODIGO_ACCESO.test(normalizarCodigoAcceso("CIVIS-7K3M-Q9XA"))).toBe(false);
  });
});
