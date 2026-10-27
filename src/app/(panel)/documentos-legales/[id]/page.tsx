import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TITULO_DOCUMENTO_LEGAL, type DocumentoLegal } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { fechaHora } from "@/lib/plazos";
import { CabeceraPagina } from "@/components/cabecera-pagina";
import { TextoLegal } from "@/components/legal/texto-legal";
import { EditorLegal } from "@/components/legal/editor-legal";

export const metadata: Metadata = { title: "Documento legal" };

const ESTADO: Record<DocumentoLegal["status"], { texto: string; clase: string }> = {
  BORRADOR: { texto: "Borrador", clase: "bg-oro-viejo/15 text-toga-800" },
  VIGENTE: { texto: "Vigente", clase: "bg-validado-50 text-validado-700" },
  REEMPLAZADO: { texto: "Reemplazada", clase: "bg-toga-100 text-toga-600" },
};

export default async function DocumentoLegalPagina({
  params,
  searchParams,
}: {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<{ publicado?: string }>;
}) {
  await exigirRol("SUPER_ADMIN");
  const { id } = await params;
  const { publicado } = await searchParams;

  let doc: DocumentoLegal;
  try {
    doc = await llamarApi<DocumentoLegal>(`/internal/legal/${id}`);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver(`/documentos-legales/${id}`);
    if (error instanceof ErrorApi && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const tipo = TITULO_DOCUMENTO_LEGAL[doc.kind];
  const estado = ESTADO[doc.status];
  const ruta = [
    { href: "/documentos-legales", texto: "Documentos legales" },
    { texto: `${tipo} · versión ${doc.version}` },
  ];

  if (doc.status === "BORRADOR") {
    return (
      <>
        <CabeceraPagina
          titulo={`${tipo}: versión ${doc.version} (borrador)`}
          descripcion="Edite el texto y revíselo en la vista previa. Al publicar pasa a ser la versión vigente: los nuevos postulantes la aceptarán al registrarse y los que ya tienen cuenta, al ingresar."
          ruta={ruta}
        />
        <div className="px-5 py-6 sm:px-8">
          <EditorLegal documento={doc} />
        </div>
      </>
    );
  }

  return (
    <>
      <CabeceraPagina titulo={doc.title} descripcion={tipo} ruta={ruta} />
      <div className="grid gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="order-2 rounded-lg border border-toga-200 bg-white p-5 sm:p-6 xl:order-1">
          {publicado && doc.status === "VIGENTE" && (
            <p
              role="status"
              className="mb-4 rounded-md border border-validado-700/20 bg-validado-50 px-3 py-2 text-sm text-validado-700"
            >
              Versión {doc.version} publicada. Ya es la que aceptan los postulantes.
            </p>
          )}
          <TextoLegal contenido={doc.content} />
        </div>
        <aside className="order-1 xl:order-2">
          <dl className="space-y-3 rounded-lg border border-toga-200 bg-white p-4 text-sm">
            <div>
              <dt className="text-xs text-toga-500">Estado</dt>
              <dd className="mt-1">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.clase}`}
                >
                  {estado.texto}
                </span>
              </dd>
            </div>
            <Fila termino="Versión" valor={String(doc.version)} />
            {doc.publishedAt && (
              <Fila termino="Publicada y vigente desde" valor={fechaHora(doc.publishedAt)} />
            )}
            <Fila termino="Última actualización" valor={fechaHora(doc.updatedAt)} />
            <Fila termino="Publicada por" valor={doc.publishedBy?.fullName ?? "Carga inicial"} />
            <Fila termino="Aceptaciones" valor={String(doc._count.acceptances)} />
            {doc.changeSummary && <Fila termino="Resumen de cambios" valor={doc.changeSummary} />}
            {doc.sha256 && (
              <div>
                <dt className="text-xs text-toga-500">Huella SHA-256 del texto</dt>
                <dd className="codigo mt-0.5 break-all text-xs text-toga-800">{doc.sha256}</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </>
  );
}

function Fila({ termino, valor }: { readonly termino: string; readonly valor: string }) {
  return (
    <div>
      <dt className="text-xs text-toga-500">{termino}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-toga-900">{valor}</dd>
    </div>
  );
}
