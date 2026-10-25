import type { Metadata } from "next";
import { TarjetaAcceso } from "@/components/tarjeta-acceso";
import { FormularioPedirCodigo } from "@/components/formularios-recuperar";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function Recuperar() {
  return (
    <TarjetaAcceso
      titulo="Recuperar contraseña"
      descripcion="Le enviaremos un código de 6 dígitos al correo de su cuenta."
    >
      <FormularioPedirCodigo />
    </TarjetaAcceso>
  );
}
