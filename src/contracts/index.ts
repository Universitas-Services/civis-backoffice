/**
 * Espejo del contrato de la API para el panel interno.
 *
 * El dominio lo define el backend, en `api/src/contracts/`. Aquí sólo viven
 * los tipos y esquemas que este panel usa. Si cambia allí, refléjalo aquí.
 */
import { z } from "zod";

/**
 * Roles — espejo de civis-api `ROLES` (sin PUBLISHER; con ADMIN).
 * VIEWER: visualizador (diputado). Consulta, opina y objeta; no opera el proceso.
 * COMMITTEE: comité. Recibe las objeciones y las envía al Consejo con el descargo.
 * APPLICANT: postulante con cuenta. Usa civis-postulacion, nunca este panel.
 */
export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SECRETARY",
  "REVIEWER",
  "EVALUATOR",
  "COMMITTEE",
  "VIEWER",
  "APPLICANT",
] as const;
export type Role = (typeof ROLES)[number];

/** Roles que se asignan desde el panel. El de postulante nace del registro público. */
export const ROLES_PANEL = ROLES.filter((rol) => rol !== "APPLICANT");

/** Roles operativos que un ADMIN puede crear/asignar (no ADMIN ni SUPER_ADMIN). */
export const ROLES_MENORES = ["SECRETARY", "REVIEWER", "EVALUATOR", "COMMITTEE", "VIEWER"] as const;
export type RoleMenor = (typeof ROLES_MENORES)[number];

export const ROL_ETIQUETA: Record<Role, string> = {
  SUPER_ADMIN: "Super administrador",
  ADMIN: "Administrador",
  SECRETARY: "Secretaría",
  REVIEWER: "Revisión documental",
  EVALUATOR: "Evaluación",
  COMMITTEE: "Comité",
  VIEWER: "Visualizador",
  APPLICANT: "Postulante",
};

/** Etiqueta segura si llega un rol desconocido (datos legacy). */
export function etiquetaRol(rol: string): string {
  return (ROL_ETIQUETA as Record<string, string>)[rol] ?? rol;
}

/**
 * Roles que el actor puede marcar al crear/editar usuarios.
 * SUPER_ADMIN → todos; ADMIN → solo menores; resto → ninguno.
 */
export function rolesAsignablesPara(rolesActor: readonly Role[]): readonly Role[] {
  if (rolesActor.includes("SUPER_ADMIN")) return ROLES_PANEL;
  if (rolesActor.includes("ADMIN")) return ROLES_MENORES;
  return [];
}

/** Menor número = rango más alto. Un rol desconocido cuenta como el más bajo. */
const RANGO_ROL: Record<Role, number> = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  SECRETARY: 2,
  REVIEWER: 3,
  EVALUATOR: 4,
  COMMITTEE: 5,
  VIEWER: 6,
  APPLICANT: 7,
};

function rangoMasAlto(roles: readonly string[]): number {
  if (roles.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...roles.map((rol) => RANGO_ROL[rol as Role] ?? Number.POSITIVE_INFINITY));
}

/**
 * Directorio que el actor puede ver en el panel.
 * SUPER_ADMIN ve a todos. El resto solo ve su rango y los inferiores
 * (un ADMIN no lista superadministradores). El filtro es de interfaz:
 * la API sigue devolviendo el directorio completo.
 */
export function directorioVisiblePara(
  rolesActor: readonly Role[],
  lista: readonly UsuarioDirectorio[],
): readonly UsuarioDirectorio[] {
  // Las cuentas de postulante tienen su propia pantalla y nunca cambian de rol.
  const panel = lista.filter((cuenta) => !cuenta.roles.includes("APPLICANT"));
  if (rolesActor.includes("SUPER_ADMIN")) return panel;
  const techo = rangoMasAlto(rolesActor);
  return panel.filter((cuenta) => rangoMasAlto(cuenta.roles) >= techo);
}

export const WORKFLOW_STATUS = [
  "DRAFT",
  "DOCUMENT_REVIEW",
  "READY_FOR_EVALUATION",
  "EVALUATION_IN_PROGRESS",
  "EVALUATED",
  "DISQUALIFIED",
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
  DISQUALIFIED: "Descalificado",
  OBJECTION_PERIOD: "Período de objeciones",
  FINAL_REVIEW: "Revisión final",
  FINALIZED: "Finalizada",
  ARCHIVED: "Archivada",
};

export const PUBLICATION_STATUS = [
  "NOT_PUBLISHED",
  "DRAFT",
  "PENDING_APPROVAL",
  "PUBLISHED",
  "WITHDRAWN",
] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUS)[number];

export const PUBLICACION_ETIQUETA: Record<PublicationStatus, string> = {
  NOT_PUBLISHED: "No publicado",
  DRAFT: "Borrador de publicación",
  PENDING_APPROVAL: "Pendiente de aprobación",
  PUBLISHED: "Publicado",
  WITHDRAWN: "Retirado",
};

