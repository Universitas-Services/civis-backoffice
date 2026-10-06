import type { Metadata } from "next";
import type { AjustesPortal, UsuarioDirectorio } from "@/contracts";
import { directorioVisiblePara } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { UsuariosTabs } from "@/components/usuarios-tabs";

export const metadata: Metadata = { title: "Usuarios y roles" };

export default async function Usuarios() {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN");

  let usuarios: readonly UsuarioDirectorio[];
  let ajustes: AjustesPortal = {
    objectionsOpen: false,
    evaluationMode: "INDIVIDUAL",
    maxActiveEvaluators: 7,
    quorumThreshold: 5,
    roundDeadlineDays: 5,
  };
  try {
    usuarios = await llamarApi<UsuarioDirectorio[]>("/internal/users");
    ajustes = await llamarApi<AjustesPortal>("/public/portal");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/usuarios");
    throw error;
  }

  const directorio = directorioVisiblePara(usuario.roles, usuarios);

  return (
    <>
      <CabeceraPagina
        titulo="Usuarios y roles"
        descripcion="Quién entra al sistema y con qué rol. Suspender una cuenta revoca sus sesiones al instante, pero no borra su historial de evaluaciones."
      />

      <div className="px-5 py-6 sm:px-8">
        <UsuariosTabs
          directorio={directorio}
          rolesActor={usuario.roles}
          usuarioId={usuario.id}
          ajustes={ajustes}
          esSuperAdmin={usuario.roles.includes("SUPER_ADMIN")}
        />
      </div>
    </>
  );
}
