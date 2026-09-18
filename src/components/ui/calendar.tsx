"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

/**
 * Calendar estilo shadcn + paleta CIVIS.
 * Con `captionLayout="dropdown"` el `<select>` va transparente encima del
 * `caption_label` (patrón de react-day-picker); no hay que estilizar ambos.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("rdp-root p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex w-full flex-col gap-3",
        month_caption: "relative mx-9 flex h-10 items-center justify-center",
        caption_label: cn(
          "inline-flex items-center gap-1 rounded-md border border-toga-300 bg-white px-2.5 py-1.5",
          "text-sm font-medium text-toga-900",
        ),
        dropdowns: "relative z-10 flex items-center justify-center gap-2",
        dropdown_root: "relative inline-flex items-center",
        // Invisible y encima del label (comportamiento nativo de rdp).
        dropdown: "absolute inset-0 z-20 w-full cursor-pointer opacity-0",
        nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between px-0.5",
        button_previous: cn(
          "z-30 inline-flex h-8 w-8 items-center justify-center rounded-md text-toga-600",
          "hover:bg-toga-100 hover:text-toga-900",
        ),
        button_next: cn(
          "z-30 inline-flex h-8 w-8 items-center justify-center rounded-md text-toga-600",
          "hover:bg-toga-100 hover:text-toga-900",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-center text-[0.75rem] font-medium text-toga-500",
        week: "mt-1 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-sm",
        day_button: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-toga-900",
          "hover:bg-toga-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-balanza-600/30",
        ),
        selected:
          "[&>button]:bg-balanza-600 [&>button]:text-white [&>button]:hover:bg-balanza-700",
        today: "[&>button]:font-semibold [&>button]:text-balanza-700",
        outside: "[&>button]:text-toga-300",
        disabled: "[&>button]:text-toga-300 [&>button]:opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chevronClass)} {...chevronProps} />;
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("h-4 w-4", chevronClass)} {...chevronProps} />;
          }
          return <ChevronDown className={cn("h-3.5 w-3.5 text-toga-500", chevronClass)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}