/** Etiqueta legible para publicationStatus; fallback sin códigos crudos. */
export function etiquetarPublicacion(status: string): string {
  if (status in PUBLICACION_ETIQUETA) {
    return PUBLICACION_ETIQUETA[status as PublicationStatus];
  }
  return status
    .toLowerCase()
    .split("_")
    .map((p) => (p ? p[0]!.toUpperCase() + p.slice(1) : p))
    .join(" ");
}

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
  /** Identificador interno. Lleva a la ficha del ranking (opiniones y objeción). */
  readonly candidateId?: string;
  /** El perfil ya está en el sitio público (landing fuera de uso). */
  readonly published?: boolean;
  /** Opiniones de visualizadores. Opcional mientras la API no lo devuelva. */
  readonly opinionCount?: number;
}

// ------------------------------------------------- visualizadores (diputados)

/** Opinión de un visualizador: comentario sin efecto en el proceso. No se borra. */
export const opinionSchema = z.object({
  body: z
    .string()
    .trim()
    .min(10, "La opinión debe tener al menos 10 caracteres")
    .max(2000, "La opinión no puede superar 2000 caracteres"),
});
export type OpinionInput = z.infer<typeof opinionSchema>;

export interface OpinionPostulante {
  readonly id: string;
  readonly body: string;
  readonly createdAt: string;
  readonly author: { readonly fullName: string };
}

/**
 * Objeción presentada por un visualizador autenticado. La identidad la pone
 * el servidor desde la sesión: no hay nombre, cédula, correo ni código.
 */
export const objecionVisualizadorSchema = z
  .object({
    /** Cédula de quien objeta (V/E + 6 a 9 dígitos): aparece en el PDF. */
    objectorNationalId: z
      .string()
      .trim()
      .regex(/^[VE]-\d{6,9}$/, "Indique su cédula: entre 6 y 9 dígitos"),
    causes: z.array(z.string()).min(1, "Seleccione al menos una causal"),
    otherCause: z.string().trim().max(500).optional(),
    description: z
      .string()
      .trim()
      .min(50, "Describa los hechos (mínimo 50 caracteres)")
      .max(8000, "La descripción no puede superar 8000 caracteres"),
    evidenceUrl: z
      .string()
      .trim()
      .url("El enlace de las pruebas no es válido")
      .max(2000, "El enlace es demasiado largo"),
  })
  .superRefine((valor, ctx) => {
    if (valor.causes.includes("OTHER") && !valor.otherCause?.trim()) {
      ctx.addIssue({ code: "custom", path: ["otherCause"], message: "Indique la otra razón" });
    }
  });
export type ObjecionVisualizadorInput = z.infer<typeof objecionVisualizadorSchema>;

/** Estado de la objeción tal como lo ve quien la presentó. */
export const ESTADO_PUBLICO_OBJECION: Record<string, string> = {
  RECEIVED: "Recibida",
  UNDER_REVIEW: "En revisión",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada",
};

export interface MiObjecion {
  readonly trackingCode: string;
  readonly receivedAt: string;
  readonly publicStatus: string;
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

/** Salas admitidas al crear expediente (contrato API vigente). */
export const CHAMBERS = [
  "CONSTITUCIONAL",
  "POLITICO_ADMINISTRATIVA",
  "ELECTORAL",
  "CASACION_CIVIL",
  "CASACION_PENAL",
  "CASACION_SOCIAL",
  "PLENA",
] as const;
export type Chamber = (typeof CHAMBERS)[number];

/** Etiquetas de sala; incluye valores legacy por si llegan en listados antiguos. */
export const SALA_ETIQUETA: Record<string, string> = {
  CONSTITUCIONAL: "Constitucional",
  POLITICO_ADMINISTRATIVA: "Político-Administrativa",
  ELECTORAL: "Electoral",
  CASACION_CIVIL: "Casación Civil",
  CASACION_PENAL: "Casación Penal",
  CASACION_SOCIAL: "Casación Social",
  PLENA: "Plena",
  SOCIAL: "Sala Social",
};

export {
  DOCUMENT_CATEGORY,
  CATEGORIA_ETIQUETA,
  type DocumentCategory,
  BLOCK_LABEL,
  BLOQUE_ETIQUETA,
  BLOCK_IDS,
  ORDEN_BLOQUES,
  type BlockId,
  RECAUDOS,
  categoryDesdeSlotKey,
  slotKeyDesdeCategory,
  esExtraibleConIa,
  recaudoPorSlotKey,
  recaudoPorCategory,
  esCategoryConocida,
  ordenBloquesRevision,
} from "./recaudos";
import type { DocumentCategory } from "./recaudos";

export const PREFIJOS_TELEFONO = ["0412", "0414", "0416", "0422", "0424", "0426"] as const;
export type PrefijoTelefono = (typeof PREFIJOS_TELEFONO)[number];

/** Alineado a civis-api: V / E / J, 6–9 dígitos. */
export const nationalIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[VEJ]-?\d{6,9}$/, "Formato esperado: V-12345678 (también E o J; 6 a 9 dígitos)")
  .transform((v) => {
    const limpio = v.replace(/[^VEJ0-9]/gi, "").toUpperCase();
    const prefijo = limpio[0] === "E" || limpio[0] === "J" || limpio[0] === "V" ? limpio[0] : "V";
    const digitos = limpio.replace(/^[VEJ]/, "");
    return `${prefijo}-${digitos}`;
  });

