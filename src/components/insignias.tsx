import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  Circle,
  CircleDot,
  Eye,
  FilePenLine,
  Loader,
  Lock,
  Minus,
  ShieldAlert,
  X,
} from "lucide-react";
import type { ObjectionStatus, SuitabilityBand, WorkflowStatus } from "@/contracts";
import { ESTADO_ETIQUETA, OBJECION_ETIQUETA, etiquetarPublicacion } from "@/contracts";

/**
 * Píldoras de estado.
 *
 * Todas llevan texto además de color: el color por sí solo no comunica
 * (WCAG 1.4.1), y en un panel de trabajo donde se decide sobre expedientes
 * ajenos, confundir un estado por un matiz de tono sería grave.
 */
function Pildora({
  texto,
  clases,
  Icono,
}: {
  readonly texto: string;
  readonly clases: string;
  readonly Icono?: LucideIcon;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${clases}`}
    >
      {Icono && <Icono className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={2} />}
      {texto}
    </span>
  );
}

const ESTADO_ESTILO: Record<WorkflowStatus, string> = {
  DRAFT: "bg-toga-100 text-toga-600 ring-toga-300",
  DOCUMENT_REVIEW: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  READY_FOR_EVALUATION: "bg-balanza-600 text-white ring-balanza-700/30",
  EVALUATION_IN_PROGRESS: "bg-balanza-600 text-white ring-balanza-700/30",
  EVALUATED: "bg-validado-50 text-validado-700 ring-validado-700/20",
  OBJECTION_PERIOD: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
  FINAL_REVIEW: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  FINALIZED: "bg-validado-50 text-validado-700 ring-validado-700/20",
  ARCHIVED: "bg-toga-100 text-toga-500 ring-toga-200",
};

export function InsigniaEstado({ estado }: { readonly estado: WorkflowStatus }) {
  return (
    <Pildora
      texto={ESTADO_ETIQUETA[estado] ?? estado}
      clases={ESTADO_ESTILO[estado] ?? ESTADO_ESTILO.DRAFT}
    />
  );
}

const PUBLICACION_ESTILO: Record<string, string> = {
  NOT_PUBLISHED: "bg-toga-100 text-toga-600 ring-toga-300",
  DRAFT: "bg-toga-100 text-toga-600 ring-toga-300",
  PENDING_APPROVAL: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  PUBLISHED: "bg-validado-50 text-validado-700 ring-validado-700/20",
  WITHDRAWN: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
};

export function InsigniaPublicacion({ estado }: { readonly estado: string }) {
  return (
    <Pildora
      texto={etiquetarPublicacion(estado)}
      clases={PUBLICACION_ESTILO[estado] ?? PUBLICACION_ESTILO.NOT_PUBLISHED!}
      Icono={estado === "PUBLISHED" ? Eye : Lock}
    />
  );
}

const BANDA: Record<SuitabilityBand, { texto: string; clases: string; Icono: LucideIcon }> = {
  HIGH: {
    texto: "Altamente idóneo",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
    Icono: CircleDot,
  },
  MEDIUM: {
    texto: "Idóneo medio",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
    Icono: Circle,
  },
  LOW: {
    texto: "Insuficiente",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
    Icono: Circle,
  },
  INELIGIBLE: {
    texto: "Inhabilitado",
    clases: "bg-balanza-600 text-white ring-balanza-700/30",
    Icono: X,
  },
};

export function InsigniaBanda({ banda }: { readonly banda: SuitabilityBand }) {
  const b = BANDA[banda] ?? BANDA.LOW;
  return <Pildora texto={b.texto} clases={b.clases} Icono={b.Icono} />;
}

const OBJECION_ESTILO: Record<ObjectionStatus, string> = {
  RECEIVED: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  TRIAGE: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  ASSIGNED: "bg-toga-100 text-toga-700 ring-toga-300",
  INFO_REQUESTED: "bg-toga-100 text-toga-700 ring-toga-300",
  RESOLVED_FOUNDED: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
  RESOLVED_UNFOUNDED: "bg-validado-50 text-validado-700 ring-validado-700/20",
  REJECTED_INADMISSIBLE: "bg-toga-100 text-toga-500 ring-toga-200",
};

export function InsigniaObjecion({ estado }: { readonly estado: ObjectionStatus }) {
  return (
    <Pildora
      texto={OBJECION_ETIQUETA[estado] ?? estado}
      clases={OBJECION_ESTILO[estado] ?? OBJECION_ESTILO.RECEIVED}
    />
  );
}

const CLASIFICACION: Record<string, { texto: string; clases: string; Icono: LucideIcon }> = {
  PRIVATE: { texto: "Privado", clases: "bg-toga-100 text-toga-600 ring-toga-300", Icono: Lock },
  REDACTED: {
    texto: "Redactado",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
    Icono: FilePenLine,
  },
  PUBLIC: {
    texto: "Público",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
    Icono: Eye,
  },
};

export function InsigniaClasificacion({ valor }: { readonly valor: string }) {
  const c = CLASIFICACION[valor] ?? CLASIFICACION.PRIVATE!;
  return <Pildora texto={c.texto} clases={c.clases} Icono={c.Icono} />;
}

const ANALISIS: Record<string, { texto: string; clases: string; Icono: LucideIcon }> = {
  CLEAN: {
    texto: "Limpio",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
    Icono: Check,
  },
  SKIPPED: {
    texto: "Sin analizar",
    clases: "bg-toga-100 text-toga-600 ring-toga-300",
    Icono: Minus,
  },
  PENDING: {
    texto: "En análisis",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
    Icono: Loader,
  },
  INFECTED: {
    texto: "En cuarentena",
    clases: "bg-balanza-600 text-white ring-balanza-700/30",
    Icono: ShieldAlert,
  },
  ERROR: {
    texto: "Error de análisis",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
    Icono: AlertTriangle,
  },
};

export function InsigniaAnalisis({ valor }: { readonly valor: string }) {
  const a = ANALISIS[valor] ?? ANALISIS.PENDING!;
  return <Pildora texto={a.texto} clases={a.clases} Icono={a.Icono} />;
}

/** Puntaje sobre 100, con la cifra como dato principal. */
export function Puntaje({
  valor,
  tamano = "md",
}: {
  readonly valor: number;
  readonly tamano?: "sm" | "md" | "lg";
}) {
  const clase = { sm: "text-base", md: "text-2xl", lg: "text-4xl" }[tamano];
  return (
    <span className="cifra inline-flex items-baseline gap-1">
      <span className={`${clase} font-semibold tracking-tight text-toga-900`}>{valor}</span>
      <span className="text-xs text-toga-500">/ 100</span>
    </span>
  );
}
