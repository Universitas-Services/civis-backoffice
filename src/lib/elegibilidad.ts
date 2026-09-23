import type { DocumentCategory, DocumentoExpediente } from "@/contracts";

/** Ids estables del checklist de elegibilidad (Paso 1). */
export const BLOQUE_ELEGIBILIDAD_IDS = [
  "identidad_nacionalidad",
  "honorabilidad_salud",
  "titulacion_abogado",
  "formacion_posgrado",
  "trayectoria_15",
  "incompatibilidades",
] as const;

export type BloqueElegibilidadId = (typeof BLOQUE_ELEGIBILIDAD_IDS)[number];

export type EstatusBloque = "OBLIGATORIO" | "EXCLUYENTE";

export type BloqueElegibilidad = {
  readonly id: BloqueElegibilidadId;
  readonly orden: number;
  readonly tituloCorto: string;
  readonly criterio: string;
  readonly fundamento: string;
  readonly estatus: EstatusBloque;
  /** Categorías de documento asociadas al bloque (visor). */
  readonly categorias: readonly DocumentCategory[];
};

/** Pestañas del visor agrupadas (pueden mapear a varios bloques). */
export const PESTANA_VISOR_IDS = [
  "identidad",
  "honorabilidad",
  "formacion",
  "trayectoria",
  "declaraciones",
] as const;

export type PestanaVisorId = (typeof PESTANA_VISOR_IDS)[number];

export type PestanaVisor = {
  readonly id: PestanaVisorId;
  readonly etiqueta: string;
  readonly categorias: readonly DocumentCategory[];
};

export const PESTANAS_VISOR: readonly PestanaVisor[] = [
  {
    id: "identidad",
    etiqueta: "1. Identidad",
    categorias: [
      "BIRTH_CERTIFICATE",
      "NATIONAL_ID",
      "SWORN_SINGLE_NATIONALITY",
      "CURRICULUM_VITAE",
    ],
  },
  {
    id: "honorabilidad",
    etiqueta: "2. Honorabilidad",
    categorias: [
      "HONORABILITY_LETTER",
      "MENTAL_CAPACITY_CERT",
      "CRIMINAL_RECORD",
      "COMPTROLLER_CLEARANCE",
    ],
  },
  {
    id: "formacion",
    etiqueta: "3. Formación",
    categorias: [
      "LAW_DEGREE",
      "SPECIALIZATION_DEGREE",
      "SPECIALIZATION_APPROVAL",
      "MASTER_DEGREE",
      "MASTER_APPROVAL",
      "DOCTORATE_DEGREE",
      "DOCTORATE_APPROVAL",
      "FOREIGN_DEGREE_VALIDATION",
    ],
  },
  {
    id: "trayectoria",
    etiqueta: "4. Trayectoria",
    categorias: [
      "BAR_ASSOCIATION_REGISTRATION",
      "BAR_ASSOCIATION_SOLVENCY",
      "INPREABOGADO_REGISTRATION",
      "INPREABOGADO_SOLVENCY",
      "FREE_PRACTICE_PROOF",
      "TEACHING_SERVICE_CERT",
      "TEACHING_CONTEST_RECORD",
      "JUDICIAL_CAREER_CERT",
      "PUBLIC_ADMIN_CAREER_CERT",
    ],
  },
  {
    id: "declaraciones",
    etiqueta: "5. Declaraciones",
    categorias: [
      "SWORN_NO_PARTY_MILITANCY",
      "SWORN_NO_KINSHIP",
      "MARRIAGE_CERTIFICATE",
      "SWORN_NO_STATE_CONTRACTS",
      "OTHER",
    ],
  },
];