const nombrePersonaSchema = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(80, "Máximo 80 caracteres")
  .regex(
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/,
    "Sólo letras y espacios (sin números ni signos)",
  );

export const telefonoVeSchema = z
  .string()
  .trim()
  .regex(/^0(412|414|416|422|424|426) \d{7}$/, "Formato esperado: 0424 1234567");

export const crearExpedienteSchema = z.object({
  nationalId: nationalIdSchema,
  firstName: nombrePersonaSchema,
  lastName: nombrePersonaSchema,
  chamber: z.enum(CHAMBERS, { message: "Seleccione la sala" }),
  publicSummary: z.string().trim().max(1200).optional(),
  email: z.string().trim().toLowerCase().email("Correo inválido").optional().or(z.literal("")),
  phone: telefonoVeSchema.optional().or(z.literal("")),
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
  readonly category: DocumentCategory | string;
  readonly originalName: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly scanStatus: "PENDING" | "CLEAN" | "INFECTED" | "SKIPPED" | "ERROR";
  readonly verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  readonly classification: "PRIVATE" | "REDACTED" | "PUBLIC";
  readonly uploadedAt: string;
  readonly version: number;
  /** Id del documento que este archivo sustituyó. La versión citada deja de mostrarse. */
  readonly replacesId?: string | null;
  /** Campos capturados en revisión documental (propuestos por IA o a mano). */
  readonly reviewData?: Record<string, unknown> | null;
  /** Fecha de la revisión documental. Sin ella el dictamen no puede citar el documento. */
  readonly reviewedAt?: string | null;
}

export interface ExpedienteListado {
  readonly id: string;
  readonly publicId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly nationalId: string;
  /** Puede incluir el valor legacy SOCIAL en datos antiguos. */
  readonly chamber: Chamber | string;
  readonly workflowStatus: WorkflowStatus;
  /** AUTOPOSTULACION si lo creó el propio postulante, sin la secretaría. */
  readonly origin?: "SECRETARIA" | "AUTOPOSTULACION";
  /** Autopostulación: cuándo lo envió el postulante a revisión. */
  readonly selfSubmittedAt?: string | null;
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
  /** Revisión documental en curso. Sólo viene si el bloqueo sigue vigente. */
  readonly reviewLock?: BloqueoRevision | null;
}

/** Quién tiene abierto un expediente en revisión. Vence a los 15 min sin actividad. */
export interface BloqueoRevision {
  readonly fullName: string;
  readonly lastActivityAt: string;
  readonly expiresAt: string;
  /** El bloqueo es de quien consulta. */
  readonly mio: boolean;
}

export interface ExpedienteDetalle extends ExpedienteListado {
  readonly email: string | null;
  readonly phone: string | null;
  /** Cuenta del postulante (civis-postulacion). Null si no tiene cuenta. */
  readonly applicantUserId?: string | null;
  /** Último motivo de devolución de la revisión; se limpia al reenviar. */
  readonly returnReason?: string | null;
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

export const CAUSA_DENUNCIA_ETIQUETA: Record<string, string> = {
  EXCLUSIVE_NATIONALITY: "Falta de nacionalidad originaria exclusiva",
  LACK_OF_HONOR: "Carencia de reconocida honorabilidad y conducta ética",
  INSUFFICIENT_CAREER: "Insuficiencia en la trayectoria profesional (menos de 15 años)",
  MISSING_TITULAR_PROFESSOR: "Falta de rango de profesor titular",
  MISSING_JUDICIAL_RANK: "Falta de jerarquía judicial mínima",
  MISSING_POSTGRADUATE: "Carencia de formación de posgrado",
  POLITICAL_MILITANCY: "Militancia política activa o proselitismo",
  STATE_CONTRACTS: "Conflicto de interés por contrataciones con el Estado",
  KINSHIP_HIGH_OFFICIALS: "Parentesco con altos funcionarios",
  INCOMPATIBLE_MARRIAGE: "Unión conyugal incompatible",
  KINSHIP_NOMINATION_COMMITTEE: "Parentesco con el Comité de Postulaciones",
  FIRM_SANCTION: "Inhabilitación o sanción firme",
  PROVEN_MENTAL_INCAPACITY: "Incapacidad mental comprobada",
  OTHER: "Otro",
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

/** Situación de un postulante objetado frente a la re-evaluación del comité. */
export type SituacionObjecion = "PENDIENTE" | "ESCALADA" | "EN_RONDA" | "REEVALUADO" | "INELEGIBLE";

/** Una fila de la bandeja de objeciones: un postulante, sin datos de quien objetó. */
export interface PostulanteObjetado {
  readonly candidateId: string;
  readonly fullName: string;
  readonly chamber: Chamber | string;
  readonly workflowStatus: WorkflowStatus;
  readonly total: number;
  readonly abiertas: number;
  /** Objeciones llegadas después de cerrarse la última ronda (o todas, si no hubo). */
  readonly nuevas: number;
  readonly primeraAt: string;
  readonly ultimaAt: string;
  readonly situacion: SituacionObjecion;
  readonly ronda: {
    readonly id: string;
    readonly status: "OPEN" | "CLOSED" | "ESCALATED";
    readonly openedAt: string;
    readonly closedAt: string | null;
    readonly actuaron: number;
    readonly participantes: number;
    readonly motivo: string | null;
  } | null;
  readonly nota: {
    readonly anterior: number | null;
    readonly actual: number | null;
    readonly inelegible: boolean;
  };
}

// ─────────────────────────────────────────── usuarios y bitácora

export interface UsuarioDirectorio {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly status: "ACTIVE" | "SUSPENDED";
  /** Participa en rondas de comité (tope configurable en portal). */
  readonly committeeActive: boolean;
  readonly mustChangePassword: boolean;
  readonly lastLoginAt: string | null;
  readonly roles: readonly Role[];
}

export type EvaluationMode = "INDIVIDUAL" | "COMMITTEE";

export interface AjustesPortal {
  /** Objeciones públicas desde la landing (solo SUPER_ADMIN lo cambia). */
  readonly objectionsOpen: boolean;
  /** «Objetar» visible para los visualizadores (SUPER_ADMIN y ADMIN). */
  readonly viewerObjectionsOpen: boolean;
  /** «Actualizar en el ranking público» visible para ADMIN y evaluadores (SUPER_ADMIN). */
  readonly publicRefreshEnabled: boolean;
  readonly evaluationMode: EvaluationMode;
  readonly maxActiveEvaluators: number;
  readonly quorumThreshold: number;
  readonly roundDeadlineDays: number;
  /** Cierre de postulaciones: sin expedientes nuevos ni primer envío (SUPER_ADMIN). */
  readonly applicationsClosed: boolean;
  readonly applicationsClosedAt: string | null;
  /** Inicio del lapso de objeciones fijado a mano; null = el día hábil siguiente al cierre. */
  readonly objectionPeriodStart: string | null;
  readonly objectionPeriodDays: number;
  /** true: el lapso de objeciones se cuenta en días hábiles. */
  readonly objectionBusinessDays: boolean;
  readonly admissionDays: number;
  readonly descargoDays: number;
  readonly verificationDays: number;
  /** Feriados `AAAA-MM-DD`. */
  readonly holidays: readonly string[];
  readonly calendario: CalendarioProceso;
}

/** Ajustes mientras la API no responde: todo cerrado y los plazos legales. */
export const AJUSTES_PORTAL_POR_DEFECTO: AjustesPortal = {
  objectionsOpen: false,
  viewerObjectionsOpen: false,
  publicRefreshEnabled: false,
  evaluationMode: "INDIVIDUAL",
  maxActiveEvaluators: 7,
  quorumThreshold: 5,
  roundDeadlineDays: 5,
  applicationsClosed: false,
  applicationsClosedAt: null,
  objectionPeriodStart: null,
  objectionPeriodDays: 15,
  objectionBusinessDays: true,
  admissionDays: 8,
  descargoDays: 3,
  verificationDays: 5,
  holidays: [],
  calendario: {
    pendiente: true,
    cierrePostulaciones: null,
    periodos: [],
    finLapsoObjeciones: null,
    finAdmision: null,
  },
};

export const PERIODOS_PROCESO = [
  "LAPSO_OBJECIONES",
  "ADMISION",
  "DESCARGOS",
  "COMPROBACION",
] as const;
export type ClavePeriodo = (typeof PERIODOS_PROCESO)[number];

export interface PeriodoProceso {
  readonly clave: ClavePeriodo;
  readonly titulo: string;
  readonly detalle: string;
  /** `AAAA-MM-DD` en hora de Caracas, ambos incluidos. */
  readonly inicio: string;
  readonly fin: string;
}

/** Calendario estimado del proceso que calcula la API. */
export interface CalendarioProceso {
  readonly pendiente: boolean;
  readonly cierrePostulaciones: string | null;
  readonly periodos: readonly PeriodoProceso[];
  readonly finLapsoObjeciones: string | null;
  readonly finAdmision: string | null;
}

/** Duraciones del proceso que el superadministrador puede alargar. */
export const plazosProcesoSchema = z.object({
  objectionPeriodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida")
    .nullable(),
  objectionPeriodDays: z.coerce.number().int().min(1, "Mínimo 1 día").max(60, "Máximo 60 días"),
  objectionBusinessDays: z.boolean(),
  admissionDays: z.coerce.number().int().min(1, "Mínimo 1 día").max(60, "Máximo 60 días"),
  descargoDays: z.coerce.number().int().min(1, "Mínimo 1 día").max(30, "Máximo 30 días"),
  verificationDays: z.coerce.number().int().min(1, "Mínimo 1 día").max(60, "Máximo 60 días"),
  holidays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use el formato AAAA-MM-DD")).max(200),
});
export type PlazosProceso = z.infer<typeof plazosProcesoSchema>;

export type EvaluationRoundKind = "ELIGIBILITY" | "SCORING" | "OBJECTION";

export type RoundParticipantAction =
  "PENDING" | "SCORED" | "ABSTAINED" | "NO_SHOW" | "RECUSED" | "VOTED_INELIGIBLE";

export interface ParticipanteRondaComite {
  readonly id: string;
  readonly evaluatorId: string;
  readonly action: RoundParticipantAction;
  readonly actedAt: string | null;
  readonly evaluationId: string | null;
  readonly evaluator: { readonly fullName: string };
}

/**
 * Recuento sin nombres. Quién votó, puntuó o se abstuvo sólo lo ve SUPER_ADMIN:
 * a los demás la API les devuelve únicamente su propia participación.
 */
export interface ResumenParticipacion {
  readonly total: number;
  readonly pendientes: number;
}
export type ReopenCommitteeReason = "TIE" | "DEADLINE";

export interface TallyRondaElegibilidad {
  readonly actuaciones: number;
  readonly elegibles: number;
  readonly inelegibles: number;
  readonly recusados: number;
  readonly pending: number;
  readonly quorumMet: boolean;
  readonly quorumThreshold: number;
}

export interface RondaComiteAbierta {
  readonly id: string;
  readonly candidateId: string;
  readonly kind: EvaluationRoundKind;
  readonly status: "OPEN" | "CLOSED" | "ESCALATED";
  readonly quorumThreshold: number;
  readonly deadlineAt: string | null;
  readonly participants: readonly ParticipanteRondaComite[];
  readonly resumenParticipacion?: ResumenParticipacion;
  readonly closedAt?: string | null;
  readonly result?: unknown;
  /** Solo SUPER_ADMIN en rondas de elegibilidad. */
  readonly tally?: TallyRondaElegibilidad;
}

/** Ronda ELIGIBILITY ESCALATED pendiente de resolución administrativa. */
export interface RondaEscaladaLista {
  readonly id: string;
  readonly candidateId: string;
  readonly kind: EvaluationRoundKind;
  readonly status: "ESCALATED";
  readonly quorumThreshold: number;
  readonly deadlineAt: string | null;
  readonly closedAt: string | null;
  readonly result: unknown;
  readonly participants: readonly {
    readonly id: string;
    readonly evaluatorId: string;
    readonly action: RoundParticipantAction;
    readonly actedAt: string | null;
    readonly evaluator: { readonly fullName: string };
  }[];
  readonly resumenParticipacion?: ResumenParticipacion;
  readonly candidate: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly chamber: Chamber;
    readonly workflowStatus: WorkflowStatus;
    readonly receivedAt: string;
    readonly submissions: readonly {
      readonly fileNumber: string;
      readonly _count: { readonly documents: number };
    }[];
  };
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

// ─────────────────────────────────────────── informes

export interface InformeListado {
  readonly id: string;
  readonly version: number;
  readonly status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "WITHDRAWN";
  readonly sha256: string;
  readonly createdAt: string;
  readonly publishedAt: string | null;
  readonly withdrawnAt: string | null;
  readonly approvalReason: string | null;
  readonly preparedBy: { readonly fullName: string } | null;
  readonly approvedBy: { readonly fullName: string } | null;
}

export const generarInformeSchema = z.object({
  cutoffAt: z.string().optional(),
});

export const publicarInformeSchema = z.object({
  reason: z.string().trim().min(10, "La aprobación debe estar motivada").max(1000),
});

// ─────────────────────────────────────────── revisión documental

export interface DocumentoEnRevision {
  readonly id: string;
  readonly publicId: string;
  readonly category: DocumentCategory | string;
  readonly originalName: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly scanStatus: string;
  readonly verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  readonly classification: "PRIVATE" | "REDACTED" | "PUBLIC";
  readonly uploadedAt: string;
  readonly version: number;
  readonly reviewData?: Record<string, unknown> | null;
  readonly submission: {
    readonly fileNumber: string;
    readonly candidate: {
      readonly id: string;
      readonly firstName: string;
      readonly lastName: string;
      readonly chamber: Chamber | string;
    };
  };
  readonly uploadedBy: { readonly fullName: string } | null;
}

export const verificarDocumentoSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  reason: z.string().trim().min(5, "Indique el motivo").max(1000),
});

export const clasificarDocumentoSchema = z.object({
  classification: z.enum(["PRIVATE", "REDACTED", "PUBLIC"]),
  reason: z.string().trim().min(5, "Indique el motivo").max(1000),
});

// ─────────────────────────────────────────── vista previa pública

export interface FichaPublica {
  readonly publicId: string;
  readonly slug: string;
  readonly fullName: string;
  readonly chamber: Chamber;
  readonly total: number;
  readonly band: SuitabilityBand;
  readonly ineligible: boolean;
  readonly position: number | null;
  readonly tied: boolean;
  readonly provisional: boolean;
  readonly publicSummary: string | null;
  readonly rubricVersion: string;
  readonly hasFoundedObjections: boolean;
  readonly objectedCredentials: readonly string[];
  readonly breakdown: readonly {
    readonly dimensionKey: string;
    readonly label: string;
    readonly points: number;
    readonly maxPoints: number;
  }[];
  readonly documents: readonly {
    readonly publicId: string;
    readonly label: string;
    readonly category: string;
    readonly sizeBytes: number;
  }[];
}

// ─────────────────────────────────────────── historial de evaluación

export interface AjusteEvaluacion {
  readonly id: string;
  readonly criterionKey: string;
  readonly previousValue: string;
  readonly newValue: string;
  readonly reason: string;
  readonly createdAt: string;
  readonly requestedBy: { readonly fullName: string } | null;
}

export interface EvaluacionHistorial {
  readonly id: string;
  readonly status: "DRAFT" | "SUBMITTED" | "APPROVED" | "SUPERSEDED";
  readonly totalPoints: string;
  readonly band: string;
  readonly ineligible: boolean;
  readonly ineligibilityReasons: readonly string[];
  readonly createdAt: string;
  readonly submittedAt: string | null;
  readonly approvedAt: string | null;
  readonly supersededAt: string | null;
  readonly version: number;
  readonly rubric: { readonly version: string };
  readonly evaluator: { readonly fullName: string } | null;
  readonly approvedBy: { readonly fullName: string } | null;
  readonly adjustments: readonly AjusteEvaluacion[];
}

export const cambiarRolesSchema = z.object({
  roles: z.array(z.enum(ROLES)).min(1, "Asigne un rol").max(1, "Solo puede asignar un rol"),
  reason: z.string().trim().min(10, "Indique el motivo (mínimo 10 caracteres)").max(1000),
});

export const solicitarInfoSchema = z.object({
  reason: z.string().trim().min(15, "Indique qué información falta").max(2000),
});

export const retirarPublicacionSchema = z.object({
  reason: z.string().trim().min(10, "El retiro debe estar motivado").max(1000),
});

/** `abrir()` devuelve el modelo completo con sus relaciones, pero **no** el
 *  agregado `_count` de la bandeja: aquí llegan las listas enteras. */
export interface ObjecionDetalle extends Omit<ObjecionBandeja, "_count"> {
  /** Datos del objetante. Sólo llegan al abrir la objeción, y esa apertura
   *  queda registrada en la bitácora. */
  readonly objectorFullName: string;
  readonly objectorNationalId: string | null;
  readonly objectorEmail: string;
  readonly objectorPhone: string | null;
  readonly description: string;
  readonly resolution: string | null;
  readonly privacyConsentAt: string;
  readonly attachments: readonly {
    readonly id: string;
    readonly originalName: string;
    readonly sizeBytes: number;
    readonly sha256: string;
    readonly scanStatus: string;
  }[];
  readonly adjustments: readonly {
    readonly id: string;
    readonly criterionKey: string;
    readonly previousValue: string;
    readonly newValue: string;
    readonly reason: string;
    readonly requestedBy: { readonly fullName: string } | null;
  }[];
}

export {
  baremoSchema,
  type BaremoInput,
  type BaremoListado,
  type BaremoDetalle,
  type BaremoCriterioDetalle,
  type BaremoRangoDetalle,
  puntosBaremo,
} from "./baremo-dinamico";

// ------------------------------------------------------- teléfono del postulante

/**
 * Teléfono venezolano en formato nacional (11 dígitos): 0 + código + 7.
 * Móviles 0412/0422 (Digitel), 0414/0424 (Movistar), 0416/0426 (Movilnet);
 * fijos 02XX. Espejo de civis-api `contracts/postulacion.ts`.
 */
export const TELEFONO_VE = /^0(?:2\d{2}|4(?:12|14|16|22|24|26))\d{7}$/;

/** Deja sólo dígitos y pasa +58XXXXXXXXXX a 0XXXXXXXXXX. */
export function normalizarTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 12 && digitos.startsWith("58")) return `0${digitos.slice(2)}`;
  if (digitos.length === 10 && !digitos.startsWith("0")) return `0${digitos}`;
  return digitos;
}

