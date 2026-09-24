import type { BaremoDetalle } from "@/contracts";
import type { BaremoCongeladoVista } from "@/components/pantalla-aplicar-baremo";

/** Completa la copia guardada con el texto del baremo activo, si es el mismo. */
export function detallarBaremoCongelado(
  congelado: BaremoCongeladoVista,
  activo: BaremoDetalle | null,
): BaremoCongeladoVista {
  if (!activo || activo.id !== congelado.id) return congelado;
  const criterios = new Map(activo.criterios.map((c) => [c.id, c]));
  return {
    ...congelado,
    description: congelado.description || activo.description,
    criterios: congelado.criterios.map((criterio) => {
      const vivo = criterios.get(criterio.id);
      const rangos = new Map((vivo?.rangos ?? []).map((r) => [r.id, r]));
      return {
        ...criterio,
        description: criterio.description || vivo?.description || null,
        rangos: criterio.rangos.map((rango) => ({
          ...rango,
          description: rango.description || rangos.get(rango.id)?.description || null,
        })),
      };
    }),
  };
}
