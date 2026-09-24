import type { Metadata } from "next";
import type { BaremoDetalle, ExpedienteListado, ResultadoRanking } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import { BaremoConsultaTabs } from "@/components/baremo-consulta-tabs";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import type { FilaBaremo } from "@/components/lista-baremo";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";

export const metadata: Metadata = { title: "Baremo" };

export default async function BaremoPage() {
  await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");

  let activo: BaremoDetalle | null;
  let items: readonly FilaBaremo[];
  try {
    const [baremo, enCurso, evaluados, ranking] = await Promise.all([
      llamarApi<BaremoDetalle | null>("/internal/baremos/active"),
      llamarApi<{ readonly items: readonly ExpedienteListado[] }>(
        "/internal/candidates?estado=EVALUATION_IN_PROGRESS&elegible=true&pageSize=100",
      ),
      llamarApi<{ readonly items: readonly ExpedienteListado[] }>(
        "/internal/candidates?estado=EVALUATED&elegible=true&pageSize=100",
      ),
      llamarApi<ResultadoRanking>("/internal/ranking").catch((error: unknown) => {
        if (error instanceof NoAutorizado) throw error;
        return { entries: [] } satisfies Pick<ResultadoRanking, "entries">;
      }),
    ]);
    const puesto = new Map(ranking.entries.map((e) => [e.publicId, e.position]));
    activo = baremo;
    const vistos = new Set<string>();
    const combinados = [...enCurso.items, ...evaluados.items].sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );
    items = combinados.flatMap((c) => {
      if (vistos.has(c.id)) return [];
      vistos.add(c.id);
      return [
        {
          candidateId: c.id,
          fileNumber: c.submissions[0]?.fileNumber ?? "—",
          postulanteNombre: `${c.firstName} ${c.lastName}`,
          salaLabel: SALA_ETIQUETA[c.chamber] ?? String(c.chamber),
          ranking: puesto.get(c.publicId) ?? null,
        },
      ];
    });
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/baremo");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Baremo"
        descripcion="Postulantes ya declarados elegibles. El baremo en vigor se consulta en la otra pestaña."
      />
      <div className="px-5 py-6 sm:px-8">
        <BaremoConsultaTabs items={items} baremo={activo} />
      </div>
    </>
  );
}
