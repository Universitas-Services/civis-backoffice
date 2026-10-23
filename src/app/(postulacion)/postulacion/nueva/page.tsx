import type { Metadata } from "next";
import { FormularioAutopostulacion } from "@/components/postulacion/formulario-autopostulacion";

export const metadata: Metadata = { title: "Postularme" };

export default function NuevaPostulacion() {
  return <FormularioAutopostulacion />;
}
