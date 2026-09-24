import type { Metadata } from "next";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { EditorBaremo } from "@/components/editor-baremo";
import { exigirRol } from "@/lib/rutas";

export const metadata: Metadata = { title: "Nuevo baremo" };

export default async function NuevoBaremoPage() {
  await exigirRol("SUPER_ADMIN");

  return (
    <>
      <CabeceraPagina
        titulo="Nuevo baremo"
        descripcion="Queda inactivo. Cuando tenga criterios, se activa desde el listado."
        ruta={[
          { href: "/baremo", texto: "Baremo" },
          { href: "/baremo/configuracion", texto: "Crear baremo" },
          { texto: "Nuevo" },
        ]}
      />
      <div className="px-5 py-6 sm:px-8">
        <EditorBaremo />
      </div>
    </>
  );
}
