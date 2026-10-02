import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);
const cookiesGet = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookiesGet }),
}));
vi.mock("./sesion", () => ({
  usuarioActual: vi.fn(),
}));

import { renovarYVolver } from "./rutas";

describe("renovarYVolver", () => {
  beforeEach(() => {
    redirect.mockClear();
    cookiesGet.mockReset();
  });

  it("redirige a renovar cuando no hay marca de recién renovada", async () => {
    cookiesGet.mockReturnValue(undefined);
    await expect(renovarYVolver("/revision-documental")).rejects.toThrow(
      "REDIRECT:/api/sesion/renovar?volver=%2Frevision-documental",
    );
  });

  it("redirige a expirada (sin mutar cookies) si ya se renovó", async () => {
    cookiesGet.mockReturnValue({ value: "1" });
    await expect(renovarYVolver("/revision-documental")).rejects.toThrow(
      "REDIRECT:/api/sesion/expirada",
    );
    expect(redirect).toHaveBeenCalledWith("/api/sesion/expirada");
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/sesion/renovar"),
    );
  });
});