export const MENSAJE_TELEFONO =
  "Teléfono venezolano de 11 dígitos, p. ej. 04141234567 (móvil) o 02121234567 (fijo)";

// ------------------------------------------------------- comité y descargos

/** Respuesta del postulante a una objeción. El adjunto es opcional. */
export interface Descargo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly originalName: string | null;
  readonly detectedMime: string | null;
  readonly sizeBytes: number | null;
  readonly submittedVia: "POSTULANTE" | "SECRETARIA";
  readonly createdAt: string;
}

/** Etapa legal de la objeción (LOTSJ arts. 71 y 72). */
export const ETAPAS_OBJECION = [
  "RECIBIDA",
  "ADMITIDA",
  "INADMITIDA",
  "EN_DESCARGO",
  "DESCARGO_PRESENTADO",
  "SIN_DESCARGO",
  "CON_LUGAR",
  "SIN_LUGAR",
] as const;
export type EtapaObjecion = (typeof ETAPAS_OBJECION)[number];

export const ETAPA_OBJECION_ETIQUETA: Record<EtapaObjecion, string> = {
  RECIBIDA: "Recibida",
  ADMITIDA: "Admitida · por notificar",
  INADMITIDA: "Inadmitida",
  EN_DESCARGO: "Admitida · en descargo",
  DESCARGO_PRESENTADO: "Con descargo",
  SIN_DESCARGO: "Sin descargos",
  CON_LUGAR: "Con lugar",
  SIN_LUGAR: "Sin lugar",
};

