import { describe, expect, it } from "vitest";
import { normalizarTelefono, TELEFONO_VE } from "./index";

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
