import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { BaremoDetalle } from "@/contracts";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { EditorBaremo } from "@/components/editor-baremo";
import { formularioDesdeDetalle } from "@/lib/formulario-baremo";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";

export const metadata: Metadata = { title: "Editar baremo" };

export default async function EditarBaremoPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await exigirRol("SUPER_ADMIN");
  const { id } = await params;

  let baremo: BaremoDetalle;
  try {
    baremo = await llamarApi<BaremoDetalle>(`/internal/baremos/${id}`);
  } catch (error) {
    if (error instanceof NoAutorizado) renovarYVolver(`/baremo/configuracion/${id}`);
    if (error instanceof ErrorApi && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo={baremo.title}
        descripcion="Al guardar vuelve al listado. Desde ahí se activa."
        ruta={[
          { href: "/baremo", texto: "Baremo" },
          { href: "/baremo/configuracion", texto: "Crear baremo" },
          { texto: baremo.title },
        ]}
      />
      <div className="px-5 py-6 sm:px-8">
        <EditorBaremo
          baremoId={baremo.id}
          inicial={formularioDesdeDetalle(baremo)}
          activo={baremo.active}
        />
      </div>
    </>
  );
}
