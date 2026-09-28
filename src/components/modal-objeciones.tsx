"use client";

import { CAUSA_DENUNCIA_ETIQUETA } from "@/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-toga-50/40 px-4 py-4">
          {items.map((item, indice) => {
            const causas = item.causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c);
            if (item.otherCause) causas.push(item.otherCause);
            return (
              <li key={item.id}>
                <Card className="shadow-none">
                  <CardHeader className="gap-2 p-3 pb-2">
                    <p className="text-[0.65rem] font-medium tracking-wide text-toga-500 uppercase">
                      Denuncia {indice + 1} de {items.length}
                    </p>
                    <CardTitle className="text-xs leading-snug">Causas alegadas</CardTitle>
                    <ul className="flex flex-wrap gap-1.5">
                      {causas.map((causa) => (
                        <li
                          key={causa}
                          className="rounded bg-balanza-50 px-2 py-0.5 text-[0.7rem] font-medium leading-snug text-balanza-800 ring-1 ring-inset ring-balanza-600/20"
                        >
                          {causa}
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                  <CardContent className="space-y-2.5 p-3 pt-0">
                    <div>
                      <p className="text-[0.65rem] font-medium tracking-wide text-toga-500 uppercase">
                        Relato
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-toga-800">
                        {item.description}
                      </p>
                    </div>
                    {item.evidenceUrl ? (
                      <div className="border-t border-toga-100 pt-2.5">
                        <p className="text-[0.65rem] font-medium tracking-wide text-toga-500 uppercase">
                          Evidencia
                        </p>
                        <a
                          href={item.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block break-all text-xs text-balanza-700 underline-offset-2 hover:underline"
                        >
                          {item.evidenceUrl}
                        </a>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
