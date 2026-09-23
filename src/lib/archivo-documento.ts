/**
 * Tipos de archivo admitidos en la carga documental del panel.
 * La API valida el contenido real; esto solo filtra en el cliente.
 */

export const ACCEPT_ARCHIVO_DOCUMENTO =
  "application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp";

const TIPOS_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXT_OK = /\.(pdf|jpe?g|png|webp)$/i;

export function esArchivoDocumentoPermitido(file: File): boolean {
  if (TIPOS_MIME.has(file.type)) return true;
  // Algunos navegadores dejan type vacío; validar por extensión.
  return EXT_OK.test(file.name);
}

export const TEXTO_FORMATOS_DOCUMENTO =
  "PDF o imagen (JPEG, PNG, WEBP). La API valida el contenido del archivo.";
