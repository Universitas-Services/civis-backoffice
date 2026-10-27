import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { PanelLegal, VersionLegal } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { fechaHora } from "@/lib/plazos";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { BotonNuevaVersion } from "@/components/legal/boton-nueva-version";

export const metadata: Metadata = { title: "Documentos legales" };

/**
 * Términos y Condiciones y Política de Privacidad. Sólo superadministración:
 * ver la versión vigente, crear o actualizar (nueva versión) y el historial.
 */
export default async function DocumentosLegales() {
  await exigirRol("SUPER_ADMIN");

  let panel: PanelLegal[];
  try {
    panel = await llamarApi<PanelLegal[]>("/internal/legal");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/documentos-legales");
    throw error;
  }

  return (
    <>
      <CabeceraPagina
        titulo="Documentos legales"
        descripcion="Términos y Condiciones y Política de Privacidad que aceptan los postulantes al registrarse. Una versión publicada no se modifica: actualizar es publicar la siguiente, y quienes ya tienen cuenta deberán aceptarla al ingresar."
      />
      <div className="grid gap-6 px-5 py-6 sm:px-8 xl:grid-cols-2">
        {panel.map((p) => (
          <TarjetaDocumento key={p.kind} panel={p} />
        ))}
      </div>
    </>
  );
}

function TarjetaDocumento({ panel }: { readonly panel: PanelLegal }) {
  const { vigente, borrador, historial } = panel;
  return (
    <section
      aria-labelledby={`titulo-${panel.kind}`}
      className="flex flex-col rounded-lg border border-toga-200 bg-white"
    >
      <header className="flex items-start justify-between gap-3 border-b border-toga-100 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-balanza-700" aria-hidden="true" />
          <div>
            <h2 id={`titulo-${panel.kind}`} className="font-semibold text-toga-900">
              {panel.titulo}
            </h2>
            {vigente ? (
              <p className="mt-0.5 text-sm text-toga-600">
                Versión vigente{" "}
                <span className="cifra font-semibold text-toga-900">{vigente.version}</span> · desde
                el {fechaHora(vigente.publishedAt!)}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-balanza-700">
                Sin versión publicada: el registro de postulantes no está disponible.
              </p>
            )}
          </div>
        </div>
      </header>

      {vigente && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm sm:p-5">
          <Dato termino="Publicada por" valor={vigente.publishedBy?.fullName ?? "Carga inicial"} />
          <Dato
            termino="Aceptaciones"
            valor={<span className="cifra">{vigente._count.acceptances}</span>}
          />
          <Dato termino="Última actualización" valor={fechaHora(vigente.updatedAt)} />
          <Dato
            termino="Huella SHA-256"
            valor={
              <span className="codigo block truncate text-xs" title={vigente.sha256 ?? ""}>
                {vigente.sha256?.slice(0, 16)}…
              </span>
            }
          />
        </dl>
      )}

      <div className="flex flex-wrap gap-2 border-t border-toga-100 p-4 sm:px-5">
        {vigente && (
          <Link
            href={`/documentos-legales/${vigente.id}`}
            className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
          >
            Ver vigente
          </Link>
        )}
        {borrador ? (
          <Link
            href={`/documentos-legales/${borrador.id}`}
            className="rounded-md bg-balanza-600 px-3 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Continuar borrador (versión {borrador.version})
          </Link>
        ) : (
          <BotonNuevaVersion
            kind={panel.kind}
            texto={vigente ? "Actualizar (nueva versión)" : "Crear"}
          />
        )}
      </div>

      {historial.length > 0 && (
        <div className="border-t border-toga-100 p-4 sm:p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-toga-500">
            Historial de versiones
          </h3>
          <ul className="mt-2 divide-y divide-toga-100">
            {historial.map((v) => (
              <FilaHistorial key={v.id} version={v} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Dato({ termino, valor }: { readonly termino: string; readonly valor: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-toga-500">{termino}</dt>
      <dd className="mt-0.5 text-toga-900">{valor}</dd>
    </div>
  );
}

function FilaHistorial({ version }: { readonly version: VersionLegal }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
      <div className="min-w-0">
        <Link
          href={`/documentos-legales/${version.id}`}
          className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
        >
          Versión {version.version}
        </Link>
        <span className="ml-2 text-xs text-toga-500">
          {version.publishedAt ? fechaHora(version.publishedAt) : ""}
        </span>
        {version.changeSummary && (
          <p className="mt-0.5 line-clamp-1 text-xs text-toga-600">{version.changeSummary}</p>
        )}
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          version.status === "VIGENTE"
            ? "bg-validado-50 text-validado-700"
            : "bg-toga-100 text-toga-600"
        }`}
      >
        {version.status === "VIGENTE" ? "Vigente" : "Reemplazada"} ·{" "}
        <span className="cifra">{version._count.acceptances}</span> aceptaciones
      </span>
    </li>
  );
}
