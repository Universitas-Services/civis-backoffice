import Link from "next/link";
import type { Sesion } from "@/contracts";
import { ROL_ETIQUETA } from "@/contracts";
import { seccionesDe } from "@/lib/rutas";
import { terminarSesion } from "@/app/acciones-auth";

/**
 * Navegación lateral.
 *
 * Las secciones y sus roles viven en `lib/rutas.ts`, compartidos con el
 * layout: ocultar un enlace pero dejar la ruta accesible producía un 500 en
 * lugar de un mensaje claro. Ocultar NO es seguridad; la autorización real
 * la hace la API en cada llamada.
 */
export function BarraLateral({
  usuario,
  rutaActiva,
}: {
  readonly usuario: Sesion;
  readonly rutaActiva: string;
}) {
  const visibles = seccionesDe(usuario);

  return (
    <aside className="flex shrink-0 flex-col bg-toga-900 md:w-64">
      <div className="border-b border-toga-800 px-5 py-4">
        <p className="font-serif text-sm font-semibold text-white">CONSEJO INDEPENDIENTE</p>
        <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-balanza-500">
          Panel · {usuario.roles.map((r) => ROL_ETIQUETA[r]).join(" + ")}
        </p>
      </div>

      <nav aria-label="Secciones del panel" className="flex-1 overflow-x-auto px-3 py-4">
        <ul className="flex gap-1 md:flex-col">
          {visibles.map((s) => {
            const activa = rutaActiva.startsWith(s.href);
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={activa ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors md:border-l-2 ${
                    activa
                      ? "bg-toga-800 text-white md:border-balanza-600"
                      : "text-toga-300 hover:bg-toga-800/60 hover:text-white md:border-transparent"
                  }`}
                >
                  {s.texto}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-toga-800 px-5 py-4">
        <p className="truncate text-sm font-medium text-white">{usuario.fullName}</p>
        <p className="truncate text-xs text-toga-400">{usuario.email}</p>
        <form action={terminarSesion} className="mt-3">
          <button
            type="submit"
            className="text-xs font-medium text-toga-300 underline-offset-2 hover:text-balanza-500 hover:underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
