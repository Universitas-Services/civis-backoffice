import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TarjetaAcceso } from "@/components/tarjeta-acceso";
import { FormularioRestablecer } from "@/components/formularios-recuperar";
import { ToastProvider } from "@/components/toast-provider";
import { correoPendiente, enmascararCorreo } from "@/lib/correo-pendiente";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function RestablecerContrasena() {
  const correo = await correoPendiente();
  if (!correo) redirect("/recuperar");
  return (
    <ToastProvider>
      <TarjetaAcceso
        titulo="Nueva contraseña"
        descripcion={`Si ${enmascararCorreo(correo)} tiene cuenta, le llegó un código. Vence en 10 minutos.`}
        pie="Al guardarla se cerrarán todas sus sesiones abiertas."
      >
        <FormularioRestablecer />
      </TarjetaAcceso>
    </ToastProvider>
  );
}
