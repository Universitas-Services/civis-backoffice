import type { Metadata } from "next";
import Link from "next/link";
import type { AjustesPortal } from "@/contracts";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { FormularioNuevoExpedienteMaqueta } from "@/components/expediente-maqueta/formulario-nuevo-expediente";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";

export const metadata: Metadata = { title: "Nuevo expediente" };

export default async function NuevoExpediente() {
  await exigirRol("SUPER_ADMIN", "SECRETARY");

  let ajustes: AjustesPortal;
  try {
    ajustes = await llamarApi<AjustesPortal>("/internal/portal");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/expedientes/nuevo");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Registrar postulante"
        descripcion="Registre el postulante y cargue documentos de forma individual antes de enviar a revisión."
        ruta={[{ href: "/expedientes", texto: "Expedientes" }, { texto: "Nuevo" }]}
      />
      <div className="px-5 py-6 sm:px-8">
        {ajustes.applicationsClosed ? (
          <div className="max-w-2xl rounded-lg border border-toga-200 bg-white p-5">
            <h2 className="text-base font-semibold text-toga-900">
              El periodo de postulaciones está cerrado
            </h2>
            <p className="mt-2 text-base leading-relaxed text-toga-600">
              Ya no se registran postulantes nuevos ni se envía un expediente a revisión por primera
              vez. Los expedientes que la revisión devolvió sí se pueden corregir y reenviar desde{" "}
              <Link
                href="/expedientes"
                className="font-semibold text-balanza-700 hover:text-balanza-600"
              >
                Expedientes
              </Link>
              .
            </p>
          </div>
        ) : (
          <FormularioNuevoExpedienteMaqueta />
        )}
      </div>
    </>
  );
}
