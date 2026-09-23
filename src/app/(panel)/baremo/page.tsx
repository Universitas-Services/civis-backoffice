import type { Metadata } from "next";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { ListaBaremo } from "@/components/lista-baremo";
import { exigirRol } from "@/lib/rutas";

export const metadata: Metadata = { title: "Baremo" };

export default async function BaremoPage() {
  await exigirRol("SUPER_ADMIN", "ADMIN", "EVALUATOR");

  return (
    <>
      <CabeceraPagina
        titulo="Baremo"
        descripcion="Postulantes declarados elegibles en el Paso 1, listos para la matriz de puntuación."
      />
      <div className="px-5 py-6 sm:px-8">
        <ListaBaremo />
      </div>
    </>
  );
}
