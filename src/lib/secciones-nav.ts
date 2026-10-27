import type { Role, Sesion } from "@/contracts";

/**
 * Permisos de ruta del panel — fuente única (segura para cliente).
 *
 * Sin imports de sesión/servidor: la barra lateral es Client Component.
 * La autorización real la hace la API; esto sólo filtra el menú.
 *
 * Matriz UX (más estricta que algunos @Roles de la API):
 * - Crear expediente: SUPER_ADMIN + SECRETARY
 * - Revisión documental: SUPER_ADMIN + REVIEWER
 * - Evaluación: SUPER_ADMIN + ADMIN + EVALUATOR (ADMIN resuelve escaladas de comité; el voto es del evaluador)
 * - Comité: SUPER_ADMIN + COMMITTEE. Toda objeción llega primero aquí; el comité
 *   espera el descargo del postulante y la envía al Consejo (con motivo si no hay descargo).
 * - Objeciones (bandeja y ajuste del Consejo): SUPER_ADMIN + ADMIN + EVALUATOR. Sólo ven
 *   lo que el comité envió. Los visualizadores objetan desde el ranking interno cuando
 *   el interruptor de SUPER_ADMIN/ADMIN lo habilita.
 * - Baremo (lista, activo y aplicar): SUPER_ADMIN + ADMIN + EVALUATOR
 * - Configurar baremo: solo SUPER_ADMIN (la API también lo permite al ADMIN)
 * - Ranking interno: SUPER_ADMIN + ADMIN + EVALUATOR + VIEWER. Enviar al ranking público
 *   y los interruptores de landing y de refresco: solo SUPER_ADMIN. «Actualizar en el
 *   ranking público»: SUPER_ADMIN siempre; ADMIN y EVALUATOR si SUPER_ADMIN lo habilita.
 * - Informes: solo SUPER_ADMIN
 * - ADMIN ve Panel, Expedientes, Evaluación (escaladas), Baremo, Objeciones, Ranking interno y Usuarios
 * - VIEWER (visualizador, diputado) ve Expedientes en solo lectura y Ranking interno
 */
export type EntradaNav = {
  readonly href: string;
  readonly texto: string;
  readonly roles: readonly Role[];
};

export type SeccionNav = EntradaNav & {
  readonly hijos?: readonly EntradaNav[];
};

export const SECCIONES: readonly SeccionNav[] = [
  {
    href: "/dashboard",
    texto: "Panel",
    roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY", "EVALUATOR"],
  },
  {
    href: "/expedientes",
    texto: "Expedientes",
    roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY", "REVIEWER", "EVALUATOR", "VIEWER"],
  },
  {
    href: "/revision-documental",
    texto: "Revisión documental",
    roles: ["SUPER_ADMIN", "REVIEWER"],
  },
  { href: "/evaluacion", texto: "Evaluación", roles: ["SUPER_ADMIN", "ADMIN", "EVALUATOR"] },
  {
    href: "/baremo",
    texto: "Baremo",
    roles: ["SUPER_ADMIN", "ADMIN", "EVALUATOR"],
    hijos: [
      {
        href: "/baremo/configuracion",
        texto: "Crear baremo",
        roles: ["SUPER_ADMIN"],
      },
      {
        href: "/baremo",
        texto: "Postulados",
        roles: ["SUPER_ADMIN", "ADMIN", "EVALUATOR"],
      },
    ],
  },
  { href: "/comite-objeciones", texto: "Comité", roles: ["SUPER_ADMIN", "COMMITTEE"] },
  { href: "/objeciones", texto: "Objeciones", roles: ["SUPER_ADMIN", "ADMIN", "EVALUATOR"] },
  {
    href: "/ranking",
    texto: "Ranking interno",
    roles: ["SUPER_ADMIN", "ADMIN", "EVALUATOR", "VIEWER"],
  },
  {
    href: "/informes",
    texto: "Informes",
    roles: ["SUPER_ADMIN"],
  },
  { href: "/usuarios", texto: "Usuarios y roles", roles: ["SUPER_ADMIN", "ADMIN"] },
  {
    href: "/cuentas-postulantes",
    texto: "Cuentas de postulantes",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  { href: "/configuracion", texto: "Configuración del proceso", roles: ["SUPER_ADMIN"] },
  { href: "/documentos-legales", texto: "Documentos legales", roles: ["SUPER_ADMIN"] },
  { href: "/auditoria", texto: "Bitácora", roles: ["SUPER_ADMIN"] },
];

function rolPermitido(roles: readonly Role[], usuario: Sesion) {
  return roles.some((r) => usuario.roles.includes(r));
}

/** Secciones visibles para este usuario. El submenú solo aparece si hay más de un hijo. */
export function seccionesDe(usuario: Sesion): readonly SeccionNav[] {
  return SECCIONES.filter((s) => rolPermitido(s.roles, usuario)).map((s) => {
    const hijos = s.hijos?.filter((h) => rolPermitido(h.roles, usuario)) ?? [];
    return { ...s, hijos: hijos.length > 1 ? hijos : undefined };
  });
}

function entradasDeRuta(): readonly EntradaNav[] {
  return SECCIONES.flatMap((s) => [s, ...(s.hijos ?? [])]);
}

/**
 * Primera pantalla tras iniciar sesión.
 * El revisor no tiene panel de métricas: la API no le da ese resumen.
 * El visualizador entra directo al ranking, que es donde opina y objeta.
 */
export function rutaInicio(roles: readonly string[]): string {
  const vePanel = SECCIONES.find((s) => s.href === "/dashboard")?.roles.some((r) =>
    roles.includes(r),
  );
  if (vePanel) return "/dashboard";
  if (roles.includes("REVIEWER")) return "/revision-documental";
  if (roles.includes("COMMITTEE")) return "/comite-objeciones";
  if (roles.includes("VIEWER")) return "/ranking";
  return "/expedientes";
}

/**
 * ¿Puede este usuario ver esta ruta?
 *
 * Una ruta desconocida se permite: si mañana alguien añade una pantalla y
 * olvida declararla aquí, la API seguirá rechazándola si corresponde.
 */
export function puedeVerRuta(usuario: Sesion, ruta: string): boolean {
  const seccion = entradasDeRuta()
    .filter((s) => ruta === s.href || ruta.startsWith(`${s.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!seccion) return true;
  return rolPermitido(seccion.roles, usuario);
}
