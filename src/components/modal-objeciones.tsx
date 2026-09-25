"use client";

import { CAUSA_DENUNCIA_ETIQUETA } from "@/contracts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface ObjecionVista {
  readonly id: string;
  readonly causes: readonly string[];
  readonly otherCause: string | null;
  readonly description: string;
  readonly evidenceUrl: string;
}

/** Botón compacto que abre las denuncias del postulante en un panel lateral. */
export function ModalObjeciones({
  nombre,
  items,
}: {
  readonly nombre: string;
  readonly items: readonly ObjecionVista[];
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-medium text-toga-800 hover:bg-toga-50"
        >
          Ver objeciones ({items.length})
        </button>
      </SheetTrigger>
      <SheetContent className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Objeciones de {nombre}</SheetTitle>
          <SheetDescription>
            {items.length === 1
              ? "Una denuncia recibida sobre este postulante."
              : `${items.length} denuncias recibidas sobre este postulante.`}
          </SheetDescription>
        </SheetHeader>
        <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {items.map((item) => (
            <li key={item.id} className="border-t border-toga-100 pt-4 text-base text-toga-700">
              <p className="font-medium text-toga-900">
                {item.causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c).join(" · ")}
                {item.otherCause ? ` (${item.otherCause})` : ""}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{item.description}</p>
              {item.evidenceUrl && (
                <p className="mt-1 break-all text-sm text-toga-500">{item.evidenceUrl}</p>
              )}
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
