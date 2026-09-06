import { redirect } from "next/navigation";
import type { Role, Sesion } from "@/contracts";
import { usuarioActual } from "./sesion";

/**
 * Permisos de ruta del panel — fuente única.
 *
 * La usan la barra lateral (para decidir qué enlaces muestra) y el layout
 * (para negar el acceso con un mensaje claro). Tenerlo en dos sitios llevaba
 * a que el menú ocultara una sección y la ruta directa reventara con un 500.
 *
 * Esto NO es la seguridad del sistema: la autorización real la hace la API en
 * cada llamada. Aquí sólo se evita enseñar una pantalla que va a fallar.
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
 * olvida declararla aquí, la API seguirá rechazándola si corresponde. Bloquear
 * por defecto aquí daría falsos negativos sin ganar seguridad real.
 */
export function puedeVerRuta(usuario: Sesion, ruta: string): boolean {
  const seccion = SECCIONES.filter((s) => ruta.startsWith(s.href)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  if (!seccion) return true;
  return seccion.roles.some((r) => usuario.roles.includes(r));
}

/**
 * Guard de rol para una pantalla concreta.
 *
 * Va en la PÁGINA y no en el layout a propósito: Next renderiza layout y
 * página en paralelo, así que un layout que decide no incluir a su hijo no
 * impide que ese hijo ya haya lanzado su petición —y su 403— antes.
 *
 * Devuelve el usuario si tiene alguno de los roles; si no, redirige a la
 * pantalla que le explica por qué no puede entrar.
 */
export async function exigirRol(...roles: readonly Role[]): Promise<Sesion> {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  if (!roles.some((r) => usuario.roles.includes(r))) redirect("/sin-permiso");
  return usuario;
}

/**
 * Qué hacer cuando la API responde 401 durante el render de una página.
 *
 * Se manda al operador a renovar el token y volver aquí mismo, en vez de
 * expulsarlo al login. Sin esto, el token de 15 minutos echaría a quien esté
 * evaluando un expediente en mitad del trabajo.
 *
 * La renovación no puede hacerse desde el render —Next no deja escribir
 * cookies ahí—, así que se delega en /api/sesion/renovar, que sí puede. Si el
 * refresh tampoco vale, ese handler manda al login.
 */
export function renovarYVolver(ruta: string): never {
  redirect(`/api/sesion/renovar?volver=${encodeURIComponent(ruta)}`);
}
