import type { Metadata } from "next";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { FormularioNuevoExpedienteMaqueta } from "@/components/expediente-maqueta/formulario-nuevo-expediente";
import { exigirRol } from "@/lib/rutas";

export const metadata: Metadata = { title: "Nuevo expediente" };

export default async function NuevoExpediente() {
  await exigirRol("SUPER_ADMIN", "SECRETARY");

  return (
    <>
      <CabeceraPagina
        titulo="Registrar postulante"
        descripcion="Registre el postulante y cargue documentos de forma individual antes de enviar a revisión."
        ruta={[{ href: "/expedientes", texto: "Expedientes" }, { texto: "Nuevo" }]}
      />
      <div className="px-5 py-6 sm:px-8">
        <FormularioNuevoExpedienteMaqueta />
      </div>
    </>
  );
}