export const BLOQUES_ELEGIBILIDAD: readonly BloqueElegibilidad[] = [
  {
    id: "identidad_nacionalidad",
    orden: 1,
    tituloCorto: "Nacionalidad y ciudadanía",
    criterio:
      "Venezolano/a por nacimiento (cédula V), mayor de edad y sin otra nacionalidad.",
    fundamento: "Art. 263.1 CRBV · Art. 41 CRBV",
    estatus: "OBLIGATORIO",
    categorias: ["BIRTH_CERTIFICATE", "NATIONAL_ID", "SWORN_SINGLE_NATIONALITY"],
  },
  {
    id: "honorabilidad_salud",
    orden: 2,
    tituloCorto: "Capacidades éticas y salud mental",
    criterio:
      "Certificación médica de salud mental y conducta intachable acreditadas.",
    fundamento: "Art. 263.2 CRBV · Art. 37.1, 37.2, 37.3 LOTSJ",
    estatus: "OBLIGATORIO",
    categorias: ["MENTAL_CAPACITY_CERT", "HONORABILITY_LETTER"],
  },
  {
    id: "titulacion_abogado",
    orden: 3,
    tituloCorto: "Título de abogado/a",
    criterio:
      "Copia en fondo negro con nota de registro SAREN y solvencia gremial activa.",
    fundamento: "Art. 263.3 CRBV · Art. 37.2 LOTSJ",
    estatus: "OBLIGATORIO",
    categorias: [
      "LAW_DEGREE",
      "BAR_ASSOCIATION_SOLVENCY",
      "INPREABOGADO_SOLVENCY",
      "BAR_ASSOCIATION_REGISTRATION",
      "INPREABOGADO_REGISTRATION",
    ],
  },
  {
    id: "formacion_posgrado",
    orden: 4,
    tituloCorto: "Título de posgrado jurídico",
    criterio:
      "Especialización, maestría o doctorado en área jurídica acreditado.",
    fundamento: "Art. 263.3 CRBV · Art. 37.8 LOTSJ",
    estatus: "OBLIGATORIO",
    categorias: [
      "SPECIALIZATION_DEGREE",
      "MASTER_DEGREE",
      "DOCTORATE_DEGREE",
      "FOREIGN_DEGREE_VALIDATION",
    ],
  },
  {
    id: "trayectoria_15",
    orden: 5,
    tituloCorto: "Umbral mínimo de 15 años",
    criterio:
      "Soportes fehacientes de al menos 15 años acumulados (ejercicio, docencia o judicatura).",
    fundamento: "Art. 263.3 CRBV",
    estatus: "EXCLUYENTE",
    categorias: [
      "FREE_PRACTICE_PROOF",
      "TEACHING_SERVICE_CERT",
      "TEACHING_CONTEST_RECORD",
      "JUDICIAL_CAREER_CERT",
      "PUBLIC_ADMIN_CAREER_CERT",
    ],
  },
  {
    id: "incompatibilidades",
    orden: 6,
    tituloCorto: "Ausencia de incompatibilidades",
    criterio:
      "Sin militancia política, sin parentesco/matrimonio con magistrados o altos funcionarios, sin contratos públicos vigentes ni sanciones firmes de CGR/penal.",
    fundamento: "Art. 256 CRBV · Art. 37.4–37.7 LOTSJ · Art. 145 CRBV",
    estatus: "EXCLUYENTE",
    categorias: [
      "CRIMINAL_RECORD",
      "COMPTROLLER_CLEARANCE",
      "SWORN_NO_PARTY_MILITANCY",
      "SWORN_NO_KINSHIP",
      "MARRIAGE_CERTIFICATE",
      "SWORN_NO_STATE_CONTRACTS",
    ],
  },
];

export const CAUSAL_INELEGIBILIDAD_IDS = [
  "nacionalidad",
  "honorabilidad",
  "titulo_abogado",
  "posgrado",
  "trayectoria_15",
  "militancia",
  "parentesco",
  "contratacion",
  "cgr_penal",
] as const;

export type CausalInelegibilidadId = (typeof CAUSAL_INELEGIBILIDAD_IDS)[number];

export type CausalInelegibilidad = {
  readonly id: CausalInelegibilidadId;
  readonly orden: number;
  readonly texto: string;
};

export const CAUSALES_INELEGIBILIDAD: readonly CausalInelegibilidad[] = [
  {
    id: "nacionalidad",
    orden: 1,
    texto:
      "Incumplimiento de nacionalidad venezolana por nacimiento o doble nacionalidad (Art. 263.1 CRBV / Art. 41 CRBV).",
  },
  {
    id: "honorabilidad",
    orden: 2,
    texto:
      "Ausencia de reconocida honorabilidad / falta de solvencia mental o ética acreditada (Art. 263.2 CRBV / Art. 37.1 LOTSJ).",
  },
  {
    id: "titulo_abogado",
    orden: 3,
    texto:
      "Falta de título de abogado/a o ausencia de protocolización registral SAREN (Art. 263.3 CRBV / Art. 37.2 LOTSJ).",
  },
  {
    id: "posgrado",
    orden: 4,
    texto:
      "Inexistencia de título de posgrado en ciencias jurídicas acreditado (Art. 263.3 CRBV / Art. 37.8 LOTSJ).",
  },
  {
    id: "trayectoria_15",
    orden: 5,
    texto:
      "Insuficiencia en el umbral de trayectoria (menos de 15 años acumulados) en ejercicio libre, docencia o judicatura (Art. 263.3 CRBV).",
  },
  {
    id: "militancia",
    orden: 6,
    texto: "Incompatibilidad por militancia político-partidista activa (Art. 37.5 LOTSJ).",
  },
  {
    id: "parentesco",
    orden: 7,
    texto:
      "Incompatibilidad por parentesco o vínculo conyugal con magistrados o altos funcionarios del Poder Público (Art. 37.6 LOTSJ / Art. 256 CRBV).",
  },
  {
    id: "contratacion",
    orden: 8,
    texto: "Contratación vigente de obras/servicios con el Estado (Art. 37.7 LOTSJ).",
  },
  {
    id: "cgr_penal",
    orden: 9,
    texto:
      "Inhabilitación administrativa de la CGR o sanción penal firme (Art. 37.4 LOTSJ).",
  },
];

