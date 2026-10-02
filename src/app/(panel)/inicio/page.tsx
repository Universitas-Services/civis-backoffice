import { redirect } from "next/navigation";
import { rutaInicio } from "@/lib/secciones-nav";
import { usuarioActual } from "@/lib/sesion";

/**
 * Destino seguro tras un error del panel: cada rol aterriza en su pantalla
 * de inicio (el revisor no tiene /dashboard).
 */
export default async function InicioPanel() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  redirect(rutaInicio(usuario.roles));
}
