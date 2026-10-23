"use client";

import { useRouter } from "next/navigation";
import { slotKeyDesdeCategory, type EstadoPostulacion } from "@/contracts";
import { PasoCargaDocumentos } from "@/components/expediente-maqueta/paso-carga-documentos";
import type { ArchivoGuardado } from "@/components/expediente-maqueta/slot-documento-pdf";
import type { SalaMaqueta } from "@/lib/maqueta-expediente-documentos";
import { EnvioConCorreo } from "./envio-con-correo";

/** Documentos ya cargados, por casilla del listado, para reanudar la carga. */
function sembrar(documentos: EstadoPostulacion["documentos"]) {
  const out: Record<string, ArchivoGuardado[]> = {};
  for (const d of documentos) {
    const slot = slotKeyDesdeCategory(d.category) ?? d.category.toLowerCase();
    out[slot] = [...(out[slot] ?? []), { id: d.id, name: d.originalName, size: d.sizeBytes }];
  }
  return out;
}

/**
 * Carga de documentos del propio postulante: el mismo listado que usa la
 * secretaría, con subida por el proxy público y envío con correo verificado.
 */
export function CargaAutopostulacion({ estado }: { readonly estado: EstadoPostulacion }) {
  const router = useRouter();
  const [prefijo, digitos] = estado.nationalId.split("-");
  const [nombre, ...resto] = estado.fullName.split(" ");

  return (
    <PasoCargaDocumentos
      datos={{
        nombre: nombre ?? estado.fullName,
        apellido: resto.join(" "),
        prefijoCedula: prefijo === "E" ? "E" : "V",
        cedulaDigitos: digitos ?? "",
        sala: estado.chamber as SalaMaqueta,
      }}
      salaLabel={estado.chamberLabel}
      submissionId={estado.submissionId ?? ""}
      urlCarga="/api/postulacion/documentos"
      guardadosIniciales={sembrar(estado.documentos)}
      onEnviarRevision={() => undefined}
      accionEnvio={
        <EnvioConCorreo
          fileNumber={estado.fileNumber ?? ""}
          nombre={estado.fullName}
          onEnviado={() => router.refresh()}
        />
      }
    />
  );
}
