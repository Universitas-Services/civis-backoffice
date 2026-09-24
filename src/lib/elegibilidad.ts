import { SALA_ETIQUETA, type DocumentCategory, type DocumentoExpediente } from "@/contracts";

/** Claves del checklist de elegibilidad (Paso 1), alineadas a la API. */
export const BLOQUE_ELEGIBILIDAD_IDS = [
  "NATIONALITY",
  "ETHICS_MENTAL",
  "LAW_DEGREE",
  "POSTGRADUATE",
  "EXPERIENCE_15Y",
  "NO_INCOMPATIBILITIES",
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
    id: "NATIONALITY",
    orden: 1,
    tituloCorto: "Nacionalidad y ciudadanía",
    criterio:
      "Venezolano/a por nacimiento (cédula V), mayor de edad y sin otra nacionalidad.",
    fundamento: "Art. 263.1 CRBV · Art. 41 CRBV",
    estatus: "OBLIGATORIO",
    categorias: ["BIRTH_CERTIFICATE", "NATIONAL_ID", "SWORN_SINGLE_NATIONALITY"],
  },
  {
    id: "ETHICS_MENTAL",
    orden: 2,
    tituloCorto: "Capacidades éticas y salud mental",
    criterio:
      "Certificación médica de salud mental y conducta intachable acreditadas.",
    fundamento: "Art. 263.2 CRBV · Art. 37.1, 37.2, 37.3 LOTSJ",
    estatus: "OBLIGATORIO",
    categorias: ["MENTAL_CAPACITY_CERT", "HONORABILITY_LETTER"],
  },
  {
    id: "LAW_DEGREE",
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
    id: "POSTGRADUATE",
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
    id: "EXPERIENCE_15Y",
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
    id: "NO_INCOMPATIBILITIES",
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
  "CAUSAL_1",
  "CAUSAL_2",
  "CAUSAL_3",
  "CAUSAL_4",
  "CAUSAL_5",
  "CAUSAL_6",
  "CAUSAL_7",
  "CAUSAL_8",
  "CAUSAL_9",
] as const;

export type CausalInelegibilidadId = (typeof CAUSAL_INELEGIBILIDAD_IDS)[number];

export type CausalInelegibilidad = {
  readonly id: CausalInelegibilidadId;
  readonly orden: number;
  readonly texto: string;
};

export const CAUSALES_INELEGIBILIDAD: readonly CausalInelegibilidad[] = [
  {
    id: "CAUSAL_1",
    orden: 1,
    texto:
      "Incumplimiento de nacionalidad venezolana por nacimiento o doble nacionalidad (Art. 263.1 CRBV / Art. 41 CRBV).",
  },
  {
    id: "CAUSAL_2",
    orden: 2,
    texto:
      "Ausencia de reconocida honorabilidad / falta de solvencia mental o ética acreditada (Art. 263.2 CRBV / Art. 37.1 LOTSJ).",
  },
  {
    id: "CAUSAL_3",
    orden: 3,
    texto:
      "Falta de título de abogado/a o ausencia de protocolización registral SAREN (Art. 263.3 CRBV / Art. 37.2 LOTSJ).",
  },
  {
    id: "CAUSAL_4",
    orden: 4,
    texto:
      "Inexistencia de título de posgrado en ciencias jurídicas acreditado (Art. 263.3 CRBV / Art. 37.8 LOTSJ).",
  },
  {
    id: "CAUSAL_5",
    orden: 5,
    texto:
      "Insuficiencia en el umbral de trayectoria (menos de 15 años acumulados) en ejercicio libre, docencia o judicatura (Art. 263.3 CRBV).",
  },
  {
    id: "CAUSAL_6",
    orden: 6,
    texto: "Incompatibilidad por militancia político-partidista activa (Art. 37.5 LOTSJ).",
  },
  {
    id: "CAUSAL_7",
    orden: 7,
    texto:
      "Incompatibilidad por parentesco o vínculo conyugal con magistrados o altos funcionarios del Poder Público (Art. 37.6 LOTSJ / Art. 256 CRBV).",
  },
  {
    id: "CAUSAL_8",
    orden: 8,
    texto: "Contratación vigente de obras/servicios con el Estado (Art. 37.7 LOTSJ).",
  },
  {
    id: "CAUSAL_9",
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
    NATIONALITY: false,
    ETHICS_MENTAL: false,
    LAW_DEGREE: false,
    POSTGRADUATE: false,
    EXPERIENCE_15Y: false,
    NO_INCOMPATIBILITIES: false,
  };
}

export function checklistCompleto(c: ChecklistElegibilidad): boolean {
  return BLOQUE_ELEGIBILIDAD_IDS.every((id) => c[id] === true);
}

export type FichaElegibilidadApi = {
  readonly decision: string;
  readonly decidedAt: string;
  readonly decidedBy: string | null;
  readonly motivation: string;
  readonly checklist: readonly { readonly key: string; readonly marcado: boolean }[];
  readonly causales: readonly { readonly key: string }[];
};

/** Adapta la ficha de la API al modelo que muestra la bandeja de inelegibles. */
export function decisionDesdeFichaApi(
  candidato: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly nationalId: string;
    readonly chamber: string;
    readonly receivedAt: string;
    readonly submissions: readonly { readonly fileNumber: string }[];
  },
  ficha: FichaElegibilidadApi | null,
): DecisionElegibilidad {
  const checklist = checklistVacio();
  for (const item of ficha?.checklist ?? []) {
    if ((BLOQUE_ELEGIBILIDAD_IDS as readonly string[]).includes(item.key)) {
      checklist[item.key as BloqueElegibilidadId] = item.marcado;
    }
  }
  const causales = (ficha?.causales ?? [])
    .map((c) => c.key)
    .filter((clave): clave is CausalInelegibilidadId =>
      (CAUSAL_INELEGIBILIDAD_IDS as readonly string[]).includes(clave),
    );
  const fecha = ficha?.decidedAt ?? candidato.receivedAt;
  const resumen: ResumenExpedienteElegibilidad = {
    fileNumber: candidato.submissions[0]?.fileNumber ?? "—",
    postulanteNombre: `${candidato.firstName} ${candidato.lastName}`,
    nationalId: candidato.nationalId,
    salaLabel: SALA_ETIQUETA[candidato.chamber] ?? candidato.chamber,
    evaluadorNombre: ficha?.decidedBy ?? "—",
    evaluadorId: "",
  };
  return {
    candidateId: candidato.id,
    resultado: "INELEGIBLE",
    checklist,
    motivo: ficha?.motivation ?? "",
    resumen,
    actualizadoEn: fecha,
    ficha: {
      ...resumen,
      causales,
      motivo: ficha?.motivation ?? "",
      fechaIso: fecha,
    },
  };
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
