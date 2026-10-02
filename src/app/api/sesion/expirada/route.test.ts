import { describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";

vi.mock("@/lib/config", () => ({
  COOKIE_RECIEN_RENOVADA: "cp_bo_recien_renovada",
  COOKIE_SESION: "cp_bo_session",
  origenPanel: () => "http://localhost:3002",
}));

vi.mock("@/lib/sesion", () => ({
  OPCIONES_COOKIE: {
    secure: false,
    sameSite: "lax" as const,
  },
  limpiarCookiesSesion: (respuesta: NextResponse) => {
    const opts = { httpOnly: true, secure: false, sameSite: "lax" as const, path: "/", maxAge: 0 };
    respuesta.cookies.set("cp_bo_recien_renovada", "", opts);
    respuesta.cookies.set("cp_bo_session", "", opts);
  },
}));

import { GET } from "./route";

describe("GET /api/sesion/expirada", () => {
  it("limpia marca y sesión y manda al login", async () => {
    const response = await GET(
      new Request("http://localhost:3002/api/sesion/expirada"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3002/login?sesion=expirada",
    );

    const setCookie = response.headers.getSetCookie?.() ?? [];
    const joined = setCookie.join("\n");
    expect(joined).toMatch(/cp_bo_recien_renovada=/);
    expect(joined).toMatch(/cp_bo_session=/);
    expect(joined).toMatch(/Max-Age=0/);
  });
});
