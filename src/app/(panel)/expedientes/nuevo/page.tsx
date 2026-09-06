import type { Metadata } from "next";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { Wizard } from "@/components/wizard";

export const metadata: Metadata = { title: "Nuevo expediente" };

export default function NuevoExpediente() {
  return (
    <>
      <CabeceraPagina
        titulo="Registrar postulante"
        descripcion="Tres pasos: identificación, carga de documentos y revisión. El expediente se abre al completar el primer paso."
        ruta={[{ href: "/expedientes", texto: "Expedientes" }, { texto: "Nuevo" }]}
      />
      <div className="px-5 py-6 sm:px-8">
        <Wizard />
      </div>
    </>
  );
}
