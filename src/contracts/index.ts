/**
 * Espejo del contrato de la API para el panel interno.
 *
 * El dominio lo define el backend, en `api/src/contracts/`. Aquí sólo viven
 * los tipos y esquemas que este panel usa. Si cambia allí, refléjalo aquí.
 */
import { z } from "zod";

export const ROLES = ["SUPER_ADMIN", "SECRETARY", "EVALUATOR", "PUBLISHER"] as const;
export type Role = (typeof ROLES)[number];

export const ROL_ETIQUETA: Record<Role, string> = {
  SUPER_ADMIN: "Administrador",
  SECRETARY: "Secretaría",
  EVALUATOR: "Evaluación",
  PUBLISHER: "Publicación",
};

export const WORKFLOW_STATUS = [
  "DRAFT",
  "DOCUMENT_REVIEW",
  "READY_FOR_EVALUATION",
  "EVALUATION_IN_PROGRESS",
  "EVALUATED",
  "OBJECTION_PERIOD",
  "FINAL_REVIEW",
  "FINALIZED",
  "ARCHIVED",
] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUS)[number];

export const ESTADO_ETIQUETA: Record<WorkflowStatus, string> = {
  DRAFT: "Borrador",
  DOCUMENT_REVIEW: "Revisión documental",
  READY_FOR_EVALUATION: "Lista para evaluar",
  EVALUATION_IN_PROGRESS: "En evaluación",
  EVALUATED: "Evaluada",
  OBJECTION_PERIOD: "Período de objeciones",
  FINAL_REVIEW: "Revisión final",
  FINALIZED: "Finalizada",
  ARCHIVED: "Archivada",
};

export type SuitabilityBand = "HIGH" | "MEDIUM" | "LOW" | "INELIGIBLE";

export interface Sesion {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: readonly Role[];
}

export interface EntradaRanking {
  readonly publicId: string;
  readonly slug: string;
  readonly fullName: string;
  readonly chamber: string;
  readonly total: number;
  readonly band: SuitabilityBand;
  readonly ineligible: boolean;
  readonly position: number | null;
  readonly tied: boolean;
  readonly rubricVersion: string;
}

export interface ResultadoRanking {
  readonly entries: readonly EntradaRanking[];
  readonly rubricVersion: string | null;
  readonly eligibleCount: number;
  readonly ineligibleCount: number;
}

export interface ResumenDashboard {
  readonly generatedAt: string;
  readonly candidateTotal: number;
  readonly eligibleCount: number;
  readonly ineligibleCount: number;
  readonly openObjectionCount: number;
  readonly pendingPublicationCount: number;
  readonly rubricVersion: string | null;
  readonly workflow: readonly { readonly status: WorkflowStatus; readonly count: number }[];
  readonly bands: readonly { readonly band: SuitabilityBand; readonly count: number }[];
  readonly objections: readonly { readonly status: ObjectionStatus; readonly count: number }[];
  readonly publicationQueue: readonly {
    readonly kind: "CANDIDATE_PROFILE" | "RANKING" | "REPORT";
    readonly count: number;
  }[];
  readonly activity: readonly {
    readonly date: string;
    readonly candidates: number;
    readonly objections: number;
  }[];
  readonly topRanking: readonly EntradaRanking[];
}

