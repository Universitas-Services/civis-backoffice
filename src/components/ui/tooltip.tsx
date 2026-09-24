"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-md border border-toga-200 bg-white px-3 py-1.5 text-xs leading-relaxed text-toga-900 shadow-md",
          "animate-[entrada-ui_120ms_ease-out]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

/** Atajo: dispara tooltip al pasar el cursor o al enfocar. */
export function ConTooltip({
  texto,
  children,
  side = "top",
  activo = true,
}: {
  readonly texto: string;
  readonly children: React.ReactNode;
  readonly side?: "top" | "right" | "bottom" | "left";
  /** Si es false, el disparador sigue montado pero el cartel no aparece. */
  readonly activo?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {activo ? <TooltipContent side={side}>{texto}</TooltipContent> : null}
    </Tooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
