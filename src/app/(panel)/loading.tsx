/**
 * Esqueleto mientras carga una pantalla del panel.
 *
 * Mantiene visible la barra lateral (vive en el layout) y da forma a la
 * espera, en vez de dejar el área principal en blanco.
 */
export default function CargandoPanel() {
  return (
    <div role="status" aria-live="polite" className="px-5 py-8 sm:px-8">
      <span className="sr-only">Cargando…</span>
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-7 w-64 max-w-full rounded bg-toga-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-toga-100" />
        <div className="mt-8 space-y-3 rounded-lg border border-toga-200 bg-white p-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-5 rounded bg-toga-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
