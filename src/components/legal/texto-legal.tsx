import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Texto de un documento legal en Markdown (con tablas). El mismo estilo en la
 * vista de lectura y en la vista previa del editor.
 */
export function TextoLegal({ contenido }: { readonly contenido: string }) {
  return (
    <article className="prosa text-sm leading-relaxed text-toga-800 [&_a]:text-balanza-700 [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-institucional [&_h2]:text-lg [&_h2]:text-toga-900 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-balanza-700 [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-toga-900 [&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_td]:border [&_td]:border-toga-200 [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top [&_th]:border [&_th]:border-toga-200 [&_th]:bg-toga-50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenido}</ReactMarkdown>
    </article>
  );
}
