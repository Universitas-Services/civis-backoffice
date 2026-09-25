import type { Metadata } from "next";
import Link from "next/link";
import type { ObjecionBandeja } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { InterruptorObjeciones } from "@/components/interruptor-objeciones";

export const metadata: Metadata = { title: "Gestión de impugnaciones y objeciones ciudadanas" };

const RESUELTAS = new Set(["RESOLVED_FOUNDED", "RESOLVED_UNFOUNDED", "REJECTED_INADMISSIBLE"]);

interface Respuesta {
  readonly items: readonly ObjecionBandeja[];
  readonly total: number;
  readonly resumen: Record<string, number>;
}

export default async function Objeciones() {
  const usuario = await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");
  const puedeLapso = usuario.roles.some((rol) => rol === "SUPER_ADMIN" || rol === "ADMIN");
  const puedeAjustar = usuario.roles.some((r) => r === "SUPER_ADMIN" || r === "EVALUATOR");

  let datos: Respuesta;
  try {
    datos = await llamarApi<Respuesta>("/internal/objections");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/objeciones");
    throw error;
  }

  const porPostulante = new Map<
    string,
    { nombre: string; sala: string; total: number; abiertas: number }
  >();
  for (const o of datos.items) {
    const actual = porPostulante.get(o.candidate.id) ?? {
      nombre: `${o.candidate.firstName} ${o.candidate.lastName}`,
      sala: SALA_ETIQUETA[o.candidate.chamber] ?? o.candidate.chamber,
      total: 0,
      abiertas: 0,
    };
    actual.total += 1;
    if (!RESUELTAS.has(o.status)) actual.abiertas += 1;
    porPostulante.set(o.candidate.id, actual);
  }

  let lapsoAbierto = false;
  if (puedeLapso) {
    try {
      const portal = await llamarApi<{ objectionsOpen: boolean }>("/public/portal");
      lapsoAbierto = portal.objectionsOpen;
    } catch (error) {
      if (error instanceof NoAutorizado) renovarYVolver("/objeciones");
    }
  }

  return (
    <>
      <CabeceraPagina
        titulo="Gestión de impugnaciones y objeciones ciudadanas"
        descripcion="Revise, gestione y dé seguimiento a los reportes de incompatibilidad e inhabilitación presentados por la ciudadanía durante el lapso legal preclusivo (Art. 71 LOTSJ). Desde este panel podrá activar el botón de objeciones, revisar qué postulados presentan objeciones y cuántas objeciones."
      />

      <div className="px-5 py-6 sm:px-8">
        {puedeLapso && (
          <div className="mb-6">
            <InterruptorObjeciones abierto={lapsoAbierto} />
          </div>
        )}

        {porPostulante.size === 0 ? (
          <EstadoVacio
            titulo="No hay objeciones que mostrar"
            detalle="Las objeciones ciudadanas llegan desde el sitio público y aparecen aquí agrupadas por postulante."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-toga-200 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Postulantes con objeciones</caption>
              <thead className="border-b-2 border-toga-300 bg-toga-50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Postulante
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Sala
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-toga-700">
                    Objeciones
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                    Estado
                  </th>
                  {puedeAjustar && (
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Ajustar</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-toga-100">
                {[...porPostulante.entries()].map(([id, fila]) => (
                  <tr key={id} className="hover:bg-toga-50">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-toga-900">
                      {fila.nombre}
                    </th>
                    <td className="px-4 py-3 text-toga-600">{fila.sala}</td>
                    <td className="cifra px-4 py-3 text-right font-semibold text-toga-900">
                      {fila.total}
                    </td>
                    <td className="px-4 py-3 text-toga-600">
                      {fila.abiertas > 0 ? `${fila.abiertas} abiertas` : "Resueltas"}
                    </td>
                    {puedeAjustar && (
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/objeciones/baremo/${id}`}
                          className="text-sm font-semibold text-balanza-700 hover:text-balanza-600"
                        >
                          Ajustar baremo
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
