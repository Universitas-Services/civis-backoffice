import type { Metadata } from "next";
import { FormularioReanudar } from "@/components/postulacion/formulario-reanudar";

export const metadata: Metadata = { title: "Reanudar mi postulación" };

export default function ReanudarPostulacion() {
  return <FormularioReanudar />;
}
