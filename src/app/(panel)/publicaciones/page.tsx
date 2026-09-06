import type { Metadata } from "next";
import type { SnapshotEnCola } from "@/contracts";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { llamarApi, NoAutorizado } from "@/lib/api";
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
  const usuario = await exigirRol("SUPER_ADMIN", "PUBLISHER");

  let cola: SnapshotEnCola[];
  try {
    cola = await llamarApi<SnapshotEnCola[]>("/internal/publications/queue");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/publicaciones");
    throw error;
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-toga-900">
            Cola de publicación
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-toga-600">
            Ésta es la última barrera entre el trabajo interno y el sitio público. Cada snapshot
            debe aprobarlo una persona <strong>distinta</strong> a quien lo preparó.
          </p>
        </div>
        <BotonPrepararRanking />
      </div>

      <div className="mt-6">
        <PrepararFicha />
      </div>

      {cola.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-toga-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-toga-700">No hay nada pendiente de publicar</p>
          <p className="mt-1.5 text-sm text-toga-500">
            Cuando se prepare un perfil o un ranking, aparecerá aquí para su aprobación.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {cola.map((s) => (
            <li key={s.id}>
              <FichaSnapshot
                snapshot={s}
                tipoLegible={TIPO[s.kind] ?? s.kind}
                loPreparoElMismoUsuario={s.preparedById === usuario.id}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <PublicadosVigentes />
      </div>
    </div>
  );
}
