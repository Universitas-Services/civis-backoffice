"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Sesion } from "@/contracts";
import { seccionesDe } from "@/lib/secciones-nav";
import { terminarSesion } from "@/app/acciones-auth";
import { ConTooltip, TooltipProvider } from "@/components/ui/tooltip";
import { EVENTO_SIDEBAR_DOCUMENTO } from "@/lib/sidebar-panel";

const CLAVE_COLAPSADO = "civis.sidebar.colapsado";

function rutaCoincide(pathname: string | null | undefined, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navegación lateral.
 *
 * Las secciones y sus roles viven en `lib/secciones-nav.ts`. Ocultar un enlace
 * NO es seguridad; la autorización real la hace la API en cada llamada.
 *
 * La ruta activa sale de `usePathname()`: el layout del panel no se re-ejecuta
 * en cada navegación cliente, así que un `x-pathname` del servidor se quedaría
 * congelado en la primera página (p. ej. Panel).
 */
export function BarraLateral({ usuario }: { readonly usuario: Sesion }) {
  const pathname = usePathname() ?? "";
  const visibles = seccionesDe(usuario);
  const [colapsado, setColapsado] = useState(false);
  const [documentoAbierto, setDocumentoAbierto] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      setColapsado(localStorage.getItem(CLAVE_COLAPSADO) === "1");
    } catch {
      /* almacenamiento no disponible */
    }
    setListo(true);
  }, []);

  useEffect(() => {
    function onDocumento(ev: Event) {
      const detail = (ev as CustomEvent<{ abierto?: boolean }>).detail;
      setDocumentoAbierto(Boolean(detail?.abierto));
    }
    window.addEventListener(EVENTO_SIDEBAR_DOCUMENTO, onDocumento);
    return () => {
      window.removeEventListener(EVENTO_SIDEBAR_DOCUMENTO, onDocumento);
      setDocumentoAbierto(false);
    };
  }, []);

  function alternar() {
    const actualmenteEstrecho = colapsado || documentoAbierto;
    if (actualmenteEstrecho) {
      setDocumentoAbierto(false);
      setColapsado(false);
      try {
        localStorage.setItem(CLAVE_COLAPSADO, "0");
      } catch {
        /* ignore */
      }
      return;
    }
    setColapsado(true);
    try {
      localStorage.setItem(CLAVE_COLAPSADO, "1");
    } catch {
      /* ignore */
    }
  }

  const estrecho = listo && (colapsado || documentoAbierto);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={`flex w-full shrink-0 flex-col bg-balanza-600 transition-[width] duration-200 md:sticky md:top-0 md:h-dvh md:self-start md:overflow-hidden ${
          estrecho ? "md:w-16" : "md:w-64"
        }`}
      >
        <div
          className={`flex shrink-0 items-center border-b border-white/15 ${
            estrecho ? "justify-center px-2 py-3" : "gap-2.5 px-3 py-3"
          }`}
        >
          <button
            type="button"
            onClick={alternar}
            aria-expanded={!colapsado}
            aria-controls="nav-panel"
            aria-label={colapsado ? "Expandir menú" : "Comprimir menú"}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white transition-colors hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className={`min-w-0 flex-1 ${estrecho ? "md:hidden" : "flex justify-center pr-1"}`}>
            <Image
              src="/brand/logo-horiz-slogan-blanco.png"
              alt="CIVIS — Consejo Independiente de Verificación de Credenciales"
              width={280}
              height={72}
              className="h-11 w-auto max-w-full object-contain"
              priority
            />
          </div>
        </div>

        <nav
          id="nav-panel"
          aria-label="Secciones del panel"
          className="barra-lateral-nav min-h-0 flex-1 overflow-x-auto px-2 py-3 md:overflow-x-hidden md:overflow-y-auto"
        >
          <ul className={`flex gap-1 ${estrecho ? "md:flex-col md:items-center" : "md:flex-col"}`}>
            {visibles.map((s) => {
              const activa = rutaCoincide(pathname, s.href);
              const enlace = (
                <Link
                  href={s.href}
                  aria-label={s.texto}
                  aria-current={activa ? "page" : undefined}
                  className={`flex items-center rounded-md text-sm transition-colors ${
                    estrecho
                      ? "justify-center px-2 py-2.5 md:mx-auto md:w-10"
                      : "gap-3 px-3 py-2 md:border-l-2"
                  } ${
                    activa
                      ? "bg-black/25 text-white md:border-white"
                      : "text-white/80 hover:bg-black/15 hover:text-white md:border-transparent"
                  }`}
                >
                  <IconoSeccion href={s.href} className="h-5 w-5 shrink-0" />
                  <span className={estrecho ? "md:hidden" : ""}>{s.texto}</span>
                </Link>
              );

              return (
                <li key={s.href} className={estrecho ? "md:w-full" : undefined}>
                  {estrecho ? (
                    <ConTooltip texto={s.texto} side="right">
                      {enlace}
                    </ConTooltip>
                  ) : (
                    enlace
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={`shrink-0 border-t border-white/15 ${
            estrecho ? "px-2 py-3" : "px-4 py-4 text-center"
          }`}
        >
          {!estrecho && (
            <>
              <p className="truncate text-sm font-medium text-white">{usuario.fullName}</p>
              <p className="truncate text-xs text-white/70">{usuario.email}</p>
            </>
          )}
          <form
            action={terminarSesion}
            className={estrecho ? "flex justify-center" : "mt-3 flex justify-center"}
          >
            {estrecho ? (
              <ConTooltip texto="Cerrar sesión" side="right">
                <button
                  type="submit"
                  aria-label="Cerrar sesión"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-black/20 hover:text-white"
                >
                  <IconoSalir className="h-5 w-5" />
                </button>
              </ConTooltip>
            ) : (
              <button
                type="submit"
                aria-label="Cerrar sesión"
                className="text-xs font-medium text-white/80 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                Cerrar sesión
              </button>
            )}
          </form>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function IconoSeccion({ href, className }: { readonly href: string; readonly className?: string }) {
  const props = {
    viewBox: "0 0 24 24",
    className,
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  switch (href) {
    case "/dashboard":
      return (
        <svg {...props}>
          <path
            d="M4 4h7v7H4V4Zm9 0h7v5h-7V4ZM4 13h7v7H4v-7Zm9 3h7v4h-7v-4Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/expedientes":
      return (
        <svg {...props}>
          <path
            d="M3.5 7.5h6l1.5 2h9.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 2 19V9a1.5 1.5 0 0 1 1.5-1.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/revision-documental":
      return (
        <svg {...props}>
          <path
            d="M7 3.5h7.5L19 8v12.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M14 3.5V8h4.5M8.5 13h7M8.5 16.5h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "/evaluacion":
      return (
        <svg {...props}>
          <path
            d="M8 4h8v3H8V4Zm-2 3h12v13.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 13.5 11 15l3.5-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/objeciones":
      return (
        <svg {...props}>
          <path
            d="M6 3.5v17M6 4.5h9.5l-1.5 3.5 1.5 3.5H6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/ranking":
      return (
        <svg {...props}>
          <path
            d="M5 19.5V11h3.5v8.5H5Zm5.25 0V5h3.5v14.5h-3.5Zm5.25 0V9H19v10.5h-3.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/publicaciones":
      return (
        <svg {...props}>
          <path
            d="M4 11.5 19.5 5l-3 14.5-5.2-4.2L7.5 19v-4.8L4 11.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/informes":
      return (
        <svg {...props}>
          <path
            d="M5 19.5h14M7.5 16V10M12 16V6.5M16.5 16v-3.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "/usuarios":
      return (
        <svg {...props}>
          <path
            d="M9.5 11a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM4.5 19.5c0-2.9 2.2-5.25 5-5.25h0c2.8 0 5 2.35 5 5.25"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M16 11.25a2.5 2.5 0 1 0 0-5M19.5 19.5c0-2.2-1.4-4-3.4-4.6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "/auditoria":
      return (
        <svg {...props}>
          <path
            d="M6.5 4.5h11v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-1 .6V4.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M9 9h6M9 12.5h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
  }
}

function IconoSalir({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M10 5.5H6.5A1.5 1.5 0 0 0 5 7v10a1.5 1.5 0 0 0 1.5 1.5H10M14 8.5 18.5 12 14 15.5M18 12H9.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