export type TipoAuto = "ADMISION" | "INADMISION" | "CON_LUGAR" | "SIN_LUGAR";

export const AUTO_ETIQUETA: Record<TipoAuto, string> = {
  ADMISION: "Auto de admisión",
  INADMISION: "Auto de inadmisión",
  CON_LUGAR: "Auto de decisión: con lugar",
  SIN_LUGAR: "Auto de decisión: sin lugar",
};

/** Auto del comité. El PDF se descarga por /api/autos/:objectionId/:id. */
export interface AutoObjecion {
  readonly id: string;
  readonly kind: TipoAuto;
  readonly number: string;
  readonly createdAt: string;
}

/**
 * Bandeja del comité:
 * - RECIBIDAS: esperan la admisión.
 * - POR_NOTIFICAR: admitidas o inadmitidas que se notifican al día siguiente
 *   del último día de admisión.
 * - EN_DESCARGO: notificadas; corre el plazo del postulante.
 * - POR_DECIDIR: con descargo o sin él (vencido); comprobación y decisión.
 * - DECIDIDAS: inadmitidas ya notificadas, con lugar o sin lugar.
 */
export const ETAPAS_COMITE = [
  "RECIBIDAS",
  "POR_NOTIFICAR",
  "EN_DESCARGO",
  "POR_DECIDIR",
  "DECIDIDAS",
] as const;
export type EtapaComite = (typeof ETAPAS_COMITE)[number];

