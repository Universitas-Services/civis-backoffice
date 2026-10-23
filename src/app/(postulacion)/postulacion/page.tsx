import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { slotKeyDesdeCategory, type EstadoPostulacion } from "@/contracts";
import { ErrorApi } from "@/lib/api";
import { leerCodigo, llamarPostulacion } from "@/lib/postulacion";
import { construirSlotsVisibles } from "@/lib/maqueta-expediente-documentos";
import { CargaAutopostulacion } from "@/components/postulacion/carga-autopostulacion";
import { salirPostulacion } from "./acciones";

export const metadata: Metadata = { title: "Mi postulación" };

function fecha(iso: string) {
  return new Date(iso).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" });
}

function BotonSalir() {
  return (
    <form action={salirPostulacion}>
      <button
        type="submit"
        className="rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50"
      >
        Salir
      </button>
    </form>
  );
}

/**
 * Postulación en curso. Con el código guardado en la cookie: si el
 * expediente admite cargas, el listado de documentos; si ya se envió, el
 * estado en solo lectura.
 */
export default async function MiPostulacion() {
  if (!(await leerCodigo())) redirect("/postulacion/reanudar");

  let estado: EstadoPostulacion;
  try {
    estado = await llamarPostulacion<EstadoPostulacion>("/actual", { conCodigo: true });
  } catch (error) {
    const caido = !(error instanceof ErrorApi) || error.status >= 500;
    return (
      <div className="mx-auto max-w-md rounded-xl border border-toga-200 bg-white p-6 text-center">
        <p className="text-sm font-medium text-toga-800">
          {caido
            ? "El servicio no está disponible en este momento."
            : "No encontramos su postulación."}
        </p>
        <p className="mt-1 text-sm text-toga-500">
          {caido ? "Intente de nuevo en unos minutos." : "Vuelva a entrar con su código de acceso."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link
            href="/postulacion/reanudar"
            className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Escribir mi código
          </Link>
          <BotonSalir />
        </div>
      </div>
    );
  }

  const titulos = new Map(construirSlotsVisibles().map((s) => [s.slotKey, s.titulo]));
  const tituloDe = (category: string) =>
    titulos.get(slotKeyDesdeCategory(category) ?? "") ?? category;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-toga-200 bg-white px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs text-toga-500">Mi postulación</p>
          <h1 className="text-xl font-semibold text-toga-900">{estado.fullName}</h1>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div>
              <dt className="inline text-toga-500">Expediente </dt>
              <dd className="codigo inline font-semibold text-toga-900">{estado.fileNumber}</dd>
            </div>
            <div>
              <dt className="inline text-toga-500">Sala </dt>
              <dd className="inline text-toga-900">{estado.chamberLabel}</dd>
            </div>
            <div>
              <dt className="inline text-toga-500">Seguimiento </dt>
              <dd className="inline font-semibold text-balanza-700">{estado.etapa}</dd>
            </div>
          </dl>
        </div>
        <BotonSalir />
      </div>

      {estado.puedeCargar ? (
        <CargaAutopostulacion estado={estado} />
      ) : (
        <section
          aria-labelledby="titulo-enviado"
          className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6"
        >
          <h2 id="titulo-enviado" className="text-base font-semibold text-toga-900">
            Expediente enviado
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-toga-600">
            {estado.enviadoEl ? `Lo envió a revisión el ${fecha(estado.enviadoEl)} ` : ""}
            Ya no se pueden cargar ni cambiar documentos desde aquí. Si la revisión encuentra algo
            que corregir, la secretaría del Consejo se pondrá en contacto con usted.
          </p>
          <h3 className="mt-5 text-sm font-semibold text-toga-900">
            Documentos enviados ({estado.documentos.length})
          </h3>
          <ul className="mt-2 divide-y divide-toga-100 rounded-md border border-toga-200 text-sm">
            {estado.documentos.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
              >
                <span className="text-toga-800">{tituloDe(d.category)}</span>
                <span className="text-xs text-toga-500">
                  {d.originalName} · {fecha(d.uploadedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
