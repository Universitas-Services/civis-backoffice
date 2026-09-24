import type { Metadata } from "next";
import Link from "next/link";
import type { BaremoListado } from "@/contracts";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import {
  AvisoListaBaremo,
  ListaConfiguracionBaremo,
} from "@/components/lista-configuracion-baremo";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";

export const metadata: Metadata = { title: "Crear baremo" };

export default async function ConfiguracionBaremoPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ aviso?: string }>;
}) {
  await exigirRol("SUPER_ADMIN");
  const { aviso } = await searchParams;

  let baremos: readonly BaremoListado[];
  try {
    baremos = await llamarApi<BaremoListado[]>("/internal/baremos");
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver("/baremo/configuracion");
    if (error instanceof ErrorApi) throw error;
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Crear baremo"
        descripcion="Defina el baremo que se aplicará a quienes lleguen a esta fase. Solo uno puede estar activo."
        ruta={[{ href: "/baremo", texto: "Baremo" }, { texto: "Crear baremo" }]}
        acciones={
          <Link
            href="/baremo/configuracion/nuevo"
            className="inline-flex items-center rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Nuevo baremo
          </Link>
        }
      />
      <AvisoListaBaremo aviso={aviso} />
      <div className="px-5 py-6 sm:px-8">
        {baremos.length === 0 ? (
          <EstadoVacio
            titulo="No hay baremos"
            detalle="Cree el primero. Nace inactivo: actívelo cuando tenga al menos un criterio."
          />
        ) : (
          <ListaConfiguracionBaremo baremos={baremos} />
        )}
      </div>
    </>
  );
}
