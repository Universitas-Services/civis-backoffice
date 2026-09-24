"use client";

import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseIso(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = parse(value, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

/**
 * Date picker shadcn: botón + calendario con selects de mes y año.
 * Valor ISO `YYYY-MM-DD` o cadena vacía.
 */
export function DatePicker({
  id,
  value,
  onChange,
  className,
  placeholder = "Seleccione una fecha",
  fromYear = 1920,
  toYear,
  invalid = false,
}: {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (iso: string) => void;
  readonly className?: string;
  readonly placeholder?: string;
  readonly fromYear?: number;
  readonly toYear?: number;
  readonly invalid?: boolean;
}) {
  const selected = parseIso(value);
  const endYear = toYear ?? new Date().getFullYear() + 20;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-invalid={invalid || undefined}
          className={cn(
            "mt-1 flex h-10 w-full max-w-xs items-center justify-between gap-2 rounded-md border border-toga-300 bg-white px-3 py-2 text-left text-sm",
            "focus:border-balanza-600 focus:outline-none focus:ring-2 focus:ring-balanza-600/20",
            selected ? "text-toga-900" : "text-toga-400",
            invalid && "campo-con-error",
            className,
          )}
        >
          <span className="truncate">
            {selected
              ? format(selected, "d 'de' MMMM 'de' yyyy", { locale: es })
              : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-toga-500" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
          }}
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(endYear, 11)}
          disabled={[
            { before: new Date(fromYear, 0, 1) },
            { after: new Date(endYear, 11, 31) },
          ]}
        />
      </PopoverContent>
    </Popover>
  );
}
