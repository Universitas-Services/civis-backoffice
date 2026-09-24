"use client";

import type { BaremoDetalle } from "@/contracts";
import { BaremoActivoLectura } from "@/components/baremo-activo-lectura";
import { ListaBaremo, type FilaBaremo } from "@/components/lista-baremo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Consulta del baremo: la lista de postulados es la pestaña principal.
 * El árbol activo se consulta aparte, sin acciones de configuración.
 */
export function BaremoConsultaTabs({
  items,
  baremo,
}: {
  readonly items: readonly FilaBaremo[];
  readonly baremo: BaremoDetalle | null;
}) {
  return (
    <Tabs defaultValue="postulados" className="w-full">
      <TabsList aria-label="Consulta de baremo" className="w-full sm:w-auto">
        <TabsTrigger value="postulados" className="flex-1 sm:flex-none">
          Postulados
          <span className="cifra ml-1.5 text-xs text-toga-500">({items.length})</span>
        </TabsTrigger>
        <TabsTrigger value="activo" className="flex-1 sm:flex-none">
          Baremo activo
        </TabsTrigger>
      </TabsList>

      <TabsContent value="postulados">
        <ListaBaremo items={items} />
      </TabsContent>

      <TabsContent value="activo">
        <BaremoActivoLectura baremo={baremo} />
      </TabsContent>
    </Tabs>
  );
}
