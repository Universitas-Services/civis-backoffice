"use client";

import type { AjustesPortal, Role, UsuarioDirectorio } from "@/contracts";
import { etiquetaRol } from "@/contracts";
import { CrearUsuario, EditorRoles, InterruptorUsuario } from "@/components/gestion-usuarios";
import {
  ConfiguracionEvaluacion,
  InterruptorComite,
} from "@/components/configuracion-evaluacion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Usuarios: directorio primero; modalidad de evaluación en pestaña aparte.
 */
export function UsuariosTabs({
  directorio,
  rolesActor,
  usuarioId,
  ajustes,
  esSuperAdmin,
}: {
  readonly directorio: readonly UsuarioDirectorio[];
  readonly rolesActor: readonly Role[];
  readonly usuarioId: string;
  readonly ajustes: AjustesPortal;
  readonly esSuperAdmin: boolean;
}) {
  const modoComite = ajustes.evaluationMode === "COMMITTEE";

  return (
    <Tabs defaultValue="usuarios" className="w-full">
      <TabsList aria-label="Usuarios y modalidad" className="w-full sm:w-auto">
        <TabsTrigger value="usuarios" className="flex-1 sm:flex-none">
          Usuarios
          <span className="cifra ml-1.5 text-xs text-toga-500">({directorio.length})</span>
        </TabsTrigger>
        <TabsTrigger value="modalidad" className="flex-1 sm:flex-none">
          Modalidad de evaluación
        </TabsTrigger>
      </TabsList>

      <TabsContent value="usuarios" className="space-y-6">
        <CrearUsuario rolesActor={rolesActor} />

        <section aria-labelledby="directorio">
          <h2 id="directorio" className="text-base font-semibold text-toga-900">
            Directorio
          </h2>
          <p className="mt-1 text-sm text-toga-600">
            Solo los evaluadores activos en comité pueden evaluar (individual o comité). Tope{" "}
            <span className="cifra font-medium text-toga-800">{ajustes.maxActiveEvaluators}</span>
            {modoComite ? (
              <>
                . Quorum:{" "}
                <span className="cifra font-medium text-toga-800">{ajustes.quorumThreshold}</span>.
              </>
            ) : (
              "."
            )}
          </p>

          <ul className="mt-3 space-y-3 lg:hidden">
            {directorio.map((u) => (
              <li key={u.id} className="rounded-lg border border-toga-200 bg-white p-4">
                <p className="font-medium text-toga-900">{u.fullName}</p>
                <p className="break-all text-xs text-toga-500">{u.email}</p>
                <p className="mt-2 text-xs text-toga-600">
                  {u.roles.map((r) => etiquetaRol(r)).join(" + ")}
                </p>
                <div className="mt-2">
                  <EditorRoles
                    id={u.id}
                    nombre={u.fullName}
                    rolesActuales={u.roles}
                    rolesActor={rolesActor}
                    esUnoMismo={u.id === usuarioId}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <InterruptorUsuario
                    id={u.id}
                    nombre={u.fullName}
                    activo={u.status === "ACTIVE"}
                    esUnoMismo={u.id === usuarioId}
                  />
                  <InterruptorComite
                    id={u.id}
                    nombre={u.fullName}
                    enComite={u.committeeActive === true}
                    esEvaluador={u.roles.includes("EVALUATOR")}
                    cuentaActiva={u.status === "ACTIVE"}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
            <table className="w-full text-center text-sm">
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
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Comité
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-toga-100">
                {directorio.map((u) => (
                  <tr key={u.id} className={u.status === "SUSPENDED" ? "bg-toga-50" : ""}>
                    <th scope="row" className="px-4 py-3 font-medium text-toga-900">
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
                        {u.roles.map((r) => etiquetaRol(r)).join(" + ")}
                      </span>
                      <span className="mt-1 block">
                        <EditorRoles
                          id={u.id}
                          nombre={u.fullName}
                          rolesActuales={u.roles}
                          rolesActor={rolesActor}
                          esUnoMismo={u.id === usuarioId}
                        />
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
                        esUnoMismo={u.id === usuarioId}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <InterruptorComite
                        id={u.id}
                        nombre={u.fullName}
                        enComite={u.committeeActive === true}
                        esEvaluador={u.roles.includes("EVALUATOR")}
                        cuentaActiva={u.status === "ACTIVE"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </TabsContent>

      <TabsContent value="modalidad">
        <ConfiguracionEvaluacion ajustes={ajustes} esSuperAdmin={esSuperAdmin} />
      </TabsContent>
    </Tabs>
  );
}
