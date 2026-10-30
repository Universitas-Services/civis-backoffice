import type { Metadata } from "next";
import Link from "next/link";
import type { MiObjecion, SituacionMiObjecion } from "@/contracts";
import { SITUACION_MI_OBJECION } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { ListaMisObjeciones } from "@/components/lista-mis-objeciones";

export const metadata: Metadata = { title: "Mis objeciones" };

const ORDEN: readonly SituacionMiObjecion[] = [
  "EN_COMITE",
  "ADMITIDA",
  "INADMITIDA",
  "CON_LUGAR",
  "SIN_LUGAR",
];

/**
 * Las objeciones que presentó el visualizador, a todos los postulantes, con
 * su situación y los autos que ya se le notificaron.
 */
export default async function MisObjeciones() {
  await exigirRol("VIEWER");

  let objeciones: MiObjecion[];
  try {
    objeciones = await llamarApi<MiObjecion[]>("/internal/objections/mine");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/mis-objeciones");
    throw error;
  }

  const conteo = ORDEN.map((s) => [s, objeciones.filter((o) => o.situacion === s).length] as const)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n} ${SITUACION_MI_OBJECION[s].toLowerCase()}`);

  return (
    <>
      <CabeceraPagina
        titulo="Mis objeciones"
        descripcion="Las objeciones que usted presentó. El comité se pronuncia sobre su admisión al terminar el lapso de objeciones; cuando se le notifica, aquí verá si fue admitida (con su auto) o inadmitida (con el motivo), y después la decisión final."
        meta={
          objeciones.length > 0 ? (
            <p className="text-sm text-toga-600">
              <span className="cifra font-semibold text-toga-900">{objeciones.length}</span>{" "}
              {objeciones.length === 1 ? "objeción" : "objeciones"} · {conteo.join(" · ")}
            </p>
          ) : undefined
        }
      />
      <div className="px-5 py-6 sm:px-8">
        {objeciones.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no ha presentado objeciones"
            detalle="Puede objetar desde la ficha de un postulante en el ranking interno, mientras el lapso de objeciones esté abierto."
            accion={
              <Link
                href="/ranking"
                className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
              >
                Ir al ranking interno
              </Link>
            }
          />
        ) : (
          <ListaMisObjeciones objeciones={objeciones} />
        )}
      </div>
    </>
  );
}
