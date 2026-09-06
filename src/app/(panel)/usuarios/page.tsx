import type { Metadata } from "next";
import type { UsuarioDirectorio } from "@/contracts";
import { ROL_ETIQUETA } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { CrearUsuario, EditorRoles, InterruptorUsuario } from "@/components/gestion-usuarios";

export const metadata: Metadata = { title: "Usuarios y roles" };

export default async function Usuarios() {
  const usuario = await exigirRol("SUPER_ADMIN");

  let usuarios: readonly UsuarioDirectorio[];
  try {
    usuarios = await llamarApi<UsuarioDirectorio[]>("/internal/users");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/usuarios");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Usuarios y roles"
        descripcion="Quién entra al sistema y con qué rol. Suspender una cuenta revoca sus sesiones al instante, pero no borra su historial de evaluaciones."
      />

      <div className="space-y-8 px-5 py-6 sm:px-8">
        <CrearUsuario />

        <section aria-labelledby="directorio">
          <h2 id="directorio" className="text-base font-semibold text-toga-900">
            Directorio
          </h2>

          <ul className="mt-3 space-y-3 lg:hidden">
            {usuarios.map((u) => (
              <li key={u.id} className="rounded-lg border border-toga-200 bg-white p-4">
                <p className="font-medium text-toga-900">{u.fullName}</p>
                <p className="break-all text-xs text-toga-500">{u.email}</p>
                <p className="mt-2 text-xs text-toga-600">
                  {u.roles.map((r) => ROL_ETIQUETA[r]).join(" + ")}
                </p>
                <div className="mt-2">
                  <EditorRoles id={u.id} nombre={u.fullName} rolesActuales={u.roles} />
                </div>
                <div className="mt-3">
                  <InterruptorUsuario
                    id={u.id}
                    nombre={u.fullName}
                    activo={u.status === "ACTIVE"}
                    esUnoMismo={u.id === usuario.id}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Usuarios con acceso al sistema</caption>
              <thead className="border-b-2 border-toga-300 bg-toga-50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Correo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Roles
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Último acceso
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Acceso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-toga-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className={u.status === "SUSPENDED" ? "bg-toga-50" : ""}>
                    <th scope="row" className="px-4 py-3 text-left font-medium text-toga-900">
                      {u.fullName}
                      {u.mustChangePassword && (
                        <span className="ml-2 rounded bg-balanza-50 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-balanza-700">
                          debe cambiar clave
                        </span>
                      )}
                    </th>
                    <td className="px-4 py-3 text-toga-600">{u.email}</td>
                    <td className="px-4 py-3 text-toga-600">
                      <span className="block">
                        {u.roles.map((r) => ROL_ETIQUETA[r]).join(" + ")}
                      </span>
                      <span className="mt-1 block">
                        <EditorRoles id={u.id} nombre={u.fullName} rolesActuales={u.roles} />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-toga-500">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString("es-VE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "Nunca"}
                    </td>
                    <td className="px-4 py-3">
                      <InterruptorUsuario
                        id={u.id}
                        nombre={u.fullName}
                        activo={u.status === "ACTIVE"}
                        esUnoMismo={u.id === usuario.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