export type ResultadoElegibilidad = "ELEGIBLE" | "INELEGIBLE";

export type ChecklistElegibilidad = Record<BloqueElegibilidadId, boolean>;

export type ResumenExpedienteElegibilidad = {
  readonly fileNumber: string;
  readonly postulanteNombre: string;
  readonly nationalId: string;
  readonly salaLabel: string;
  readonly evaluadorNombre: string;
  readonly evaluadorId: string;
};

export type FichaDescalificacion = ResumenExpedienteElegibilidad & {
  readonly causales: readonly CausalInelegibilidadId[];
  readonly motivo: string;
  readonly fechaIso: string;
};

export type DecisionElegibilidad = {
  readonly candidateId: string;
  readonly resultado: ResultadoElegibilidad;
  readonly checklist: ChecklistElegibilidad;
  readonly motivo: string;
  readonly resumen: ResumenExpedienteElegibilidad;
  readonly ficha: FichaDescalificacion | null;
  readonly actualizadoEn: string;
};

export function checklistVacio(): ChecklistElegibilidad {
  return {
    identidad_nacionalidad: false,
    honorabilidad_salud: false,
    titulacion_abogado: false,
    formacion_posgrado: false,
    trayectoria_15: false,
    incompatibilidades: false,
  };
}

export function checklistCompleto(c: ChecklistElegibilidad): boolean {
  return BLOQUE_ELEGIBILIDAD_IDS.every((id) => c[id] === true);
}

export function documentosPorPestana(
  documentos: readonly DocumentoExpediente[],
  pestanaId: PestanaVisorId,
): DocumentoExpediente[] {
  const pestana = PESTANAS_VISOR.find((p) => p.id === pestanaId);
  if (!pestana) return [];
  const set = new Set<string>(pestana.categorias);
  return documentos.filter((d) => set.has(String(d.category)));
}

export function alertasDesdeDocumentos(
  documentos: readonly DocumentoExpediente[],
): readonly { readonly titulo: string; readonly texto: string }[] {
  const out: { titulo: string; texto: string }[] = [];
  for (const d of documentos) {
    const rd = d.reviewData as Record<string, unknown> | null | undefined;
    if (!rd) continue;
    const raw = rd.advertencias ?? rd.advertencia;
    if (raw === null || raw === undefined) continue;
    const texto = String(raw).trim();
    if (!texto) continue;
    out.push({ titulo: d.originalName, texto });
  }
  return out;
}

const STORAGE_KEY = "civis_elegibilidad_v1";

function leerMapa(): Record<string, DecisionElegibilidad> {
  if (typeof window === "undefined") return {};
  try {
    const crudo = sessionStorage.getItem(STORAGE_KEY);
    if (!crudo) return {};
    return JSON.parse(crudo) as Record<string, DecisionElegibilidad>;
  } catch {
    return {};
  }
}

function escribirMapa(mapa: Record<string, DecisionElegibilidad>) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mapa));
}

export function leerDecision(candidateId: string): DecisionElegibilidad | null {
  return leerMapa()[candidateId] ?? null;
}

export function guardarDecision(decision: DecisionElegibilidad): void {
  const mapa = leerMapa();
  mapa[decision.candidateId] = decision;
  escribirMapa(mapa);
}

export function listarDecisiones(): readonly DecisionElegibilidad[] {
  return Object.values(leerMapa());
}

export function listarElegibles(): readonly DecisionElegibilidad[] {
  return listarDecisiones().filter((d) => d.resultado === "ELEGIBLE");
}

export function listarInelegibles(): readonly DecisionElegibilidad[] {
  return listarDecisiones().filter((d) => d.resultado === "INELEGIBLE");
}

export function esElegible(candidateId: string): boolean {
  return leerDecision(candidateId)?.resultado === "ELEGIBLE";
}
