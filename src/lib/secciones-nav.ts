import type { Role, Sesion } from "@/contracts";

/**
 * Permisos de ruta del panel — fuente única (segura para cliente).
 *
 * Sin imports de sesión/servidor: la barra lateral es Client Component.
 * La autorización real la hace la API; esto sólo filtra el menú.
 */
export const SECCIONES: readonly {
  readonly href: string;
  readonly texto: string;
  readonly roles: readonly Role[];
}[] = [
  {
    href: "/dashboard",
    texto: "Panel",
    roles: ["SUPER_ADMIN", "SECRETARY", "EVALUATOR", "PUBLISHER"],
  },
  {
    href: "/expedientes",
    texto: "Expedientes",
    roles: ["SUPER_ADMIN", "SECRETARY", "EVALUATOR", "PUBLISHER"],
  },
  {
    href: "/revision-documental",
    texto: "Revisión documental",
    roles: ["SUPER_ADMIN", "SECRETARY", "EVALUATOR", "PUBLISHER"],
  },
  { href: "/evaluacion", texto: "Evaluación", roles: ["SUPER_ADMIN", "EVALUATOR"] },
  { href: "/objeciones", texto: "Objeciones", roles: ["SUPER_ADMIN", "EVALUATOR"] },
  { href: "/ranking", texto: "Ranking interno", roles: ["SUPER_ADMIN", "EVALUATOR", "PUBLISHER"] },
  { href: "/publicaciones", texto: "Cola de publicación", roles: ["SUPER_ADMIN", "PUBLISHER"] },
  {
    href: "/informes",
    texto: "Informes",
    roles: ["SUPER_ADMIN", "PUBLISHER", "EVALUATOR"],
  },
  { href: "/usuarios", texto: "Usuarios y roles", roles: ["SUPER_ADMIN"] },
  { href: "/auditoria", texto: "Bitácora", roles: ["SUPER_ADMIN"] },
];

/** Secciones visibles para este usuario. */
export function seccionesDe(usuario: Sesion) {
  return SECCIONES.filter((s) => s.roles.some((r) => usuario.roles.includes(r)));
}

/**
 * ¿Puede este usuario ver esta ruta?
 *
 * Una ruta desconocida se permite: si mañana alguien añade una pantalla y
 * olvida declararla aquí, la API seguirá rechazándola si corresponde.
 */
export function puedeVerRuta(usuario: Sesion, ruta: string): boolean {
  const seccion = SECCIONES.filter((s) => ruta.startsWith(s.href)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  if (!seccion) return true;
  return seccion.roles.some((r) => usuario.roles.includes(r));
}
