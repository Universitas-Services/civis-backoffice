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

import { destinoDeDigest, RecargaSesion } from "./recarga-sesion";
import { renovarYVolver } from "./rutas";

describe("renovarYVolver", () => {
  beforeEach(() => {
    redirect.mockClear();
    cookiesGet.mockReset();
  });

  it("pide recargar hacia renovar cuando no hay marca de recién renovada", async () => {
    cookiesGet.mockReturnValue(undefined);
    const error = await renovarYVolver("/revision-documental").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RecargaSesion);
    expect(destinoDeDigest((error as RecargaSesion).digest)).toBe(
      "/api/sesion/renovar?volver=%2Frevision-documental",
    );
    // Nunca un redirect(): el cliente lo seguiría como navegación suave.
    expect(redirect).not.toHaveBeenCalled();
  });

  it("pide recargar hacia expirada (sin mutar cookies) si ya se renovó", async () => {
    cookiesGet.mockReturnValue({ value: "1" });
    const error = await renovarYVolver("/revision-documental").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RecargaSesion);
    expect(destinoDeDigest((error as RecargaSesion).digest)).toBe("/api/sesion/expirada");
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("destinoDeDigest", () => {
  it("ignora digests ajenos y destinos fuera de /api/sesion", () => {
    expect(destinoDeDigest(undefined)).toBeNull();
    expect(destinoDeDigest("12345")).toBeNull();
    expect(destinoDeDigest("CIVIS_RECARGA_SESION:https://otro.example")).toBeNull();
    expect(destinoDeDigest("CIVIS_RECARGA_SESION://otro.example")).toBeNull();
  });
});
