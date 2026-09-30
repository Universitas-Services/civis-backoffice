import Link from "next/link";
import type { Metadata } from "next";
import type { Chamber, ExpedienteListado, RondaEscaladaLista, WorkflowStatus } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import {
  decisionDesdeFichaApi,
  type DecisionElegibilidad,
  type FichaElegibilidadApi,
} from "@/lib/elegibilidad";
import { listarRondasEscaladas } from "@/app/(panel)/comite/acciones";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { BandejaEvaluacionTabs } from "@/components/bandeja-evaluacion-tabs";

export const metadata: Metadata = { title: "Evaluación" };

interface Bandeja {
  readonly pendientes: readonly {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly chamber: Chamber;
    readonly workflowStatus: WorkflowStatus;
    readonly receivedAt: string;
    readonly submissions: readonly {
      readonly fileNumber: string;
      readonly _count: { readonly documents: number };
    }[];
    readonly _count: { readonly objections: number };
    readonly reopenedReason?: "TIE" | "DEADLINE" | null;
  }[];
  readonly misEvaluaciones: readonly {
    readonly id: string;
    readonly status: string;
    readonly totalPoints: string;
    readonly candidate: {
      readonly id: string;
      readonly firstName: string;
      readonly lastName: string;
    };
  }[];
  readonly bloqueadoSinComite?: boolean;
}

export default async function BandejaEvaluacion() {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");
  const puedeResolverEscaladas = usuario.roles.some(
    (r) => r === "SUPER_ADMIN" || r === "ADMIN",
  );

  let bandeja: Bandeja;
  let inelegibles: DecisionElegibilidad[];
  let escaladas: readonly RondaEscaladaLista[] = [];
  try {
    bandeja = await llamarApi<Bandeja>("/internal/evaluations/inbox");
    const descalificados = await llamarApi<{ readonly items: readonly ExpedienteListado[] }>(
      "/internal/candidates?estado=DISQUALIFIED&pageSize=100",
    );
    const fichas = await Promise.all(
      descalificados.items.map(async (candidato) => {
        try {
          const ficha = await llamarApi<FichaElegibilidadApi | null>(
            `/internal/evaluations/candidate/${candidato.id}/eligibility`,
          );
          return decisionDesdeFichaApi(candidato, ficha);
        } catch (error) {
          if (error instanceof NoAutorizado) throw error;
          return decisionDesdeFichaApi(candidato, null);
        }
      }),
    );
    inelegibles = fichas;
    if (puedeResolverEscaladas) {
      escaladas = await listarRondasEscaladas();
    }
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/evaluacion");
    throw error;
  }

  const conObjeciones = bandeja.pendientes.filter((c) => c._count.objections > 0);

  return (
    <>
      <CabeceraPagina
        titulo="Evaluación"
        descripcion="Paso 1: elegibilidad de postulantes que pasaron la revisión documental. Quienes resulten elegibles continúan en Baremo."
      />

      <div className="space-y-6 px-5 py-6 sm:px-8">
        {bandeja.bloqueadoSinComite ? (
          <div className="rounded-lg border border-balanza-600/25 bg-balanza-50 p-5 text-sm text-toga-800">
            <p className="font-semibold text-toga-900">No está activo en el comité</p>
            <p className="mt-1 leading-relaxed">
              Solo los evaluadores marcados como activos en comité pueden evaluar. Pida a un
              administrador que lo incluya en Usuarios.
            </p>
          </div>
        ) : null}
        {conObjeciones.length > 0 && (
          <section
            aria-labelledby="alertas"
            className="rounded-lg border border-balanza-600/25 bg-balanza-50 p-5"
          >
            <h2 id="alertas" className="text-sm font-semibold text-toga-900">
              <span aria-hidden="true" className="mr-1.5">
                ⚑
              </span>
              {conObjeciones.length}{" "}
              {conObjeciones.length === 1 ? "expediente tiene" : "expedientes tienen"} objeciones
              ciudadanas
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-toga-700">
              Revise la objeción antes de emitir la calificación. Una objeción no cambia el
              puntaje por sí sola: requiere resolución motivada y aprobada.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {conObjeciones.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/objeciones?candidato=${c.id}`}
                    className="inline-flex items-center gap-2 rounded-md border border-balanza-600/30 bg-white px-3 py-1.5 text-sm text-toga-800 hover:bg-toga-50"
                  >
                    {c.firstName} {c.lastName}
                    <span className="cifra rounded-full bg-balanza-600 px-1.5 text-xs font-semibold text-white">
                      {c._count.objections}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <BandejaEvaluacionTabs
          pendientes={bandeja.pendientes}
          inelegibles={inelegibles}
          escaladas={escaladas}
          puedeResolverEscaladas={puedeResolverEscaladas}
        />
      </div>
    </>
  );
}
