import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BarraLateral } from "@/components/barra-lateral";
import { ToastProvider } from "@/components/toast-provider";
import { accessNecesitaRenovacion } from "@/lib/auth-refresh";
import { usuarioActual } from "@/lib/sesion";

export default async function PanelLayout({ children }: { readonly children: React.ReactNode }) {
  // Renovar en Route Handler: el layout no puede escribir cookies.
  if (await accessNecesitaRenovacion()) {
    const pathname = (await headers()).get("x-pathname") ?? "/inicio";
    const volver =
      pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/inicio";
    redirect(`/api/sesion/renovar?volver=${encodeURIComponent(volver)}`);
  }

  const usuario = await usuarioActual();
  // El proxy ya filtró por cookie; esto cubre el caso de cookie inválida.
  if (!usuario) redirect("/login");

  // El permiso por rol lo comprueba cada página con `exigirRol`, no aquí:
  // Next renderiza layout y página en paralelo, y una decisión tomada en el
  // layout llega tarde para impedir que la página ya haya pedido sus datos.

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col md:flex-row">
        <BarraLateral usuario={usuario} />
        <main id="contenido" className="min-w-0 flex-1 bg-toga-50">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
