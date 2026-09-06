import type { ObjectionStatus, SuitabilityBand, WorkflowStatus } from "@/contracts";
import { ESTADO_ETIQUETA, OBJECION_ETIQUETA } from "@/contracts";

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
  simbolo,
}: {
  readonly texto: string;
  readonly clases: string;
  readonly simbolo?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${clases}`}
    >
      {simbolo && <span aria-hidden="true">{simbolo}</span>}
      {texto}
    </span>
  );
}

const ESTADO_ESTILO: Record<WorkflowStatus, string> = {
  DRAFT: "bg-toga-100 text-toga-600 ring-toga-300",
  DOCUMENT_REVIEW: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  READY_FOR_EVALUATION: "bg-toga-800 text-toga-100 ring-toga-900/30",
  EVALUATION_IN_PROGRESS: "bg-toga-800 text-toga-100 ring-toga-900/30",
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

const BANDA: Record<SuitabilityBand, { texto: string; clases: string; simbolo: string }> = {
  HIGH: {
    texto: "Altamente idóneo",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
    simbolo: "●",
  },
  MEDIUM: {
    texto: "Idóneo medio",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
    simbolo: "◐",
  },
  LOW: {
    texto: "Insuficiente",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
    simbolo: "○",
  },
  INELIGIBLE: {
    texto: "Inhabilitado",
    clases: "bg-toga-800 text-toga-100 ring-toga-900/30",
    simbolo: "✕",
  },
};

export function InsigniaBanda({ banda }: { readonly banda: SuitabilityBand }) {
  const b = BANDA[banda] ?? BANDA.LOW;
  return <Pildora texto={b.texto} clases={b.clases} simbolo={b.simbolo} />;
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

const CLASIFICACION: Record<string, { texto: string; clases: string; simbolo: string }> = {
  PRIVATE: { texto: "Privado", clases: "bg-toga-100 text-toga-600 ring-toga-300", simbolo: "🔒" },
  REDACTED: {
    texto: "Redactado",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
    simbolo: "✎",
  },
  PUBLIC: {
    texto: "Público",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
    simbolo: "◎",
  },
};

export function InsigniaClasificacion({ valor }: { readonly valor: string }) {
  const c = CLASIFICACION[valor] ?? CLASIFICACION.PRIVATE!;
  return <Pildora texto={c.texto} clases={c.clases} simbolo={c.simbolo} />;
}

const ANALISIS: Record<string, { texto: string; clases: string; simbolo: string }> = {
  CLEAN: {
    texto: "Limpio",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
    simbolo: "✓",
  },
  SKIPPED: {
    texto: "Sin analizar",
    clases: "bg-toga-100 text-toga-600 ring-toga-300",
    simbolo: "–",
  },
  PENDING: {
    texto: "En análisis",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
    simbolo: "…",
  },
  INFECTED: {
    texto: "En cuarentena",
    clases: "bg-toga-800 text-toga-100 ring-toga-900/30",
    simbolo: "✕",
  },
  ERROR: {
    texto: "Error de análisis",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
    simbolo: "!",
  },
};

export function InsigniaAnalisis({ valor }: { readonly valor: string }) {
  const a = ANALISIS[valor] ?? ANALISIS.PENDING!;
  return <Pildora texto={a.texto} clases={a.clases} simbolo={a.simbolo} />;
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
