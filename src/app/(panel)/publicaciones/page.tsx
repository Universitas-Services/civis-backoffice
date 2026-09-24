import type { Metadata } from "next";
import type { SnapshotEnCola } from "@/contracts";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { FichaSnapshot } from "@/components/ficha-snapshot";
import { BotonPrepararRanking } from "@/components/boton-preparar-ranking";
import { PrepararFicha, PublicadosVigentes } from "@/components/publicacion-extra";

export const metadata: Metadata = { title: "Cola de publicación" };

const TIPO: Record<string, string> = {
  CANDIDATE_PROFILE: "Perfil de postulante",
  RANKING: "Ranking público",
  REPORT: "Informe",
};

export default async function Publicaciones() {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN");
  const esSuperAdmin = usuario.roles.includes("SUPER_ADMIN");

  let cola: SnapshotEnCola[];
  try {
    cola = await llamarApi<SnapshotEnCola[]>("/internal/publications/queue");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/publicaciones");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Cola de publicación"
        descripcion="Ésta es la última barrera entre el trabajo interno y el sitio público. Lo publica un superadministrador, aunque haya preparado el snapshot. El motivo sigue siendo obligatorio."
        acciones={<BotonPrepararRanking />}
      />

      <div className="space-y-8 px-5 py-6 sm:px-8">
        <PrepararFicha />

        {cola.length === 0 ? (
          <EstadoVacio
            titulo="No hay nada pendiente de publicar"
            detalle="Cuando se prepare un perfil o un ranking, aparecerá aquí para su aprobación."
          />
        ) : (
          <ul className="space-y-4">
            {cola.map((s) => (
              <li key={s.id}>
                <FichaSnapshot
                  snapshot={s}
                  tipoLegible={TIPO[s.kind] ?? s.kind}
                  loPreparoElMismoUsuario={s.preparedById === usuario.id && !esSuperAdmin}
                />
              </li>
            ))}
          </ul>
        )}

        <PublicadosVigentes />
      </div>
    </>
  );
}