/** Dónde estamos respecto de una ventana de plazos: antes, dentro o vencida. */
export type MomentoPlazo = "ANTES" | "DENTRO" | "DESPUES";

export interface PlazosComite {
  readonly descargoDias: number;
  readonly admisionDias: number;
  readonly comprobacionDias: number;
  readonly finLapsoObjeciones: string | null;
  /** Primer día en que el comité puede pronunciarse sobre la admisión. */
  readonly inicioAdmision: string | null;
  readonly finAdmision: string | null;
  /** Hoy respecto de los días de admisión. Sin calendario, siempre DENTRO. */
  readonly admision: MomentoPlazo;
  /** Cuándo se notifican los pronunciamientos dados en plazo. */
  readonly notificacion: string | null;
  /** Alguno de los lapsos de objeciones sigue abierto. */
  readonly lapsoAbierto: boolean;
}

/** Bloqueo de la objeción: un solo miembro del comité la trabaja a la vez. */
export interface BloqueoComite {
  readonly fullName: string;
  readonly lastActivityAt: string;
  readonly expiresAt: string;
  readonly mio: boolean;
}

/** Fila de la bandeja del comité: una objeción, sin identidad del objetante. */
export interface ObjecionComite {
  readonly id: string;
  readonly trackingCode: string;
  readonly causes: readonly string[];
  /** Categoría de las objeciones antiguas, que no traen causales. */
  readonly category: string;
  readonly receivedAt: string;
  readonly stage: EtapaObjecion;
  readonly notificationDueAt: string | null;
  readonly notifiedAt: string | null;
  readonly descargoDueAt: string | null;
  readonly verificationDueAt: string | null;
  readonly noDescargoAt: string | null;
  readonly finalDecidedAt: string | null;
  readonly forwardedAt: string | null;
  readonly etapa: EtapaComite;
  readonly bloqueo: BloqueoComite | null;
  readonly descargo: { readonly createdAt: string; readonly submittedVia: string } | null;
  readonly candidate: {
    readonly id: string;
    readonly fullName: string;
    readonly chamber: string;
    readonly origin: "SECRETARIA" | "AUTOPOSTULACION";
    /** true: responde el postulante desde su cuenta; false: la secretaría. */
    readonly conCuenta: boolean;
  };
}

