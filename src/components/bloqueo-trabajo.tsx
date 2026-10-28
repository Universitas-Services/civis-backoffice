"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Lock, TriangleAlert } from "lucide-react";

/** Como mucho una renovación por minuto, aunque haya actividad continua. */
const INTERVALO_RENOVACION_MS = 60_000;

/**
 * Mantiene el bloqueo de un expediente u objeción mientras alguien lo trabaja.
 *
 * La página ya tomó el bloqueo al cargar. Aquí se renueva con la actividad
 * (clic, teclado o desplazamiento) y se libera al salir o cerrar la pestaña.
 * Una pestaña olvidada no renueva nada: el bloqueo vence a los 15 minutos.
 *
 * `api` es la ruta del panel con `/bloqueo` y `/liberar` debajo.
 */
export function BloqueoTrabajo({
  api,
  volver,
  textoVolver,
  aviso,
  perdidoPorDefecto,
}: {
  readonly api: string;
  readonly volver: string;
  readonly textoVolver: string;
  /** Lo que ve quien tiene el bloqueo. */
  readonly aviso: string;
  /** Mensaje si otra persona lo tomó y la API no dio uno. */
  readonly perdidoPorDefecto: string;
}) {
  const [perdido, setPerdido] = useState<string | null>(null);
  const ultimaRenovacion = useRef(Date.now());

  useEffect(() => {
    let activo = true;

    const renovar = async () => {
      ultimaRenovacion.current = Date.now();
      const respuesta = await fetch(`${api}/bloqueo`, { method: "POST" }).catch(() => null);
      if (!activo || !respuesta) return;
      if (respuesta.status === 409) {
        const datos = (await respuesta.json().catch(() => ({}))) as { message?: string };
        setPerdido(datos.message ?? perdidoPorDefecto);
      } else if (respuesta.ok) {
        setPerdido(null);
      }
    };

    const alActuar = () => {
      if (Date.now() - ultimaRenovacion.current >= INTERVALO_RENOVACION_MS) void renovar();
    };
    const alVolverVisible = () => {
      if (document.visibilityState === "visible") alActuar();
    };
    const liberar = () => navigator.sendBeacon(`${api}/liberar`);

    // Al montar se confirma el bloqueo. Sin esto, el doble montaje del modo
    // estricto de React lo soltaría en desarrollo.
    const inicial = window.setTimeout(() => void renovar(), 500);

    const opciones = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", alActuar, opciones);
    window.addEventListener("keydown", alActuar, opciones);
    window.addEventListener("scroll", alActuar, opciones);
    document.addEventListener("visibilitychange", alVolverVisible);
    window.addEventListener("pagehide", liberar);

    return () => {
      activo = false;
      window.clearTimeout(inicial);
      window.removeEventListener("pointerdown", alActuar, opciones);
      window.removeEventListener("keydown", alActuar, opciones);
      window.removeEventListener("scroll", alActuar, opciones);
      document.removeEventListener("visibilitychange", alVolverVisible);
      window.removeEventListener("pagehide", liberar);
      // Salir de la pantalla dentro del panel también lo libera.
      liberar();
    };
  }, [api, perdidoPorDefecto]);

  if (perdido) {
    return (
      <div
        role="alert"
        className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-balanza-200 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
      >
        <p className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {perdido} <strong>Sus cambios no se guardarán.</strong>
          </span>
        </p>
        <Link
          href={volver}
          className="rounded-md bg-balanza-600 px-3 py-1.5 font-semibold text-white hover:bg-balanza-700"
        >
          {textoVolver}
        </Link>
      </div>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-xs text-toga-500">
      <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {aviso}
    </p>
  );
}
