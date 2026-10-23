import Image from "next/image";
import Link from "next/link";
import { ToastProvider } from "@/components/toast-provider";

/**
 * Autopostulación: pantallas públicas (sin sesión del panel). Misma
 * identidad que el ingreso, con espacio para formularios largos.
 */
export default function LayoutPostulacion({ children }: { readonly children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-toga-50">
        <header className="bg-toga-900">
          <div className="h-1.5 bg-gradient-to-r from-balanza-600 via-balanza-600 to-toga-800" />
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/login" className="flex items-center gap-3">
              <Image
                src="/brand/logo-horiz-slogan-blanco.png"
                alt="CIVIS — Consejo Independiente de Verificación de Credenciales"
                width={280}
                height={72}
                className="h-11 w-auto object-contain"
                priority
              />
            </Link>
            <span className="text-sm text-toga-200">Postulación al TSJ</span>
          </div>
        </header>
        <main id="contenido" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