export interface BandejaComite {
  readonly items: readonly ObjecionComite[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly resumen: Record<EtapaComite, number>;
  readonly plazos: PlazosComite;
}

/** Objeción abierta por el comité: con identidad del objetante (se audita). */
export interface ObjecionComiteDetalle {
  readonly id: string;
  readonly trackingCode: string;
  readonly objectorFullName: string;
  readonly objectorNationalId: string | null;
  readonly objectorEmail: string;
  readonly objectorPhone: string | null;
  readonly causes: readonly string[];
  readonly category: string;
  readonly otherCause: string | null;
  readonly description: string;
  readonly evidenceUrl: string;
  readonly receivedAt: string;
  readonly stage: EtapaObjecion;
  readonly admissionDecidedAt: string | null;
  readonly notificationDueAt: string | null;
  /** Motivo de fuerza mayor de un pronunciamiento fuera de plazo. */
  readonly admissionLateReason: string | null;
  readonly decisionLateReason: string | null;
  readonly notifiedAt: string | null;
  readonly descargoDueAt: string | null;
  readonly noDescargoAt: string | null;
  readonly verificationDueAt: string | null;
  readonly finalDecidedAt: string | null;
  readonly committeeNotes: string | null;
  readonly forwardedAt: string | null;
  readonly forwardReason: string | null;
  readonly submittedBy: { readonly fullName: string } | null;
  readonly descargo: Descargo | null;
  readonly autos: readonly AutoObjecion[];
  readonly etapa: EtapaComite;
  readonly bloqueo: BloqueoComite | null;
  /** Ventana de la decisión final: desde que vence el descargo hasta el fin de la comprobación. */
  readonly decision: { readonly desde: string | null; readonly hasta: string | null };
  readonly plazos: PlazosComite;
  readonly candidate: {
    readonly id: string;
    readonly fullName: string;
    readonly chamber: string;
    readonly origin: "SECRETARIA" | "AUTOPOSTULACION";
    readonly conCuenta: boolean;
    readonly workflowStatus: WorkflowStatus;
    readonly fileNumber: string | null;
  };
}

/** Objeción tal como la ven el postulante y la secretaría: sin quién la presentó. */
export interface ObjecionParaDescargo {
  readonly id: string;
  readonly trackingCode: string;
  readonly causes: readonly string[];
  readonly otherCause: string | null;
  readonly description: string;
  readonly evidenceUrl: string;
  readonly receivedAt: string;
  readonly forwardedAt: string | null;
  readonly stage: EtapaObjecion;
  readonly notifiedAt: string | null;
  readonly descargoDueAt: string | null;
  readonly noDescargoAt: string | null;
  readonly finalDecidedAt: string | null;
  readonly descargo: Descargo | null;
  readonly autos: readonly AutoObjecion[];
}

/** El plazo de descargo sigue abierto. */
export function admiteDescargo(
  o: Pick<ObjecionParaDescargo, "stage" | "descargoDueAt" | "descargo">,
  ahora: Date = new Date(),
): boolean {
  return (
    o.stage === "EN_DESCARGO" &&
    o.descargo === null &&
    o.descargoDueAt !== null &&
    new Date(o.descargoDueAt).getTime() > ahora.getTime()
  );
}

/** Consideraciones opcionales del comité, que se añaden a su auto. */
export const consideracionesComiteSchema = z
  .string()
  .trim()
  .max(3000, "Máximo 3000 caracteres")
  .optional();

/** Cuenta del portal del postulante (fuera del directorio del panel). */
export const ESTADOS_CUENTA_POSTULANTE = ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED"] as const;
export type EstadoCuentaPostulante = (typeof ESTADOS_CUENTA_POSTULANTE)[number];

export const ESTADO_CUENTA_ETIQUETA: Record<EstadoCuentaPostulante, string> = {
  PENDING_VERIFICATION: "Sin verificar correo",
  ACTIVE: "Activa",
  SUSPENDED: "Suspendida",
};

export interface CuentaPostulante {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly status: EstadoCuentaPostulante;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
  readonly expediente: {
    readonly candidateId: string;
    readonly nationalId: string;
    readonly workflowStatus: WorkflowStatus;
    readonly fileNumber: string | null;
  } | null;
}

export interface ListaCuentasPostulantes {
  readonly items: readonly CuentaPostulante[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly resumen: Record<EstadoCuentaPostulante, number>;
}

/** Espejo de civis-api `descargoSchema` (campos de texto; el adjunto va aparte). */
export const descargoSchema = z.object({
  title: z.string().trim().min(3, "Título demasiado corto").max(200),
  description: z.string().trim().min(10, "Describa el descargo (mínimo 10 caracteres)").max(5000),
});

// ─────────────────────────────────────────── documentos legales

export type TipoDocumentoLegal = "TERMINOS" | "PRIVACIDAD";
export type EstadoDocumentoLegal = "BORRADOR" | "VIGENTE" | "REEMPLAZADO";

export const TITULO_DOCUMENTO_LEGAL: Record<TipoDocumentoLegal, string> = {
  TERMINOS: "Términos y Condiciones",
  PRIVACIDAD: "Política de Privacidad",
};

/** Una versión en el listado de la superadministración. */
export interface VersionLegal {
  readonly id: string;
  readonly kind: TipoDocumentoLegal;
  readonly version: number;
  readonly title: string;
  readonly status: EstadoDocumentoLegal;
  readonly changeSummary: string | null;
  readonly sha256: string | null;
  readonly publishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedBy: { readonly fullName: string } | null;
  readonly _count: { readonly acceptances: number };
}

/** `GET /internal/legal`: por tipo, vigente, borrador e historial. */
export interface PanelLegal {
  readonly kind: TipoDocumentoLegal;
  readonly titulo: string;
  readonly vigente: VersionLegal | null;
  readonly borrador: VersionLegal | null;
  readonly historial: readonly VersionLegal[];
}

/** `GET /internal/legal/:id`: una versión con su texto. */
export interface DocumentoLegal extends VersionLegal {
  readonly content: string;
  readonly createdBy: { readonly fullName: string } | null;
}

/** Espejo de civis-api `borradorLegalSchema`. */
export const borradorLegalSchema = z.object({
  title: z.string().trim().min(3, "Indique un título").max(200),
  content: z
    .string()
    .trim()
    .min(200, "El texto es demasiado corto para un documento legal")
    .max(200_000),
  changeSummary: z.string().trim().max(2000).optional().or(z.literal("")),
});
