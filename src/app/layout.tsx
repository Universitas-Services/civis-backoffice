import type { Metadata } from "next";
import { mono, sans, serif } from "@/lib/fuentes";
import { APP } from "@/lib/config";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: APP.name, template: `%s · ${APP.name}` },
  description: "Panel interno de verificación de credenciales. Acceso restringido.",
  // El panel jamás debe indexarse.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="es-VE" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a href="#contenido" className="salto-contenido">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
