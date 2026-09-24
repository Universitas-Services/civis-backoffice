/**
 * @deprecated Los datos mock ya no alimentan páginas.
 * Reexporta helpers usados por sidebars; preferir `@/contracts` y `@/lib/adaptar-revision-api`.
 */

export { BLOQUE_ETIQUETA, type BloqueDocumentoId } from "@/lib/maqueta-expediente-documentos";
export { ordenBloquesRevision } from "@/contracts";
export {
  conteoDocsRevision,
  type DocumentoRevision,
  type PostulanteRevision,
  type PostulanteRevisionLista,
  type EstadoVerificacionDoc,
} from "@/lib/adaptar-revision-api";

export type DocumentoRevisionMock = import("@/lib/adaptar-revision-api").DocumentoRevision;
export type PostulanteRevisionMock = import("@/lib/adaptar-revision-api").PostulanteRevision;
export type EstadoVerificacionMock = import("@/lib/adaptar-revision-api").EstadoVerificacionDoc;