export interface SnapshotEnCola {
  readonly id: string;
  readonly kind: "CANDIDATE_PROFILE" | "RANKING" | "REPORT";
  readonly version: number;
  readonly status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "WITHDRAWN";
  readonly createdAt: string;
  readonly sha256: string;
  readonly preparedById: string;
  readonly preparedBy?: { readonly fullName: string };
  readonly candidate?: {
    readonly publicId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly chamber: string;
  } | null;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const cambiarContrasenaSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(12, "Mínimo 12 caracteres")
      .regex(/[a-z]/, "Debe incluir una minúscula")
      .regex(/[A-Z]/, "Debe incluir una mayúscula")
      .regex(/\d/, "Debe incluir un dígito"),
    confirmPassword: z.string().min(1, "Confirme la contraseña nueva"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const aprobarPublicacionSchema = z.object({
  reason: z.string().trim().min(10, "Indique el motivo (mínimo 10 caracteres)").max(1000),
});

// ─────────────────────────────────────────── expedientes

export const CHAMBERS = [
  "CONSTITUCIONAL",
  "POLITICO_ADMINISTRATIVA",
  "ELECTORAL",
  "CASACION_CIVIL",
  "CASACION_PENAL",
  "CASACION_SOCIAL",
] as const;
export type Chamber = (typeof CHAMBERS)[number];

export const SALA_ETIQUETA: Record<Chamber, string> = {
  CONSTITUCIONAL: "Constitucional",
  POLITICO_ADMINISTRATIVA: "Político-Administrativa",
  ELECTORAL: "Electoral",
  CASACION_CIVIL: "Casación Civil",
  CASACION_PENAL: "Casación Penal",
  CASACION_SOCIAL: "Casación Social",
};

export const DOCUMENT_CATEGORY = [
  "CURRICULUM",
  "ACADEMIC_TITLE",
  "TEACHING_PROOF",
  "PUBLICATION_PROOF",
  "PROFESSIONAL_PROOF",
  "IDENTITY",
  "SWORN_STATEMENT",
  "OTHER",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORY)[number];

export const CATEGORIA_ETIQUETA: Record<DocumentCategory, string> = {
  CURRICULUM: "Currículum",
  ACADEMIC_TITLE: "Títulos académicos",
  TEACHING_PROOF: "Constancias de docencia",
  PUBLICATION_PROOF: "Publicaciones",
  PROFESSIONAL_PROOF: "Trayectoria profesional",
  IDENTITY: "Documento de identidad",
  SWORN_STATEMENT: "Declaración jurada",
  OTHER: "Otros soportes",
};

export const nationalIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[VEJ]-?\d{6,9}$/, "Formato esperado: V-12345678")
  .transform((v) => (v.includes("-") ? v : `${v[0]}-${v.slice(1)}`));

export const crearExpedienteSchema = z.object({
  nationalId: nationalIdSchema,
  firstName: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
  lastName: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
  chamber: z.enum(CHAMBERS, { message: "Seleccione la sala" }),
  publicSummary: z.string().trim().max(1200).optional(),
  email: z.string().trim().toLowerCase().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  internalNotes: z.string().trim().max(4000).optional(),
});
export type CrearExpedienteInput = z.infer<typeof crearExpedienteSchema>;

export const transicionSchema = z.object({
  target: z.enum(WORKFLOW_STATUS),
  reason: z.string().trim().min(10, "Indique el motivo (mínimo 10 caracteres)").max(1000),
});

export interface DocumentoExpediente {
  readonly id: string;
  readonly publicId: string;
  readonly category: DocumentCategory;
  readonly originalName: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly scanStatus: "PENDING" | "CLEAN" | "INFECTED" | "SKIPPED" | "ERROR";
  readonly verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  readonly classification: "PRIVATE" | "REDACTED" | "PUBLIC";
  readonly uploadedAt: string;
  readonly version: number;
}

export interface ExpedienteListado {
  readonly id: string;
  readonly publicId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly chamber: Chamber;
  readonly workflowStatus: WorkflowStatus;
  readonly publicationStatus: string;
  readonly receivedAt: string;
  readonly submissions: readonly {
    readonly fileNumber: string;
    readonly status: string;
    readonly _count: { readonly documents: number };
  }[];
  readonly evaluations: readonly {
    readonly totalPoints: string;
    readonly band: string;
    readonly ineligible: boolean;
  }[];
  readonly _count: { readonly objections: number };
}

export interface ExpedienteDetalle extends ExpedienteListado {
  readonly nationalId: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly internalNotes: string | null;
  readonly publicSummary: string | null;
  readonly version: number;
  readonly submissions: readonly {
    readonly id: string;
    readonly fileNumber: string;
    readonly status: string;
    readonly internalNotes: string | null;
    readonly documents: readonly DocumentoExpediente[];
    readonly _count: { readonly documents: number };
  }[];
}

// ─────────────────────────────────────────── evaluación

export interface CriterioBaremo {
  readonly id: string;
  readonly key: string;
  readonly dimensionKey: string;
  readonly label: string;
  readonly description: string;
  readonly maxPoints: string;
  readonly order: number;
  readonly legalBasis: string | null;
  readonly isExcluding: boolean;
  readonly minimumRequired: string | null;
  readonly rule: {
    readonly kind: string;
    readonly unitLabel?: string;
    readonly threshold?: number;
  };
}

export interface PuntajeCriterio {
  readonly id: string;
  readonly criterionId: string;
  readonly value: string;
  readonly points: string;
  readonly justification: string | null;
  readonly evidenceDocumentId: string | null;
  readonly evidencePage: number | null;
  readonly criterion: CriterioBaremo;
}

export interface Evaluacion {
  readonly id: string;
  readonly candidateId: string;
  readonly status: "DRAFT" | "SUBMITTED" | "APPROVED" | "SUPERSEDED";
  readonly totalPoints: string;
  readonly band: SuitabilityBand;
  readonly ineligible: boolean;
  readonly ineligibilityReasons: readonly string[];
  readonly internalNotes: string | null;
  readonly evaluatorId: string;
  readonly scores: readonly PuntajeCriterio[];
  readonly rubric: { readonly version: string; readonly criteria?: readonly CriterioBaremo[] };
}

// ─────────────────────────────────────────── objeciones

export const OBJECTION_STATUS = [
  "RECEIVED",
  "TRIAGE",
  "ASSIGNED",
  "INFO_REQUESTED",
  "RESOLVED_FOUNDED",
  "RESOLVED_UNFOUNDED",
  "REJECTED_INADMISSIBLE",
] as const;
export type ObjectionStatus = (typeof OBJECTION_STATUS)[number];

export const OBJECION_ETIQUETA: Record<ObjectionStatus, string> = {
  RECEIVED: "Recibida",
  TRIAGE: "En triaje",
  ASSIGNED: "Asignada",
  INFO_REQUESTED: "Información solicitada",
  RESOLVED_FOUNDED: "Fundada",
  RESOLVED_UNFOUNDED: "Infundada",
  REJECTED_INADMISSIBLE: "Inadmisible",
};

export const CAUSAL_ETIQUETA: Record<string, string> = {
  POLITICAL_MILITANCY: "Militancia político-partidista",
  KINSHIP: "Parentesco con altos funcionarios",
  STATE_CONTRACTS: "Contrataciones con el Estado",
  FIRM_SANCTION: "Sanción firme",
  FALSE_CREDENTIAL: "Credencial falsa",
  INSUFFICIENT_EXPERIENCE: "Experiencia insuficiente",
  OTHER: "Otra causal",
};

export interface ObjecionBandeja {
  readonly id: string;
  readonly trackingCode: string;
  readonly category: string;
  readonly status: ObjectionStatus;
  readonly publicStatus: string;
  readonly receivedAt: string;
  readonly resolvedAt: string | null;
  readonly affectsCredential: string | null;
  readonly candidate: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly chamber: Chamber;
  };
  readonly assignedTo: { readonly id: string; readonly fullName: string } | null;
  readonly _count: { readonly attachments: number; readonly adjustments: number };
}

// ─────────────────────────────────────────── usuarios y bitácora

export interface UsuarioDirectorio {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly status: "ACTIVE" | "SUSPENDED";
  readonly mustChangePassword: boolean;
  readonly lastLoginAt: string | null;
  readonly roles: readonly Role[];
}

export interface EventoAuditoria {
  readonly id: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly effectiveRole: string | null;
  readonly reason: string | null;
  readonly ip: string | null;
  readonly correlationId: string;
  readonly occurredAt: string;
  readonly actor: { readonly id: string; readonly fullName: string; readonly email: string } | null;
}
