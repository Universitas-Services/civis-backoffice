/**
 * Contratos de formularios de revisión documental (maqueta front).
 * Keys alineadas al futuro payload por tabla/documento.
 *
 * Por cada formulario de revisión:
 * 1. Campos visibles del documento (opcionales; vacío si no se pueden leer).
 * 2. Campo visible común «Nota» ← key `advertencias` (extractor IA / edición manual).
 * 3. Dos campos de IA invisibles en el front:
 *    es_documento, calidad_legibilidad.
 *    (es_documento: semántica según el tipo de documento; misma key en todos.)
 * No hay banner de expediente en los formularios de documento.
 *
 * Regla de auditoría: visibles e invisibles son opcionales. Zod valida formato
 * solo cuando hay escritura.
 */

import { z } from "zod";

export type MetadatosInvisiblesRevision = {
  readonly es_documento: boolean | null;
  readonly calidad_legibilidad: string | null;
  readonly advertencias: string | null;
};

export type ValoresFormularioRevision = Record<string, string | boolean | null>;

/** Campos de IA comunes que no se muestran (salvo `advertencias` → Nota visible). */
export const KEYS_INVISIBLES = ["es_documento", "calidad_legibilidad"] as const;

/** Key del campo visible «Nota» (relleno por el extractor como advertencias). */
export const KEY_NOTA_ADVERTENCIAS = "advertencias" as const;

/** Campos visibles del formulario de cédula. */
export const KEYS_CEDULA_VISIBLES = [
  "cedula_identidad_postulante",
  "nombre_cedula_postulante",
  "apellido_cedula_postulante",
  "estadocivil_cedula_postulante",
  "fechanacimiento_cedula_postulante",
  "vigencia_cedula_postulante",
] as const;

export type KeyCedulaVisible = (typeof KEYS_CEDULA_VISIBLES)[number];

/** Prefijos UI (V/E) para cédulas en formularios de revisión. */
export const KEY_PREFIJO_CEDULA = "prefijo_cedula";
export const KEY_PREFIJO_CEDULA_PADRE = "prefijo_cedula_padre";
export const KEY_PREFIJO_CEDULA_MADRE = "prefijo_cedula_madre";
export const KEY_PREFIJO_CEDULA_DECLARANTE_OTRA =
  "prefijo_cedula_declarante_otranacionalidad";

/** Campos visibles del formulario de partida de nacimiento. */
export const KEYS_PARTIDA_VISIBLES = [
  "nombre_partida_postulante",
  "apellido_partida_postulante",
  "fechanacimiento_partida_postulante",
  "nombrepadre_partida_postulante",
  "nacionalidadpadre_partida_postulante",
  "cedulapadre_partida_postulante",
  "nombremadre_partida_postulante",
  "nacionalidadmadre_partida_postulante",
  "cedulamadre_partida_postulante",
  "nombrejefatura_partida_postulante",
  "numeroacta_partida_postulante",
  "tomo_partida_postulante",
  "año_partida_postulante",
] as const;

export type KeyPartidaVisible = (typeof KEYS_PARTIDA_VISIBLES)[number];

/** Campos visibles: DJ no poseer otra nacionalidad. */
export const KEYS_DJ_OTRA_NACIONALIDAD_VISIBLES = [
  "nombre_declarante_otranacionalidad",
  "apellido_declarante_otranacionalidad",
  "estadocivil_declarante_otranacionalidad",
  "cedula_declarante_otranacionalidad",
  "noposee_declaracion",
  "renuncia_otranacionalidad",
  "estado_otranacionalidad",
  "municipio_otranacionalidad",
  "nombrenotaria_otranacionalidad",
  "numerofolio_otranacionalidad",
  "numerotomo_otranacionalidad",
  "fechaotorgamiento_otranacionalidad",
] as const;

export type KeyDjOtraNacionalidadVisible =
  (typeof KEYS_DJ_OTRA_NACIONALIDAD_VISIBLES)[number];

/** Campos visibles: solvencia moral y deontológica. */
export const KEYS_SOLVENCIA_DEONTOLOGICA_VISIBLES = [
  "nombre_entidad_deontologica",
  "estado_entidad_deontologica",
  "municipio_entidad_deontologica",
  "direccion_entidad_deontologica",
  "nombre_quiensuscribe_deontologica",
  "cedula_quiensuscribe_deontologica",
  "cargo_quiensuscribe_deontologica",
  "inpreabogado_quiensuscribe_deontologica",
  "nombre_postulante_deontologica",
  "apellido_postulante_deontologica",
  "cedula_postulante_deontologica",
  "inpreabogado_postulante_deontologica",
  "declaracion_solvencia_deontologica",
  "fecha_expedicion_deontologica",
] as const;

export type KeySolvenciaDeontologicaVisible =
  (typeof KEYS_SOLVENCIA_DEONTOLOGICA_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD =
  "prefijo_cedula_profesional_salud";
export const KEY_PREFIJO_CEDULA_POSTULANTE_SALUD =
  "prefijo_cedula_postulante_salud";

/** Campos visibles: certificación médica / capacidad mental. */
export const KEYS_CERT_MEDICA_MENTAL_VISIBLES = [
  "nombre_profesional_salud",
  "cedula_profesional_salud",
  "profesion_profesional_salud",
  "colegiacion_profesional_salud",
  "nombre_postulante_salud",
  "apellido_postulante_salud",
  "cedula_postulante_salud",
  "conclusion_diagnostica_salud",
  "fecha_expedicion_salud",
] as const;

export type KeyCertMedicaMentalVisible =
  (typeof KEYS_CERT_MEDICA_MENTAL_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_PENALES =
  "prefijo_cedula_postulante_penales";

/** Campos visibles: certificado de antecedentes penales. */
export const KEYS_ANTECEDENTES_PENALES_VISIBLES = [
  "nombre_entidad_penales",
  "nombre_quiensuscribe_penales",
  "cargo_quiensuscribe_penales",
  "designacion_quiensuscribe_penales",
  "nombre_postulante_penales",
  "apellido_postulante_penales",
  "cedula_postulante_penales",
  "dictamen_expreso_penales",
  "codigo_verificacion_penales",
  "fecha_suscripcion_penales",
] as const;

export type KeyAntecedentesPenalesVisible =
  (typeof KEYS_ANTECEDENTES_PENALES_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_CGR = "prefijo_cedula_postulante_cgr";

/** Campos visibles: certificación CGR de no inhabilitación. */
export const KEYS_CONTRALORIA_CGR_VISIBLES = [
  "nombre_direccion_cgr",
  "nombre_quiensuscribe_cgr",
  "cargo_quiensuscribe_cgr",
  "designacion_quiensuscribe_cgr",
  "nombre_postulante_cgr",
  "apellido_postulante_cgr",
  "cedula_postulante_cgr",
  "dictamen_expreso_cgr",
  "codigo_verificacion_cgr",
  "fecha_suscripcion_cgr",
] as const;

export type KeyContraloriaCgrVisible = (typeof KEYS_CONTRALORIA_CGR_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_PREGRADO =
  "prefijo_cedula_postulante_pregrado";

/** Campos visibles: título de pregrado de abogado. */
export const KEYS_TITULO_PREGRADO_VISIBLES = [
  "nombre_universidad_pregrado",
  "nombre_rector_pregrado",
  "nombre_secretario_pregrado",
  "titulo_postulante_pregrado",
  "nombre_postulante_pregrado",
  "apellido_postulante_pregrado",
  "cedula_postulante_pregrado",
  "mencion_honor_pregrado",
  "fecha_graduacion_pregrado",
  "registro_publico_pregrado",
  "numero_asentamiento_pregrado",
  "tomo_registro_pregrado",
  "folio_registro_pregrado",
  "fecha_protocolizacion_pregrado",
] as const;

export type KeyTituloPregradoVisible = (typeof KEYS_TITULO_PREGRADO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_ESPECIALIDAD =
  "prefijo_cedula_postulante_especialidad";

/** Campos visibles: título de especialización jurídica. */
export const KEYS_TITULO_ESPECIALIDAD_VISIBLES = [
  "nombre_universidad_especialidad",
  "nombre_rector_especialidad",
  "nombre_secretario_especialidad",
  "rama_especialidad_derecho",
  "nombre_pregrado_especialidad",
  "nombre_postulante_especialidad",
  "apellido_postulante_especialidad",
  "cedula_postulante_especialidad",
  "fecha_graduacion_especialidad",
  "registro_publico_especialidad",
  "numero_asentamiento_especialidad",
  "tomo_registro_especialidad",
  "folio_registro_especialidad",
  "fecha_protocolizacion_especialidad",
] as const;

export type KeyTituloEspecialidadVisible =
  (typeof KEYS_TITULO_ESPECIALIDAD_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_TEG =
  "prefijo_cedula_postulante_teg";

/** Campos visibles: constancia aprobación TEG especialización. */
export const KEYS_CONSTANCIA_TEG_VISIBLES = [
  "nombre_universidad_teg",
  "rama_especialidad_teg",
  "titulo_trabajo_grado",
  "nombre_postulante_teg",
  "apellido_postulante_teg",
  "cedula_postulante_teg",
  "jurado_examinador_teg",
  "veredicto_calificacion_teg",
  "fecha_defensa_teg",
] as const;

export type KeyConstanciaTegVisible = (typeof KEYS_CONSTANCIA_TEG_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_MAESTRIA =
  "prefijo_cedula_postulante_maestria";

/** Campos visibles: título de maestría jurídica. */
export const KEYS_TITULO_MAESTRIA_VISIBLES = [
  "nombre_universidad_maestria",
  "nombre_rector_maestria",
  "nombre_secretario_maestria",
  "area_maestria_derecho",
  "nombre_pregrado_maestria",
  "nombre_postulante_maestria",
  "apellido_postulante_maestria",
  "cedula_postulante_maestria",
  "fecha_graduacion_maestria",
  "registro_publico_maestria",
  "numero_asentamiento_maestria",
  "tomo_registro_maestria",
  "folio_registro_maestria",
  "fecha_protocolizacion_maestria",
] as const;

export type KeyTituloMaestriaVisible = (typeof KEYS_TITULO_MAESTRIA_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_MAESTRIA =
  "prefijo_cedula_postulante_tesis_maestria";

/** Campos visibles: constancia aprobación tesis/TEG maestría. */
export const KEYS_CONSTANCIA_MAESTRIA_VISIBLES = [
  "nombre_universidad_tesis_maestria",
  "area_maestria_tesis",
  "titulo_trabajo_maestria",
  "nombre_postulante_tesis_maestria",
  "apellido_postulante_tesis_maestria",
  "cedula_postulante_tesis_maestria",
  "jurado_examinador_maestria",
  "veredicto_calificacion_maestria",
  "fecha_defensa_maestria",
] as const;

export type KeyConstanciaMaestriaVisible =
  (typeof KEYS_CONSTANCIA_MAESTRIA_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO =
  "prefijo_cedula_postulante_doctorado";

/** Campos visibles: título de doctorado en derecho / ciencias jurídicas. */
export const KEYS_TITULO_DOCTORADO_VISIBLES = [
  "nombre_universidad_doctorado",
  "nombre_rector_doctorado",
  "nombre_secretario_doctorado",
  "denominacion_titulo_doctorado",
  "nombre_pregrado_doctorado",
  "nombre_postulante_doctorado",
  "apellido_postulante_doctorado",
  "cedula_postulante_doctorado",
  "fecha_graduacion_doctorado",
  "registro_publico_doctorado",
  "numero_asentamiento_doctorado",
  "tomo_registro_doctorado",
  "folio_registro_doctorado",
  "fecha_protocolizacion_doctorado",
] as const;

export type KeyTituloDoctoradoVisible =
  (typeof KEYS_TITULO_DOCTORADO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO =
  "prefijo_cedula_postulante_tesis_doctorado";

/** Campos visibles: constancia aprobación tesis doctoral. */
export const KEYS_CONSTANCIA_DOCTORADO_VISIBLES = [
  "nombre_universidad_tesis_doctorado",
  "denominacion_titulo_tesis_doctorado",
  "titulo_tesis_doctorado",
  "nombre_postulante_tesis_doctorado",
  "apellido_postulante_tesis_doctorado",
  "cedula_postulante_tesis_doctorado",
  "jurado_examinador_doctorado",
  "veredicto_calificacion_doctorado",
  "fecha_defensa_doctorado",
] as const;

export type KeyConstanciaDoctoradoVisible =
  (typeof KEYS_CONSTANCIA_DOCTORADO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO = "prefijo_cedula_firmante_gremio";
export const KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO =
  "prefijo_cedula_postulante_gremio";

/** Campos visibles: certificación inscripción colegio de abogados. */
export const KEYS_INSCRIPCION_COLEGIO_VISIBLES = [
  "nombre_gremio_emisor",
  "estado_gremio_emisor",
  "direccion_gremio_emisor",
  "nombre_firmante_gremio",
  "cedula_firmante_gremio",
  "cargo_firmante_gremio",
  "inpreabogado_firmante_gremio",
  "nombre_postulante_gremio",
  "apellido_postulante_gremio",
  "cedula_postulante_gremio",
  "inpreabogado_postulante_colegio",
  "fecha_inscripcion_gremio",
  "fecha_expedicion_gremio",
] as const;

export type KeyInscripcionColegioVisible =
  (typeof KEYS_INSCRIPCION_COLEGIO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_SOLVENCIA =
  "prefijo_cedula_quiensuscribe_solvencia";
export const KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_COLEGIO =
  "prefijo_cedula_postulante_solvencia_colegio";

/** Campos visibles: solvencia colegio de abogados. */
export const KEYS_SOLVENCIA_COLEGIO_VISIBLES = [
  "nombre_gremio_emisor_solvencia",
  "estado_gremio_solvencia",
  "direccion_gremio_solvencia",
  "nombre_quiensuscribe_solvencia",
  "cedula_quiensuscribe_solvencia",
  "cargo_quiensuscribe_solvencia",
  "inpreabogado_quiensuscribe_solvencia",
  "nombre_postulante_solvencia",
  "apellido_postulante_solvencia",
  "cedula_postulante_solvencia",
  "inpreabogado_postulante_solvencia",
  "estatus_gremial_solvencia",
  "fecha_suscripcion_solvencia",
  "periodo_vigencia_solvencia",
] as const;

export type KeySolvenciaColegioVisible =
  (typeof KEYS_SOLVENCIA_COLEGIO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO =
  "prefijo_cedula_quiensuscribe_inpreabogado";
export const KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO =
  "prefijo_cedula_postulante_inpreabogado";

/** Campos visibles: inscripción INPREABOGADO. */
export const KEYS_INSCRIPCION_INPREABOGADO_VISIBLES = [
  "nombre_quiensuscribe_inpreabogado",
  "cedula_quiensuscribe_inpreabogado",
  "cargo_quiensuscribe_inpreabogado",
  "numero_quiensuscribe_inpreabogado",
  "nombre_postulante_inpreabogado",
  "apellido_postulante_inpreabogado",
  "cedula_postulante_inpreabogado",
  "inpreabogado_postulante_nacional",
  "fecha_inscripcion_inpreabogado",
  "fecha_expedicion_inpreabogado",
] as const;

export type KeyInscripcionInpreabogadoVisible =
  (typeof KEYS_INSCRIPCION_INPREABOGADO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_FIRMANTE_SOLVENCIA_INPRE =
  "prefijo_cedula_firmante_solvencia_inpre";
export const KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_INPRE =
  "prefijo_cedula_postulante_solvencia_inpre";

/** Campos visibles: solvencia INPREABOGADO. */
export const KEYS_SOLVENCIA_INPREABOGADO_VISIBLES = [
  "nombre_firmante_solvencia_inpreabogado",
  "cedula_firmante_solvencia_inpreabogado",
  "cargo_firmante_solvencia_inpreabogado",
  "inpreabogado_firmante_solvencia",
  "nombre_postulante_solvencia_inpreabogado",
  "apellido_postulante_solvencia_inpreabogado",
  "cedula_postulante_solvencia_inpreabogado",
  "inpreabogado_solicitante_solvencia",
  "dictamen_solvencia_inpreabogado",
  "fecha_expedicion_solvencia_inpreabogado",
  "periodo_vigencia_solvencia_inpreabogado",
] as const;

export type KeySolvenciaInpreabogadoVisible =
  (typeof KEYS_SOLVENCIA_INPREABOGADO_VISIBLES)[number];

/** Campos visibles: prueba documental 15 años ejercicio libre. */
export const KEYS_PRUEBA_EJERCICIO_LIBRE_VISIBLES = [
  "tipo_documento_ejerciciolibre",
  "nombre_postulante_ejerciciolibre",
  "apellido_postulante_ejerciciolibre",
  "inpreabogado_postulante_ejerciciolibre",
  "rol_postulante_ejerciciolibre",
  "fecha_acto_ejerciciolibre",
] as const;

export type KeyPruebaEjercicioLibreVisible =
  (typeof KEYS_PRUEBA_EJERCICIO_LIBRE_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA =
  "prefijo_cedula_postulante_docencia";

/** Campos visibles: certificación servicio docente. */
export const KEYS_CERTIFICACION_DOCENTE_VISIBLES = [
  "nombre_universidad_docencia",
  "facultad_docencia",
  "organo_expedidor_docencia",
  "catedra_impartida_docencia",
  "nivel_docente_docencia",
  "nombre_postulante_docencia",
  "apellido_postulante_docencia",
  "cedula_postulante_docencia",
  "fecha_inicio_docencia",
  "fecha_corte_docencia",
  "condicion_docente_docencia",
  "escalafon_docente_docencia",
] as const;

export type KeyCertificacionDocenteVisible =
  (typeof KEYS_CERTIFICACION_DOCENTE_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE =
  "prefijo_cedula_postulante_concursodocente";

/** Campos visibles: acta concurso oposición docente. */
export const KEYS_ACTA_CONCURSO_DOCENTE_VISIBLES = [
  "nombre_universidad_concursodocente",
  "facultad_concursodocente",
  "catedra_concursodocente",
  "numero_acta_concursodocente",
  "fecha_acta_concursodocente",
  "veredicto_concursodocente",
  "categoria_otorgada_concursodocente",
  "jurado_examinador_concursodocente",
  "nombre_postulante_concursodocente",
  "apellido_postulante_concursodocente",
  "cedula_postulante_concursodocente",
] as const;

export type KeyActaConcursoDocenteVisible =
  (typeof KEYS_ACTA_CONCURSO_DOCENTE_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL =
  "prefijo_cedula_postulante_carrerajudicial";

/** Campos visibles: certificación carrera judicial (DEM). */
export const KEYS_CARRERA_JUDICIAL_VISIBLES = [
  "entidad_emisora_carrerajudicial",
  "nombre_postulante_carrerajudicial",
  "apellido_postulante_carrerajudicial",
  "cedula_postulante_carrerajudicial",
  "expediente_dem_carrerajudicial",
  "fecha_ingreso_judicatura",
  "fecha_corte_carrerajudicial",
  "condicion_cargo_carrerajudicial",
  "cargo_desempeñado_carrerajudicial",
  "tribunal_competencia_carrerajudicial",
  "circuito_judicial_carrerajudicial",
  "estado_circunscripcion_carrerajudicial",
  "resolucion_nombramiento_carrerajudicial",
  "periodo_desempeño_carrerajudicial",
  "es_juez_superior_carrerajudicial",
  "ausencia_sanciones_carrerajudicial",
] as const;

export type KeyCarreraJudicialVisible =
  (typeof KEYS_CARRERA_JUDICIAL_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL =
  "prefijo_cedula_quiensuscribe_carrerafuncionarial";
export const KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL =
  "prefijo_cedula_postulante_carrerafuncionarial";

/** Campos visibles: certificación carrera funcionarial. */
export const KEYS_CARRERA_FUNCIONARIAL_VISIBLES = [
  "organo_emisor_carrerafuncionarial",
  "estado_entidad_carrerafuncionarial",
  "municipio_entidad_carrerafuncionarial",
  "direccion_entidad_carrerafuncionarial",
  "nombre_quiensuscribe_carrerafuncionarial",
  "cedula_quiensuscribe_carrerafuncionarial",
  "cargo_quiensuscribe_carrerafuncionarial",
  "nombre_postulante_carrerafuncionarial",
  "apellido_postulante_carrerafuncionarial",
  "cedula_postulante_carrerafuncionarial",
  "fecha_ingreso_carrerafuncionarial",
  "estatus_servicio_carrerafuncionarial",
  "condicion_cargo_carrerafuncionarial",
  "cargo_desempenado_carrerafuncionarial",
  "dependencia_adscripcion_carrerafuncionarial",
  "naturaleza_cargo_carrerafuncionarial",
  "acto_designacion_carrerafuncionarial",
  "periodo_desempeno_carrerafuncionarial",
  "ausencia_sanciones_carrerafuncionarial",
  "fecha_expedicion_carrerafuncionarial",
] as const;

export type KeyCarreraFuncionarialVisible =
  (typeof KEYS_CARRERA_FUNCIONARIAL_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA =
  "prefijo_cedula_declarante_nomilitancia";

/** Campos visibles: DJ no militancia político partidista. */
export const KEYS_DJ_NO_MILITANCIA_VISIBLES = [
  "nombre_declarante_nomilitancia",
  "apellido_declarante_nomilitancia",
  "estadocivil_declarante_nomilitancia",
  "cedula_declarante_nomilitancia",
  "manifestacion_nomilitancia",
  "aclaratoria_renuncia_nomilitancia",
  "estado_notaria_nomilitancia",
  "municipio_notaria_nomilitancia",
  "nombre_notaria_nomilitancia",
  "numero_folio_nomilitancia",
  "numero_tomo_nomilitancia",
  "fecha_otorgamiento_nomilitancia",
] as const;

export type KeyDjNoMilitanciaVisible =
  (typeof KEYS_DJ_NO_MILITANCIA_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_DECLARANTE_NOPARENTESCO =
  "prefijo_cedula_declarante_noparentesco";

/** Campos visibles: DJ ausencia incompatibilidad por parentesco. */
export const KEYS_DJ_NO_PARENTESCO_VISIBLES = [
  "nombre_declarante_noparentesco",
  "apellido_declarante_noparentesco",
  "estadocivil_declarante_noparentesco",
  "cedula_declarante_noparentesco",
  "manifestacion_ausenciavinculo_noparentesco",
  "constancia_altosfuncionarios_noparentesco",
  "estado_notaria_noparentesco",
  "municipio_notaria_noparentesco",
  "nombre_notaria_noparentesco",
  "numero_folio_noparentesco",
  "numero_tomo_noparentesco",
  "fecha_otorgamiento_noparentesco",
] as const;

export type KeyDjNoParentescoVisible =
  (typeof KEYS_DJ_NO_PARENTESCO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO =
  "prefijo_cedula_conyugematrimonio_postulante";
export const KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO =
  "prefijo_cedula_segundoconyuge_postulante";

/** Campos visibles: acta de matrimonio. */
export const KEYS_ACTA_MATRIMONIO_VISIBLES = [
  "nombrejefatura_matrimonio_postulante",
  "numeroacta_matrimonio_postulante",
  "folio_matrimonio_postulante",
  "tomo_matrimonio_postulante",
  "anio_matrimonio_postulante",
  "nombre_conyugematrimonio_postulante",
  "apellido_conyugematrimonio_postulante",
  "cedula_conyugematrimonio_postulante",
  "nombre_segundoconyuge_postulante",
  "apellido_segundoconyuge_postulante",
  "cedula_segundoconyuge_postulante",
  "fecha_celebracionmatrimonio_postulante",
] as const;

export type KeyActaMatrimonioVisible =
  (typeof KEYS_ACTA_MATRIMONIO_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION =
  "prefijo_cedula_declarante_nocontratacion";

/** Campos visibles: DJ no contratación con el Estado. */
export const KEYS_DJ_NO_CONTRATACION_VISIBLES = [
  "nombre_declarante_nocontratacion",
  "apellido_declarante_nocontratacion",
  "estadocivil_declarante_nocontratacion",
  "cedula_declarante_nocontratacion",
  "declaracion_inexistentecontratos_nocontratacion",
  "declaracion_nolitigio_nocontratacion",
  "estado_notaria_nocontratacion",
  "municipio_notaria_nocontratacion",
  "nombre_notaria_nocontratacion",
  "numero_folio_nocontratacion",
  "numero_tomo_nocontratacion",
  "fecha_otorgamiento_nocontratacion",
] as const;

export type KeyDjNoContratacionVisible =
  (typeof KEYS_DJ_NO_CONTRATACION_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_SINTESIS = "prefijo_cedula_sintesis";
export const KEY_PREFIJO_INPRE_SINTESIS = "prefijo_inpre_sintesis";

/** Campos visibles: síntesis curricular. */
export const KEYS_SINTESIS_CURRICULAR_VISIBLES = [
  "nombre_postulante_sintesis",
  "apellido_postulante_sintesis",
  "estadocivil_postulante_sintesis",
  "cedula_postulante_sintesis",
  "inpreabogado_postulante_sintesis",
  "correo_postulante_sintesis",
  "ocupacion_postulante_sintesis",
  "telefono_postulante_sintesis",
  "estado_ubicacion_sintesis",
  "municipio_ubicacion_sintesis",
  "ciudad_ubicacion_sintesis",
  "direccion_trabajo_sintesis",
  "direccion_habitacion_sintesis",
] as const;

export type KeySintesisCurricularVisible =
  (typeof KEYS_SINTESIS_CURRICULAR_VISIBLES)[number];

export const KEY_PREFIJO_CEDULA_OTRO = "prefijo_cedula_otro";
export const KEY_PREFIJO_INPRE_OTRO = "prefijo_inpre_otro";

/** Campos visibles: otro documento. */
export const KEYS_OTRO_DOCUMENTO_VISIBLES = [
  "nombre_postulante_otro",
  "apellido_postulante_otro",
  "estadocivil_postulante_otro",
  "cedula_postulante_otro",
  "inpreabogado_postulante_otro",
  "descripcion_documento_otro",
] as const;

export type KeyOtroDocumentoVisible = (typeof KEYS_OTRO_DOCUMENTO_VISIBLES)[number];

/** Vacío permitido; si hay valor, aplica el schema de formato. */
function opcionalEscrito<T extends z.ZodType>(schema: T) {
  return z.union([z.literal(""), schema]);
}

const letrasEspacios = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(80, "Máximo 80 caracteres")
  .regex(
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/,
    "Sólo letras y espacios (sin números ni signos)",
  );

const textoInstitucion = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(150, "Máximo 150 caracteres")
  .regex(
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.,\-/()#\s]+$/,
    "Caracteres no permitidos en el nombre del registro",
  );

const fechaIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use una fecha válida")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    if (y === undefined || m === undefined || d === undefined) return false;
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }, "Use una fecha válida");

const digitosCedula = z
  .string()
  .trim()
  .regex(/^\d{6,8}$/, "Entre 6 y 8 dígitos");

const numericoActa = z
  .string()
  .trim()
  .regex(/^\d{1,20}$/, "Sólo números");

const anioActa = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Año de 4 dígitos")
  .refine((s) => {
    const n = Number(s);
    return n >= 1800 && n <= new Date().getFullYear() + 1;
  }, "Año fuera de rango");

const textoLargo = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(4000, "Máximo 4000 caracteres");

const correoElectronico = z
  .string()
  .trim()
  .email("Correo inválido")
  .max(160, "Máximo 160 caracteres");

const telefonoContacto = z
  .string()
  .trim()
  .min(7, "Mínimo 7 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[0-9+\-\s()]+$/, "Sólo números y signos de teléfono");

const codigoVerificacion = z
  .string()
  .trim()
  .min(4, "Mínimo 4 caracteres")
  .max(80, "Máximo 80 caracteres")
  .regex(
    /^[A-Za-z0-9\-_/]+$/,
    "Sólo letras, números y guiones",
  );

const prefijoVe = z.union([z.literal(""), z.enum(["V", "E"])]);

const siNo = z.union([z.literal(""), z.enum(["SI", "NO"])]);

const metadatosInvisiblesSchema = {
  es_documento: z.boolean().nullable(),
  calidad_legibilidad: z.union([
    z.null(),
    z.literal(""),
    z.enum(["alta", "media", "baja"], {
      message: "Legibilidad: alta, media o baja",
    }),
  ]),
  advertencias: z.union([
    z.null(),
    z.literal(""),
    z.string().trim().max(2000, "Máximo 2000 caracteres"),
  ]),
};

function str(v: string | boolean | null | undefined): string {
  return v === null || v === undefined ? "" : String(v);
}

function metaDesdeValores(valores: Readonly<ValoresFormularioRevision>) {
  return {
    es_documento:
      valores.es_documento === true || valores.es_documento === false
        ? valores.es_documento
        : null,
    calidad_legibilidad:
      valores.calidad_legibilidad === null || valores.calidad_legibilidad === undefined
        ? null
        : String(valores.calidad_legibilidad),
    advertencias:
      valores.advertencias === null || valores.advertencias === undefined
        ? null
        : String(valores.advertencias),
  };
}

/** Cédula: todos opcionales; formato sólo si se escribe. */
export const formularioCedulaSchema = z.object({
  [KEY_PREFIJO_CEDULA]: prefijoVe,
  cedula_identidad_postulante: opcionalEscrito(digitosCedula),
  nombre_cedula_postulante: opcionalEscrito(letrasEspacios),
  apellido_cedula_postulante: opcionalEscrito(letrasEspacios),
  estadocivil_cedula_postulante: opcionalEscrito(letrasEspacios),
  fechanacimiento_cedula_postulante: opcionalEscrito(fechaIso),
  vigencia_cedula_postulante: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Partida de nacimiento: todos opcionales; formato sólo si se escribe. */
export const formularioPartidaSchema = z.object({
  [KEY_PREFIJO_CEDULA_PADRE]: prefijoVe,
  [KEY_PREFIJO_CEDULA_MADRE]: prefijoVe,
  nombre_partida_postulante: opcionalEscrito(letrasEspacios),
  apellido_partida_postulante: opcionalEscrito(letrasEspacios),
  fechanacimiento_partida_postulante: opcionalEscrito(fechaIso),
  nombrepadre_partida_postulante: opcionalEscrito(letrasEspacios),
  nacionalidadpadre_partida_postulante: opcionalEscrito(letrasEspacios),
  cedulapadre_partida_postulante: opcionalEscrito(digitosCedula),
  nombremadre_partida_postulante: opcionalEscrito(letrasEspacios),
  nacionalidadmadre_partida_postulante: opcionalEscrito(letrasEspacios),
  cedulamadre_partida_postulante: opcionalEscrito(digitosCedula),
  nombrejefatura_partida_postulante: opcionalEscrito(textoInstitucion),
  numeroacta_partida_postulante: opcionalEscrito(numericoActa),
  tomo_partida_postulante: opcionalEscrito(numericoActa),
  año_partida_postulante: opcionalEscrito(anioActa),
  ...metadatosInvisiblesSchema,
});

/** DJ no poseer otra nacionalidad: todos opcionales; formato sólo si se escribe. */
export const formularioDjOtraNacionalidadSchema = z.object({
  [KEY_PREFIJO_CEDULA_DECLARANTE_OTRA]: prefijoVe,
  nombre_declarante_otranacionalidad: opcionalEscrito(letrasEspacios),
  apellido_declarante_otranacionalidad: opcionalEscrito(letrasEspacios),
  estadocivil_declarante_otranacionalidad: opcionalEscrito(letrasEspacios),
  cedula_declarante_otranacionalidad: opcionalEscrito(digitosCedula),
  noposee_declaracion: opcionalEscrito(textoLargo),
  renuncia_otranacionalidad: opcionalEscrito(textoLargo),
  estado_otranacionalidad: opcionalEscrito(letrasEspacios),
  municipio_otranacionalidad: opcionalEscrito(letrasEspacios),
  nombrenotaria_otranacionalidad: opcionalEscrito(textoInstitucion),
  numerofolio_otranacionalidad: opcionalEscrito(numericoActa),
  numerotomo_otranacionalidad: opcionalEscrito(numericoActa),
  fechaotorgamiento_otranacionalidad: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Solvencia moral / deontológica: todos opcionales; formato sólo si se escribe. */
export const formularioSolvenciaDeontologicaSchema = z.object({
  nombre_entidad_deontologica: opcionalEscrito(textoInstitucion),
  estado_entidad_deontologica: opcionalEscrito(letrasEspacios),
  municipio_entidad_deontologica: opcionalEscrito(letrasEspacios),
  direccion_entidad_deontologica: opcionalEscrito(textoInstitucion),
  nombre_quiensuscribe_deontologica: opcionalEscrito(letrasEspacios),
  cedula_quiensuscribe_deontologica: opcionalEscrito(digitosCedula),
  cargo_quiensuscribe_deontologica: opcionalEscrito(textoInstitucion),
  inpreabogado_quiensuscribe_deontologica: opcionalEscrito(numericoActa),
  nombre_postulante_deontologica: opcionalEscrito(letrasEspacios),
  apellido_postulante_deontologica: opcionalEscrito(letrasEspacios),
  cedula_postulante_deontologica: opcionalEscrito(digitosCedula),
  inpreabogado_postulante_deontologica: opcionalEscrito(numericoActa),
  declaracion_solvencia_deontologica: opcionalEscrito(textoLargo),
  fecha_expedicion_deontologica: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Certificación médica / capacidad mental: todos opcionales. */
export const formularioCertMedicaMentalSchema = z.object({
  [KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD]: prefijoVe,
  [KEY_PREFIJO_CEDULA_POSTULANTE_SALUD]: prefijoVe,
  nombre_profesional_salud: opcionalEscrito(textoInstitucion),
  cedula_profesional_salud: opcionalEscrito(digitosCedula),
  profesion_profesional_salud: opcionalEscrito(textoInstitucion),
  colegiacion_profesional_salud: opcionalEscrito(numericoActa),
  nombre_postulante_salud: opcionalEscrito(letrasEspacios),
  apellido_postulante_salud: opcionalEscrito(letrasEspacios),
  cedula_postulante_salud: opcionalEscrito(digitosCedula),
  conclusion_diagnostica_salud: opcionalEscrito(textoLargo),
  fecha_expedicion_salud: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Antecedentes penales: todos opcionales; formato sólo si se escribe. */
export const formularioAntecedentesPenalesSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_PENALES]: prefijoVe,
  nombre_entidad_penales: opcionalEscrito(textoInstitucion),
  nombre_quiensuscribe_penales: opcionalEscrito(letrasEspacios),
  cargo_quiensuscribe_penales: opcionalEscrito(textoInstitucion),
  designacion_quiensuscribe_penales: opcionalEscrito(textoLargo),
  nombre_postulante_penales: opcionalEscrito(letrasEspacios),
  apellido_postulante_penales: opcionalEscrito(letrasEspacios),
  cedula_postulante_penales: opcionalEscrito(digitosCedula),
  dictamen_expreso_penales: opcionalEscrito(textoLargo),
  codigo_verificacion_penales: opcionalEscrito(codigoVerificacion),
  fecha_suscripcion_penales: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Certificación CGR no inhabilitación: todos opcionales. */
export const formularioContraloriaCgrSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_CGR]: prefijoVe,
  nombre_direccion_cgr: opcionalEscrito(textoInstitucion),
  nombre_quiensuscribe_cgr: opcionalEscrito(letrasEspacios),
  cargo_quiensuscribe_cgr: opcionalEscrito(textoInstitucion),
  designacion_quiensuscribe_cgr: opcionalEscrito(textoLargo),
  nombre_postulante_cgr: opcionalEscrito(letrasEspacios),
  apellido_postulante_cgr: opcionalEscrito(letrasEspacios),
  cedula_postulante_cgr: opcionalEscrito(digitosCedula),
  dictamen_expreso_cgr: opcionalEscrito(textoLargo),
  codigo_verificacion_cgr: opcionalEscrito(codigoVerificacion),
  fecha_suscripcion_cgr: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Título de pregrado de abogado: todos opcionales. */
export const formularioTituloPregradoSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_PREGRADO]: prefijoVe,
  nombre_universidad_pregrado: opcionalEscrito(textoInstitucion),
  nombre_rector_pregrado: opcionalEscrito(letrasEspacios),
  nombre_secretario_pregrado: opcionalEscrito(letrasEspacios),
  titulo_postulante_pregrado: opcionalEscrito(textoInstitucion),
  nombre_postulante_pregrado: opcionalEscrito(letrasEspacios),
  apellido_postulante_pregrado: opcionalEscrito(letrasEspacios),
  cedula_postulante_pregrado: opcionalEscrito(digitosCedula),
  mencion_honor_pregrado: opcionalEscrito(textoInstitucion),
  fecha_graduacion_pregrado: opcionalEscrito(fechaIso),
  registro_publico_pregrado: opcionalEscrito(textoInstitucion),
  numero_asentamiento_pregrado: opcionalEscrito(numericoActa),
  tomo_registro_pregrado: opcionalEscrito(numericoActa),
  folio_registro_pregrado: opcionalEscrito(numericoActa),
  fecha_protocolizacion_pregrado: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Título de especialización jurídica: todos opcionales. */
export const formularioTituloEspecialidadSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_ESPECIALIDAD]: prefijoVe,
  nombre_universidad_especialidad: opcionalEscrito(textoInstitucion),
  nombre_rector_especialidad: opcionalEscrito(letrasEspacios),
  nombre_secretario_especialidad: opcionalEscrito(letrasEspacios),
  rama_especialidad_derecho: opcionalEscrito(textoInstitucion),
  nombre_pregrado_especialidad: opcionalEscrito(textoInstitucion),
  nombre_postulante_especialidad: opcionalEscrito(letrasEspacios),
  apellido_postulante_especialidad: opcionalEscrito(letrasEspacios),
  cedula_postulante_especialidad: opcionalEscrito(digitosCedula),
  fecha_graduacion_especialidad: opcionalEscrito(fechaIso),
  registro_publico_especialidad: opcionalEscrito(textoInstitucion),
  numero_asentamiento_especialidad: opcionalEscrito(numericoActa),
  tomo_registro_especialidad: opcionalEscrito(numericoActa),
  folio_registro_especialidad: opcionalEscrito(numericoActa),
  fecha_protocolizacion_especialidad: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Constancia aprobación TEG especialización: todos opcionales. */
export const formularioConstanciaTegSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_TEG]: prefijoVe,
  nombre_universidad_teg: opcionalEscrito(textoInstitucion),
  rama_especialidad_teg: opcionalEscrito(textoInstitucion),
  titulo_trabajo_grado: opcionalEscrito(textoLargo),
  nombre_postulante_teg: opcionalEscrito(letrasEspacios),
  apellido_postulante_teg: opcionalEscrito(letrasEspacios),
  cedula_postulante_teg: opcionalEscrito(digitosCedula),
  jurado_examinador_teg: opcionalEscrito(textoLargo),
  veredicto_calificacion_teg: opcionalEscrito(textoInstitucion),
  fecha_defensa_teg: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Título de maestría jurídica: todos opcionales. */
export const formularioTituloMaestriaSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_MAESTRIA]: prefijoVe,
  nombre_universidad_maestria: opcionalEscrito(textoInstitucion),
  nombre_rector_maestria: opcionalEscrito(letrasEspacios),
  nombre_secretario_maestria: opcionalEscrito(letrasEspacios),
  area_maestria_derecho: opcionalEscrito(textoInstitucion),
  nombre_pregrado_maestria: opcionalEscrito(textoInstitucion),
  nombre_postulante_maestria: opcionalEscrito(letrasEspacios),
  apellido_postulante_maestria: opcionalEscrito(letrasEspacios),
  cedula_postulante_maestria: opcionalEscrito(digitosCedula),
  fecha_graduacion_maestria: opcionalEscrito(fechaIso),
  registro_publico_maestria: opcionalEscrito(textoInstitucion),
  numero_asentamiento_maestria: opcionalEscrito(numericoActa),
  tomo_registro_maestria: opcionalEscrito(numericoActa),
  folio_registro_maestria: opcionalEscrito(numericoActa),
  fecha_protocolizacion_maestria: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Constancia aprobación TEG/tesis de maestría: todos opcionales. */
export const formularioConstanciaMaestriaSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_MAESTRIA]: prefijoVe,
  nombre_universidad_tesis_maestria: opcionalEscrito(textoInstitucion),
  area_maestria_tesis: opcionalEscrito(textoInstitucion),
  titulo_trabajo_maestria: opcionalEscrito(textoLargo),
  nombre_postulante_tesis_maestria: opcionalEscrito(letrasEspacios),
  apellido_postulante_tesis_maestria: opcionalEscrito(letrasEspacios),
  cedula_postulante_tesis_maestria: opcionalEscrito(digitosCedula),
  jurado_examinador_maestria: opcionalEscrito(textoLargo),
  veredicto_calificacion_maestria: opcionalEscrito(textoInstitucion),
  fecha_defensa_maestria: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Título de doctorado jurídico: todos opcionales. */
export const formularioTituloDoctoradoSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO]: prefijoVe,
  nombre_universidad_doctorado: opcionalEscrito(textoInstitucion),
  nombre_rector_doctorado: opcionalEscrito(letrasEspacios),
  nombre_secretario_doctorado: opcionalEscrito(letrasEspacios),
  denominacion_titulo_doctorado: opcionalEscrito(textoInstitucion),
  nombre_pregrado_doctorado: opcionalEscrito(textoInstitucion),
  nombre_postulante_doctorado: opcionalEscrito(letrasEspacios),
  apellido_postulante_doctorado: opcionalEscrito(letrasEspacios),
  cedula_postulante_doctorado: opcionalEscrito(digitosCedula),
  fecha_graduacion_doctorado: opcionalEscrito(fechaIso),
  registro_publico_doctorado: opcionalEscrito(textoInstitucion),
  numero_asentamiento_doctorado: opcionalEscrito(numericoActa),
  tomo_registro_doctorado: opcionalEscrito(numericoActa),
  folio_registro_doctorado: opcionalEscrito(numericoActa),
  fecha_protocolizacion_doctorado: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Constancia aprobación tesis doctoral: todos opcionales. */
export const formularioConstanciaDoctoradoSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO]: prefijoVe,
  nombre_universidad_tesis_doctorado: opcionalEscrito(textoInstitucion),
  denominacion_titulo_tesis_doctorado: opcionalEscrito(textoInstitucion),
  titulo_tesis_doctorado: opcionalEscrito(textoLargo),
  nombre_postulante_tesis_doctorado: opcionalEscrito(letrasEspacios),
  apellido_postulante_tesis_doctorado: opcionalEscrito(letrasEspacios),
  cedula_postulante_tesis_doctorado: opcionalEscrito(digitosCedula),
  jurado_examinador_doctorado: opcionalEscrito(textoLargo),
  veredicto_calificacion_doctorado: opcionalEscrito(textoInstitucion),
  fecha_defensa_doctorado: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Inscripción colegio de abogados: todos opcionales. */
export const formularioInscripcionColegioSchema = z.object({
  [KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO]: prefijoVe,
  [KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO]: prefijoVe,
  nombre_gremio_emisor: opcionalEscrito(textoInstitucion),
  estado_gremio_emisor: opcionalEscrito(letrasEspacios),
  direccion_gremio_emisor: opcionalEscrito(textoInstitucion),
  nombre_firmante_gremio: opcionalEscrito(letrasEspacios),
  cedula_firmante_gremio: opcionalEscrito(digitosCedula),
  cargo_firmante_gremio: opcionalEscrito(textoInstitucion),
  inpreabogado_firmante_gremio: opcionalEscrito(numericoActa),
  nombre_postulante_gremio: opcionalEscrito(letrasEspacios),
  apellido_postulante_gremio: opcionalEscrito(letrasEspacios),
  cedula_postulante_gremio: opcionalEscrito(digitosCedula),
  inpreabogado_postulante_colegio: opcionalEscrito(numericoActa),
  fecha_inscripcion_gremio: opcionalEscrito(fechaIso),
  fecha_expedicion_gremio: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Solvencia colegio de abogados: todos opcionales. */
export const formularioSolvenciaColegioSchema = z.object({
  [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_SOLVENCIA]: prefijoVe,
  [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_COLEGIO]: prefijoVe,
  nombre_gremio_emisor_solvencia: opcionalEscrito(textoInstitucion),
  estado_gremio_solvencia: opcionalEscrito(letrasEspacios),
  direccion_gremio_solvencia: opcionalEscrito(textoInstitucion),
  nombre_quiensuscribe_solvencia: opcionalEscrito(letrasEspacios),
  cedula_quiensuscribe_solvencia: opcionalEscrito(digitosCedula),
  cargo_quiensuscribe_solvencia: opcionalEscrito(textoInstitucion),
  inpreabogado_quiensuscribe_solvencia: opcionalEscrito(numericoActa),
  nombre_postulante_solvencia: opcionalEscrito(letrasEspacios),
  apellido_postulante_solvencia: opcionalEscrito(letrasEspacios),
  cedula_postulante_solvencia: opcionalEscrito(digitosCedula),
  inpreabogado_postulante_solvencia: opcionalEscrito(numericoActa),
  estatus_gremial_solvencia: opcionalEscrito(textoInstitucion),
  fecha_suscripcion_solvencia: opcionalEscrito(fechaIso),
  periodo_vigencia_solvencia: opcionalEscrito(textoInstitucion),
  ...metadatosInvisiblesSchema,
});

/** Inscripción INPREABOGADO: todos opcionales. */
export const formularioInscripcionInpreabogadoSchema = z.object({
  [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO]: prefijoVe,
  [KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO]: prefijoVe,
  nombre_quiensuscribe_inpreabogado: opcionalEscrito(letrasEspacios),
  cedula_quiensuscribe_inpreabogado: opcionalEscrito(digitosCedula),
  cargo_quiensuscribe_inpreabogado: opcionalEscrito(textoInstitucion),
  numero_quiensuscribe_inpreabogado: opcionalEscrito(numericoActa),
  nombre_postulante_inpreabogado: opcionalEscrito(letrasEspacios),
  apellido_postulante_inpreabogado: opcionalEscrito(letrasEspacios),
  cedula_postulante_inpreabogado: opcionalEscrito(digitosCedula),
  inpreabogado_postulante_nacional: opcionalEscrito(numericoActa),
  fecha_inscripcion_inpreabogado: opcionalEscrito(fechaIso),
  fecha_expedicion_inpreabogado: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Solvencia INPREABOGADO: todos opcionales. */
export const formularioSolvenciaInpreabogadoSchema = z.object({
  [KEY_PREFIJO_CEDULA_FIRMANTE_SOLVENCIA_INPRE]: prefijoVe,
  [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_INPRE]: prefijoVe,
  nombre_firmante_solvencia_inpreabogado: opcionalEscrito(letrasEspacios),
  cedula_firmante_solvencia_inpreabogado: opcionalEscrito(digitosCedula),
  cargo_firmante_solvencia_inpreabogado: opcionalEscrito(textoInstitucion),
  inpreabogado_firmante_solvencia: opcionalEscrito(numericoActa),
  nombre_postulante_solvencia_inpreabogado: opcionalEscrito(letrasEspacios),
  apellido_postulante_solvencia_inpreabogado: opcionalEscrito(letrasEspacios),
  cedula_postulante_solvencia_inpreabogado: opcionalEscrito(digitosCedula),
  inpreabogado_solicitante_solvencia: opcionalEscrito(numericoActa),
  dictamen_solvencia_inpreabogado: opcionalEscrito(textoLargo),
  fecha_expedicion_solvencia_inpreabogado: opcionalEscrito(fechaIso),
  periodo_vigencia_solvencia_inpreabogado: opcionalEscrito(textoInstitucion),
  ...metadatosInvisiblesSchema,
});

/** Prueba documental 15 años ejercicio libre: todos opcionales. */
export const formularioPruebaEjercicioLibreSchema = z.object({
  tipo_documento_ejerciciolibre: opcionalEscrito(textoInstitucion),
  nombre_postulante_ejerciciolibre: opcionalEscrito(letrasEspacios),
  apellido_postulante_ejerciciolibre: opcionalEscrito(letrasEspacios),
  inpreabogado_postulante_ejerciciolibre: opcionalEscrito(numericoActa),
  rol_postulante_ejerciciolibre: opcionalEscrito(textoInstitucion),
  fecha_acto_ejerciciolibre: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Certificación docente: todos opcionales. */
export const formularioCertificacionDocenteSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA]: prefijoVe,
  nombre_universidad_docencia: opcionalEscrito(textoInstitucion),
  facultad_docencia: opcionalEscrito(textoInstitucion),
  organo_expedidor_docencia: opcionalEscrito(textoInstitucion),
  catedra_impartida_docencia: opcionalEscrito(textoInstitucion),
  nivel_docente_docencia: opcionalEscrito(textoInstitucion),
  nombre_postulante_docencia: opcionalEscrito(letrasEspacios),
  apellido_postulante_docencia: opcionalEscrito(letrasEspacios),
  cedula_postulante_docencia: opcionalEscrito(digitosCedula),
  fecha_inicio_docencia: opcionalEscrito(fechaIso),
  fecha_corte_docencia: opcionalEscrito(fechaIso),
  condicion_docente_docencia: opcionalEscrito(textoInstitucion),
  escalafon_docente_docencia: opcionalEscrito(textoInstitucion),
  ...metadatosInvisiblesSchema,
});

/** Acta concurso oposición docente: todos opcionales. */
export const formularioActaConcursoDocenteSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE]: prefijoVe,
  nombre_universidad_concursodocente: opcionalEscrito(textoInstitucion),
  facultad_concursodocente: opcionalEscrito(textoInstitucion),
  catedra_concursodocente: opcionalEscrito(textoInstitucion),
  numero_acta_concursodocente: opcionalEscrito(textoInstitucion),
  fecha_acta_concursodocente: opcionalEscrito(fechaIso),
  veredicto_concursodocente: opcionalEscrito(textoInstitucion),
  categoria_otorgada_concursodocente: opcionalEscrito(textoInstitucion),
  jurado_examinador_concursodocente: opcionalEscrito(textoLargo),
  nombre_postulante_concursodocente: opcionalEscrito(letrasEspacios),
  apellido_postulante_concursodocente: opcionalEscrito(letrasEspacios),
  cedula_postulante_concursodocente: opcionalEscrito(digitosCedula),
  ...metadatosInvisiblesSchema,
});

/** Carrera judicial (DEM): todos opcionales. */
export const formularioCarreraJudicialSchema = z.object({
  [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL]: prefijoVe,
  entidad_emisora_carrerajudicial: opcionalEscrito(textoInstitucion),
  nombre_postulante_carrerajudicial: opcionalEscrito(letrasEspacios),
  apellido_postulante_carrerajudicial: opcionalEscrito(letrasEspacios),
  cedula_postulante_carrerajudicial: opcionalEscrito(digitosCedula),
  expediente_dem_carrerajudicial: opcionalEscrito(textoInstitucion),
  fecha_ingreso_judicatura: opcionalEscrito(fechaIso),
  fecha_corte_carrerajudicial: opcionalEscrito(fechaIso),
  condicion_cargo_carrerajudicial: opcionalEscrito(textoInstitucion),
  cargo_desempeñado_carrerajudicial: opcionalEscrito(textoInstitucion),
  tribunal_competencia_carrerajudicial: opcionalEscrito(textoInstitucion),
  circuito_judicial_carrerajudicial: opcionalEscrito(textoInstitucion),
  estado_circunscripcion_carrerajudicial: opcionalEscrito(letrasEspacios),
  resolucion_nombramiento_carrerajudicial: opcionalEscrito(textoInstitucion),
  periodo_desempeño_carrerajudicial: opcionalEscrito(textoInstitucion),
  es_juez_superior_carrerajudicial: siNo,
  ausencia_sanciones_carrerajudicial: opcionalEscrito(textoLargo),
  ...metadatosInvisiblesSchema,
});

/** Carrera funcionarial: todos opcionales. */
export const formularioCarreraFuncionarialSchema = z.object({
  [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL]: prefijoVe,
  [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL]: prefijoVe,
  organo_emisor_carrerafuncionarial: opcionalEscrito(textoInstitucion),
  estado_entidad_carrerafuncionarial: opcionalEscrito(letrasEspacios),
  municipio_entidad_carrerafuncionarial: opcionalEscrito(letrasEspacios),
  direccion_entidad_carrerafuncionarial: opcionalEscrito(textoInstitucion),
  nombre_quiensuscribe_carrerafuncionarial: opcionalEscrito(letrasEspacios),
  cedula_quiensuscribe_carrerafuncionarial: opcionalEscrito(digitosCedula),
  cargo_quiensuscribe_carrerafuncionarial: opcionalEscrito(textoInstitucion),
  nombre_postulante_carrerafuncionarial: opcionalEscrito(letrasEspacios),
  apellido_postulante_carrerafuncionarial: opcionalEscrito(letrasEspacios),
  cedula_postulante_carrerafuncionarial: opcionalEscrito(digitosCedula),
  fecha_ingreso_carrerafuncionarial: opcionalEscrito(fechaIso),
  estatus_servicio_carrerafuncionarial: opcionalEscrito(fechaIso),
  condicion_cargo_carrerafuncionarial: opcionalEscrito(textoInstitucion),
  cargo_desempenado_carrerafuncionarial: opcionalEscrito(textoInstitucion),
  dependencia_adscripcion_carrerafuncionarial: opcionalEscrito(textoInstitucion),
  naturaleza_cargo_carrerafuncionarial: opcionalEscrito(textoLargo),
  acto_designacion_carrerafuncionarial: opcionalEscrito(textoLargo),
  periodo_desempeno_carrerafuncionarial: opcionalEscrito(textoInstitucion),
  ausencia_sanciones_carrerafuncionarial: opcionalEscrito(textoLargo),
  fecha_expedicion_carrerafuncionarial: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** DJ no militancia: todos opcionales. */
export const formularioDjNoMilitanciaSchema = z.object({
  [KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA]: prefijoVe,
  nombre_declarante_nomilitancia: opcionalEscrito(letrasEspacios),
  apellido_declarante_nomilitancia: opcionalEscrito(letrasEspacios),
  estadocivil_declarante_nomilitancia: opcionalEscrito(letrasEspacios),
  cedula_declarante_nomilitancia: opcionalEscrito(digitosCedula),
  manifestacion_nomilitancia: opcionalEscrito(textoLargo),
  aclaratoria_renuncia_nomilitancia: opcionalEscrito(textoLargo),
  estado_notaria_nomilitancia: opcionalEscrito(letrasEspacios),
  municipio_notaria_nomilitancia: opcionalEscrito(letrasEspacios),
  nombre_notaria_nomilitancia: opcionalEscrito(textoInstitucion),
  numero_folio_nomilitancia: opcionalEscrito(numericoActa),
  numero_tomo_nomilitancia: opcionalEscrito(numericoActa),
  fecha_otorgamiento_nomilitancia: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** DJ ausencia parentesco / vínculo: todos opcionales. */
export const formularioDjNoParentescoSchema = z.object({
  [KEY_PREFIJO_CEDULA_DECLARANTE_NOPARENTESCO]: prefijoVe,
  nombre_declarante_noparentesco: opcionalEscrito(letrasEspacios),
  apellido_declarante_noparentesco: opcionalEscrito(letrasEspacios),
  estadocivil_declarante_noparentesco: opcionalEscrito(letrasEspacios),
  cedula_declarante_noparentesco: opcionalEscrito(digitosCedula),
  manifestacion_ausenciavinculo_noparentesco: opcionalEscrito(textoLargo),
  constancia_altosfuncionarios_noparentesco: opcionalEscrito(textoLargo),
  estado_notaria_noparentesco: opcionalEscrito(letrasEspacios),
  municipio_notaria_noparentesco: opcionalEscrito(letrasEspacios),
  nombre_notaria_noparentesco: opcionalEscrito(textoInstitucion),
  numero_folio_noparentesco: opcionalEscrito(numericoActa),
  numero_tomo_noparentesco: opcionalEscrito(numericoActa),
  fecha_otorgamiento_noparentesco: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Acta de matrimonio: todos opcionales. */
export const formularioActaMatrimonioSchema = z.object({
  [KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO]: prefijoVe,
  [KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO]: prefijoVe,
  nombrejefatura_matrimonio_postulante: opcionalEscrito(textoInstitucion),
  numeroacta_matrimonio_postulante: opcionalEscrito(numericoActa),
  folio_matrimonio_postulante: opcionalEscrito(numericoActa),
  tomo_matrimonio_postulante: opcionalEscrito(numericoActa),
  anio_matrimonio_postulante: opcionalEscrito(anioActa),
  nombre_conyugematrimonio_postulante: opcionalEscrito(letrasEspacios),
  apellido_conyugematrimonio_postulante: opcionalEscrito(letrasEspacios),
  cedula_conyugematrimonio_postulante: opcionalEscrito(digitosCedula),
  nombre_segundoconyuge_postulante: opcionalEscrito(letrasEspacios),
  apellido_segundoconyuge_postulante: opcionalEscrito(letrasEspacios),
  cedula_segundoconyuge_postulante: opcionalEscrito(digitosCedula),
  fecha_celebracionmatrimonio_postulante: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** DJ no contratación: todos opcionales. */
export const formularioDjNoContratacionSchema = z.object({
  [KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION]: prefijoVe,
  nombre_declarante_nocontratacion: opcionalEscrito(letrasEspacios),
  apellido_declarante_nocontratacion: opcionalEscrito(letrasEspacios),
  estadocivil_declarante_nocontratacion: opcionalEscrito(letrasEspacios),
  cedula_declarante_nocontratacion: opcionalEscrito(digitosCedula),
  declaracion_inexistentecontratos_nocontratacion: opcionalEscrito(textoLargo),
  declaracion_nolitigio_nocontratacion: opcionalEscrito(textoLargo),
  estado_notaria_nocontratacion: opcionalEscrito(letrasEspacios),
  municipio_notaria_nocontratacion: opcionalEscrito(letrasEspacios),
  nombre_notaria_nocontratacion: opcionalEscrito(textoInstitucion),
  numero_folio_nocontratacion: opcionalEscrito(numericoActa),
  numero_tomo_nocontratacion: opcionalEscrito(numericoActa),
  fecha_otorgamiento_nocontratacion: opcionalEscrito(fechaIso),
  ...metadatosInvisiblesSchema,
});

/** Síntesis curricular: todos opcionales. */
export const formularioSintesisCurricularSchema = z.object({
  [KEY_PREFIJO_CEDULA_SINTESIS]: prefijoVe,
  [KEY_PREFIJO_INPRE_SINTESIS]: prefijoVe,
  nombre_postulante_sintesis: opcionalEscrito(letrasEspacios),
  apellido_postulante_sintesis: opcionalEscrito(letrasEspacios),
  estadocivil_postulante_sintesis: opcionalEscrito(letrasEspacios),
  cedula_postulante_sintesis: opcionalEscrito(digitosCedula),
  inpreabogado_postulante_sintesis: opcionalEscrito(numericoActa),
  correo_postulante_sintesis: opcionalEscrito(correoElectronico),
  ocupacion_postulante_sintesis: opcionalEscrito(textoInstitucion),
  telefono_postulante_sintesis: opcionalEscrito(telefonoContacto),
  estado_ubicacion_sintesis: opcionalEscrito(letrasEspacios),
  municipio_ubicacion_sintesis: opcionalEscrito(letrasEspacios),
  ciudad_ubicacion_sintesis: opcionalEscrito(letrasEspacios),
  direccion_trabajo_sintesis: opcionalEscrito(textoInstitucion),
  direccion_habitacion_sintesis: opcionalEscrito(textoInstitucion),
  ...metadatosInvisiblesSchema,
});

/** Otro documento: todos opcionales. */
export const formularioOtroDocumentoSchema = z.object({
  [KEY_PREFIJO_CEDULA_OTRO]: prefijoVe,
  [KEY_PREFIJO_INPRE_OTRO]: prefijoVe,
  nombre_postulante_otro: opcionalEscrito(letrasEspacios),
  apellido_postulante_otro: opcionalEscrito(letrasEspacios),
  estadocivil_postulante_otro: opcionalEscrito(letrasEspacios),
  cedula_postulante_otro: opcionalEscrito(digitosCedula),
  inpreabogado_postulante_otro: opcionalEscrito(numericoActa),
  descripcion_documento_otro: opcionalEscrito(textoLargo),
  ...metadatosInvisiblesSchema,
});

/** Stub / futuros formularios de revisión: misma regla (opcional + formato). */
export const formularioGenericoRevisionSchema = z.object({
  notas: opcionalEscrito(z.string().trim().max(4000, "Máximo 4000 caracteres")),
  ...metadatosInvisiblesSchema,
});

export type ErroresFormularioRevision = Record<string, string>;

function erroresDesdeZod(error: z.ZodError): ErroresFormularioRevision {
  const out: ErroresFormularioRevision = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && out[key] === undefined) {
      out[key] = issue.message;
    }
  }
  return out;
}

function normalizarParaCedula(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA]: str(valores[KEY_PREFIJO_CEDULA]),
    cedula_identidad_postulante: str(valores.cedula_identidad_postulante),
    nombre_cedula_postulante: str(valores.nombre_cedula_postulante),
    apellido_cedula_postulante: str(valores.apellido_cedula_postulante),
    estadocivil_cedula_postulante: str(valores.estadocivil_cedula_postulante),
    fechanacimiento_cedula_postulante: str(valores.fechanacimiento_cedula_postulante),
    vigencia_cedula_postulante: str(valores.vigencia_cedula_postulante),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaPartida(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_PADRE]: str(valores[KEY_PREFIJO_CEDULA_PADRE]),
    [KEY_PREFIJO_CEDULA_MADRE]: str(valores[KEY_PREFIJO_CEDULA_MADRE]),
    nombre_partida_postulante: str(valores.nombre_partida_postulante),
    apellido_partida_postulante: str(valores.apellido_partida_postulante),
    fechanacimiento_partida_postulante: str(valores.fechanacimiento_partida_postulante),
    nombrepadre_partida_postulante: str(valores.nombrepadre_partida_postulante),
    nacionalidadpadre_partida_postulante: str(valores.nacionalidadpadre_partida_postulante),
    cedulapadre_partida_postulante: str(valores.cedulapadre_partida_postulante),
    nombremadre_partida_postulante: str(valores.nombremadre_partida_postulante),
    nacionalidadmadre_partida_postulante: str(valores.nacionalidadmadre_partida_postulante),
    cedulamadre_partida_postulante: str(valores.cedulamadre_partida_postulante),
    nombrejefatura_partida_postulante: str(valores.nombrejefatura_partida_postulante),
    numeroacta_partida_postulante: str(valores.numeroacta_partida_postulante),
    tomo_partida_postulante: str(valores.tomo_partida_postulante),
    año_partida_postulante: str(valores.año_partida_postulante),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaDjOtraNacionalidad(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_OTRA]: str(valores[KEY_PREFIJO_CEDULA_DECLARANTE_OTRA]),
    nombre_declarante_otranacionalidad: str(valores.nombre_declarante_otranacionalidad),
    apellido_declarante_otranacionalidad: str(valores.apellido_declarante_otranacionalidad),
    estadocivil_declarante_otranacionalidad: str(
      valores.estadocivil_declarante_otranacionalidad,
    ),
    cedula_declarante_otranacionalidad: str(valores.cedula_declarante_otranacionalidad),
    noposee_declaracion: str(valores.noposee_declaracion),
    renuncia_otranacionalidad: str(valores.renuncia_otranacionalidad),
    estado_otranacionalidad: str(valores.estado_otranacionalidad),
    municipio_otranacionalidad: str(valores.municipio_otranacionalidad),
    nombrenotaria_otranacionalidad: str(valores.nombrenotaria_otranacionalidad),
    numerofolio_otranacionalidad: str(valores.numerofolio_otranacionalidad),
    numerotomo_otranacionalidad: str(valores.numerotomo_otranacionalidad),
    fechaotorgamiento_otranacionalidad: str(valores.fechaotorgamiento_otranacionalidad),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaSolvenciaDeontologica(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    nombre_entidad_deontologica: str(valores.nombre_entidad_deontologica),
    estado_entidad_deontologica: str(valores.estado_entidad_deontologica),
    municipio_entidad_deontologica: str(valores.municipio_entidad_deontologica),
    direccion_entidad_deontologica: str(valores.direccion_entidad_deontologica),
    nombre_quiensuscribe_deontologica: str(valores.nombre_quiensuscribe_deontologica),
    cedula_quiensuscribe_deontologica: str(valores.cedula_quiensuscribe_deontologica),
    cargo_quiensuscribe_deontologica: str(valores.cargo_quiensuscribe_deontologica),
    inpreabogado_quiensuscribe_deontologica: str(
      valores.inpreabogado_quiensuscribe_deontologica,
    ),
    nombre_postulante_deontologica: str(valores.nombre_postulante_deontologica),
    apellido_postulante_deontologica: str(valores.apellido_postulante_deontologica),
    cedula_postulante_deontologica: str(valores.cedula_postulante_deontologica),
    inpreabogado_postulante_deontologica: str(
      valores.inpreabogado_postulante_deontologica,
    ),
    declaracion_solvencia_deontologica: str(valores.declaracion_solvencia_deontologica),
    fecha_expedicion_deontologica: str(valores.fecha_expedicion_deontologica),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaCertMedicaMental(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD]: str(
      valores[KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD],
    ),
    [KEY_PREFIJO_CEDULA_POSTULANTE_SALUD]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_SALUD],
    ),
    nombre_profesional_salud: str(valores.nombre_profesional_salud),
    cedula_profesional_salud: str(valores.cedula_profesional_salud),
    profesion_profesional_salud: str(valores.profesion_profesional_salud),
    colegiacion_profesional_salud: str(valores.colegiacion_profesional_salud),
    nombre_postulante_salud: str(valores.nombre_postulante_salud),
    apellido_postulante_salud: str(valores.apellido_postulante_salud),
    cedula_postulante_salud: str(valores.cedula_postulante_salud),
    conclusion_diagnostica_salud: str(valores.conclusion_diagnostica_salud),
    fecha_expedicion_salud: str(valores.fecha_expedicion_salud),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaAntecedentesPenales(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_PENALES]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_PENALES],
    ),
    nombre_entidad_penales: str(valores.nombre_entidad_penales),
    nombre_quiensuscribe_penales: str(valores.nombre_quiensuscribe_penales),
    cargo_quiensuscribe_penales: str(valores.cargo_quiensuscribe_penales),
    designacion_quiensuscribe_penales: str(valores.designacion_quiensuscribe_penales),
    nombre_postulante_penales: str(valores.nombre_postulante_penales),
    apellido_postulante_penales: str(valores.apellido_postulante_penales),
    cedula_postulante_penales: str(valores.cedula_postulante_penales),
    dictamen_expreso_penales: str(valores.dictamen_expreso_penales),
    codigo_verificacion_penales: str(valores.codigo_verificacion_penales),
    fecha_suscripcion_penales: str(valores.fecha_suscripcion_penales),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaContraloriaCgr(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CGR]: str(valores[KEY_PREFIJO_CEDULA_POSTULANTE_CGR]),
    nombre_direccion_cgr: str(valores.nombre_direccion_cgr),
    nombre_quiensuscribe_cgr: str(valores.nombre_quiensuscribe_cgr),
    cargo_quiensuscribe_cgr: str(valores.cargo_quiensuscribe_cgr),
    designacion_quiensuscribe_cgr: str(valores.designacion_quiensuscribe_cgr),
    nombre_postulante_cgr: str(valores.nombre_postulante_cgr),
    apellido_postulante_cgr: str(valores.apellido_postulante_cgr),
    cedula_postulante_cgr: str(valores.cedula_postulante_cgr),
    dictamen_expreso_cgr: str(valores.dictamen_expreso_cgr),
    codigo_verificacion_cgr: str(valores.codigo_verificacion_cgr),
    fecha_suscripcion_cgr: str(valores.fecha_suscripcion_cgr),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaTituloPregrado(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_PREGRADO]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_PREGRADO],
    ),
    nombre_universidad_pregrado: str(valores.nombre_universidad_pregrado),
    nombre_rector_pregrado: str(valores.nombre_rector_pregrado),
    nombre_secretario_pregrado: str(valores.nombre_secretario_pregrado),
    titulo_postulante_pregrado: str(valores.titulo_postulante_pregrado),
    nombre_postulante_pregrado: str(valores.nombre_postulante_pregrado),
    apellido_postulante_pregrado: str(valores.apellido_postulante_pregrado),
    cedula_postulante_pregrado: str(valores.cedula_postulante_pregrado),
    mencion_honor_pregrado: str(valores.mencion_honor_pregrado),
    fecha_graduacion_pregrado: str(valores.fecha_graduacion_pregrado),
    registro_publico_pregrado: str(valores.registro_publico_pregrado),
    numero_asentamiento_pregrado: str(valores.numero_asentamiento_pregrado),
    tomo_registro_pregrado: str(valores.tomo_registro_pregrado),
    folio_registro_pregrado: str(valores.folio_registro_pregrado),
    fecha_protocolizacion_pregrado: str(valores.fecha_protocolizacion_pregrado),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaTituloEspecialidad(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_ESPECIALIDAD]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_ESPECIALIDAD],
    ),
    nombre_universidad_especialidad: str(valores.nombre_universidad_especialidad),
    nombre_rector_especialidad: str(valores.nombre_rector_especialidad),
    nombre_secretario_especialidad: str(valores.nombre_secretario_especialidad),
    rama_especialidad_derecho: str(valores.rama_especialidad_derecho),
    nombre_pregrado_especialidad: str(valores.nombre_pregrado_especialidad),
    nombre_postulante_especialidad: str(valores.nombre_postulante_especialidad),
    apellido_postulante_especialidad: str(valores.apellido_postulante_especialidad),
    cedula_postulante_especialidad: str(valores.cedula_postulante_especialidad),
    fecha_graduacion_especialidad: str(valores.fecha_graduacion_especialidad),
    registro_publico_especialidad: str(valores.registro_publico_especialidad),
    numero_asentamiento_especialidad: str(valores.numero_asentamiento_especialidad),
    tomo_registro_especialidad: str(valores.tomo_registro_especialidad),
    folio_registro_especialidad: str(valores.folio_registro_especialidad),
    fecha_protocolizacion_especialidad: str(valores.fecha_protocolizacion_especialidad),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaConstanciaTeg(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TEG]: str(valores[KEY_PREFIJO_CEDULA_POSTULANTE_TEG]),
    nombre_universidad_teg: str(valores.nombre_universidad_teg),
    rama_especialidad_teg: str(valores.rama_especialidad_teg),
    titulo_trabajo_grado: str(valores.titulo_trabajo_grado),
    nombre_postulante_teg: str(valores.nombre_postulante_teg),
    apellido_postulante_teg: str(valores.apellido_postulante_teg),
    cedula_postulante_teg: str(valores.cedula_postulante_teg),
    jurado_examinador_teg: str(valores.jurado_examinador_teg),
    veredicto_calificacion_teg: str(valores.veredicto_calificacion_teg),
    fecha_defensa_teg: str(valores.fecha_defensa_teg),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaTituloMaestria(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_MAESTRIA]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_MAESTRIA],
    ),
    nombre_universidad_maestria: str(valores.nombre_universidad_maestria),
    nombre_rector_maestria: str(valores.nombre_rector_maestria),
    nombre_secretario_maestria: str(valores.nombre_secretario_maestria),
    area_maestria_derecho: str(valores.area_maestria_derecho),
    nombre_pregrado_maestria: str(valores.nombre_pregrado_maestria),
    nombre_postulante_maestria: str(valores.nombre_postulante_maestria),
    apellido_postulante_maestria: str(valores.apellido_postulante_maestria),
    cedula_postulante_maestria: str(valores.cedula_postulante_maestria),
    fecha_graduacion_maestria: str(valores.fecha_graduacion_maestria),
    registro_publico_maestria: str(valores.registro_publico_maestria),
    numero_asentamiento_maestria: str(valores.numero_asentamiento_maestria),
    tomo_registro_maestria: str(valores.tomo_registro_maestria),
    folio_registro_maestria: str(valores.folio_registro_maestria),
    fecha_protocolizacion_maestria: str(valores.fecha_protocolizacion_maestria),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaConstanciaMaestria(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_MAESTRIA]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_MAESTRIA],
    ),
    nombre_universidad_tesis_maestria: str(valores.nombre_universidad_tesis_maestria),
    area_maestria_tesis: str(valores.area_maestria_tesis),
    titulo_trabajo_maestria: str(valores.titulo_trabajo_maestria),
    nombre_postulante_tesis_maestria: str(valores.nombre_postulante_tesis_maestria),
    apellido_postulante_tesis_maestria: str(valores.apellido_postulante_tesis_maestria),
    cedula_postulante_tesis_maestria: str(valores.cedula_postulante_tesis_maestria),
    jurado_examinador_maestria: str(valores.jurado_examinador_maestria),
    veredicto_calificacion_maestria: str(valores.veredicto_calificacion_maestria),
    fecha_defensa_maestria: str(valores.fecha_defensa_maestria),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaTituloDoctorado(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO],
    ),
    nombre_universidad_doctorado: str(valores.nombre_universidad_doctorado),
    nombre_rector_doctorado: str(valores.nombre_rector_doctorado),
    nombre_secretario_doctorado: str(valores.nombre_secretario_doctorado),
    denominacion_titulo_doctorado: str(valores.denominacion_titulo_doctorado),
    nombre_pregrado_doctorado: str(valores.nombre_pregrado_doctorado),
    nombre_postulante_doctorado: str(valores.nombre_postulante_doctorado),
    apellido_postulante_doctorado: str(valores.apellido_postulante_doctorado),
    cedula_postulante_doctorado: str(valores.cedula_postulante_doctorado),
    fecha_graduacion_doctorado: str(valores.fecha_graduacion_doctorado),
    registro_publico_doctorado: str(valores.registro_publico_doctorado),
    numero_asentamiento_doctorado: str(valores.numero_asentamiento_doctorado),
    tomo_registro_doctorado: str(valores.tomo_registro_doctorado),
    folio_registro_doctorado: str(valores.folio_registro_doctorado),
    fecha_protocolizacion_doctorado: str(valores.fecha_protocolizacion_doctorado),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaConstanciaDoctorado(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO],
    ),
    nombre_universidad_tesis_doctorado: str(
      valores.nombre_universidad_tesis_doctorado,
    ),
    denominacion_titulo_tesis_doctorado: str(
      valores.denominacion_titulo_tesis_doctorado,
    ),
    titulo_tesis_doctorado: str(valores.titulo_tesis_doctorado),
    nombre_postulante_tesis_doctorado: str(valores.nombre_postulante_tesis_doctorado),
    apellido_postulante_tesis_doctorado: str(
      valores.apellido_postulante_tesis_doctorado,
    ),
    cedula_postulante_tesis_doctorado: str(valores.cedula_postulante_tesis_doctorado),
    jurado_examinador_doctorado: str(valores.jurado_examinador_doctorado),
    veredicto_calificacion_doctorado: str(valores.veredicto_calificacion_doctorado),
    fecha_defensa_doctorado: str(valores.fecha_defensa_doctorado),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaInscripcionColegio(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO]: str(
      valores[KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO],
    ),
    [KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO],
    ),
    nombre_gremio_emisor: str(valores.nombre_gremio_emisor),
    estado_gremio_emisor: str(valores.estado_gremio_emisor),
    direccion_gremio_emisor: str(valores.direccion_gremio_emisor),
    nombre_firmante_gremio: str(valores.nombre_firmante_gremio),
    cedula_firmante_gremio: str(valores.cedula_firmante_gremio),
    cargo_firmante_gremio: str(valores.cargo_firmante_gremio),
    inpreabogado_firmante_gremio: str(valores.inpreabogado_firmante_gremio),
    nombre_postulante_gremio: str(valores.nombre_postulante_gremio),
    apellido_postulante_gremio: str(valores.apellido_postulante_gremio),
    cedula_postulante_gremio: str(valores.cedula_postulante_gremio),
    inpreabogado_postulante_colegio: str(valores.inpreabogado_postulante_colegio),
    fecha_inscripcion_gremio: str(valores.fecha_inscripcion_gremio),
    fecha_expedicion_gremio: str(valores.fecha_expedicion_gremio),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaSolvenciaColegio(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_SOLVENCIA]: str(
      valores[KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_SOLVENCIA],
    ),
    [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_COLEGIO]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_COLEGIO],
    ),
    nombre_gremio_emisor_solvencia: str(valores.nombre_gremio_emisor_solvencia),
    estado_gremio_solvencia: str(valores.estado_gremio_solvencia),
    direccion_gremio_solvencia: str(valores.direccion_gremio_solvencia),
    nombre_quiensuscribe_solvencia: str(valores.nombre_quiensuscribe_solvencia),
    cedula_quiensuscribe_solvencia: str(valores.cedula_quiensuscribe_solvencia),
    cargo_quiensuscribe_solvencia: str(valores.cargo_quiensuscribe_solvencia),
    inpreabogado_quiensuscribe_solvencia: str(
      valores.inpreabogado_quiensuscribe_solvencia,
    ),
    nombre_postulante_solvencia: str(valores.nombre_postulante_solvencia),
    apellido_postulante_solvencia: str(valores.apellido_postulante_solvencia),
    cedula_postulante_solvencia: str(valores.cedula_postulante_solvencia),
    inpreabogado_postulante_solvencia: str(valores.inpreabogado_postulante_solvencia),
    estatus_gremial_solvencia: str(valores.estatus_gremial_solvencia),
    fecha_suscripcion_solvencia: str(valores.fecha_suscripcion_solvencia),
    periodo_vigencia_solvencia: str(valores.periodo_vigencia_solvencia),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaInscripcionInpreabogado(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO]: str(
      valores[KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO],
    ),
    [KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO],
    ),
    nombre_quiensuscribe_inpreabogado: str(valores.nombre_quiensuscribe_inpreabogado),
    cedula_quiensuscribe_inpreabogado: str(valores.cedula_quiensuscribe_inpreabogado),
    cargo_quiensuscribe_inpreabogado: str(valores.cargo_quiensuscribe_inpreabogado),
    numero_quiensuscribe_inpreabogado: str(valores.numero_quiensuscribe_inpreabogado),
    nombre_postulante_inpreabogado: str(valores.nombre_postulante_inpreabogado),
    apellido_postulante_inpreabogado: str(valores.apellido_postulante_inpreabogado),
    cedula_postulante_inpreabogado: str(valores.cedula_postulante_inpreabogado),
    inpreabogado_postulante_nacional: str(valores.inpreabogado_postulante_nacional),
    fecha_inscripcion_inpreabogado: str(valores.fecha_inscripcion_inpreabogado),
    fecha_expedicion_inpreabogado: str(valores.fecha_expedicion_inpreabogado),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaSolvenciaInpreabogado(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_FIRMANTE_SOLVENCIA_INPRE]: str(
      valores[KEY_PREFIJO_CEDULA_FIRMANTE_SOLVENCIA_INPRE],
    ),
    [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_INPRE]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_INPRE],
    ),
    nombre_firmante_solvencia_inpreabogado: str(
      valores.nombre_firmante_solvencia_inpreabogado,
    ),
    cedula_firmante_solvencia_inpreabogado: str(
      valores.cedula_firmante_solvencia_inpreabogado,
    ),
    cargo_firmante_solvencia_inpreabogado: str(
      valores.cargo_firmante_solvencia_inpreabogado,
    ),
    inpreabogado_firmante_solvencia: str(valores.inpreabogado_firmante_solvencia),
    nombre_postulante_solvencia_inpreabogado: str(
      valores.nombre_postulante_solvencia_inpreabogado,
    ),
    apellido_postulante_solvencia_inpreabogado: str(
      valores.apellido_postulante_solvencia_inpreabogado,
    ),
    cedula_postulante_solvencia_inpreabogado: str(
      valores.cedula_postulante_solvencia_inpreabogado,
    ),
    inpreabogado_solicitante_solvencia: str(
      valores.inpreabogado_solicitante_solvencia,
    ),
    dictamen_solvencia_inpreabogado: str(valores.dictamen_solvencia_inpreabogado),
    fecha_expedicion_solvencia_inpreabogado: str(
      valores.fecha_expedicion_solvencia_inpreabogado,
    ),
    periodo_vigencia_solvencia_inpreabogado: str(
      valores.periodo_vigencia_solvencia_inpreabogado,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaPruebaEjercicioLibre(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    tipo_documento_ejerciciolibre: str(valores.tipo_documento_ejerciciolibre),
    nombre_postulante_ejerciciolibre: str(valores.nombre_postulante_ejerciciolibre),
    apellido_postulante_ejerciciolibre: str(
      valores.apellido_postulante_ejerciciolibre,
    ),
    inpreabogado_postulante_ejerciciolibre: str(
      valores.inpreabogado_postulante_ejerciciolibre,
    ),
    rol_postulante_ejerciciolibre: str(valores.rol_postulante_ejerciciolibre),
    fecha_acto_ejerciciolibre: str(valores.fecha_acto_ejerciciolibre),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaCertificacionDocente(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA],
    ),
    nombre_universidad_docencia: str(valores.nombre_universidad_docencia),
    facultad_docencia: str(valores.facultad_docencia),
    organo_expedidor_docencia: str(valores.organo_expedidor_docencia),
    catedra_impartida_docencia: str(valores.catedra_impartida_docencia),
    nivel_docente_docencia: str(valores.nivel_docente_docencia),
    nombre_postulante_docencia: str(valores.nombre_postulante_docencia),
    apellido_postulante_docencia: str(valores.apellido_postulante_docencia),
    cedula_postulante_docencia: str(valores.cedula_postulante_docencia),
    fecha_inicio_docencia: str(valores.fecha_inicio_docencia),
    fecha_corte_docencia: str(valores.fecha_corte_docencia),
    condicion_docente_docencia: str(valores.condicion_docente_docencia),
    escalafon_docente_docencia: str(valores.escalafon_docente_docencia),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaActaConcursoDocente(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE],
    ),
    nombre_universidad_concursodocente: str(
      valores.nombre_universidad_concursodocente,
    ),
    facultad_concursodocente: str(valores.facultad_concursodocente),
    catedra_concursodocente: str(valores.catedra_concursodocente),
    numero_acta_concursodocente: str(valores.numero_acta_concursodocente),
    fecha_acta_concursodocente: str(valores.fecha_acta_concursodocente),
    veredicto_concursodocente: str(valores.veredicto_concursodocente),
    categoria_otorgada_concursodocente: str(
      valores.categoria_otorgada_concursodocente,
    ),
    jurado_examinador_concursodocente: str(
      valores.jurado_examinador_concursodocente,
    ),
    nombre_postulante_concursodocente: str(
      valores.nombre_postulante_concursodocente,
    ),
    apellido_postulante_concursodocente: str(
      valores.apellido_postulante_concursodocente,
    ),
    cedula_postulante_concursodocente: str(
      valores.cedula_postulante_concursodocente,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaCarreraJudicial(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL],
    ),
    entidad_emisora_carrerajudicial: str(valores.entidad_emisora_carrerajudicial),
    nombre_postulante_carrerajudicial: str(
      valores.nombre_postulante_carrerajudicial,
    ),
    apellido_postulante_carrerajudicial: str(
      valores.apellido_postulante_carrerajudicial,
    ),
    cedula_postulante_carrerajudicial: str(
      valores.cedula_postulante_carrerajudicial,
    ),
    expediente_dem_carrerajudicial: str(valores.expediente_dem_carrerajudicial),
    fecha_ingreso_judicatura: str(valores.fecha_ingreso_judicatura),
    fecha_corte_carrerajudicial: str(valores.fecha_corte_carrerajudicial),
    condicion_cargo_carrerajudicial: str(valores.condicion_cargo_carrerajudicial),
    cargo_desempeñado_carrerajudicial: str(
      valores.cargo_desempeñado_carrerajudicial,
    ),
    tribunal_competencia_carrerajudicial: str(
      valores.tribunal_competencia_carrerajudicial,
    ),
    circuito_judicial_carrerajudicial: str(
      valores.circuito_judicial_carrerajudicial,
    ),
    estado_circunscripcion_carrerajudicial: str(
      valores.estado_circunscripcion_carrerajudicial,
    ),
    resolucion_nombramiento_carrerajudicial: str(
      valores.resolucion_nombramiento_carrerajudicial,
    ),
    periodo_desempeño_carrerajudicial: str(
      valores.periodo_desempeño_carrerajudicial,
    ),
    es_juez_superior_carrerajudicial: str(
      valores.es_juez_superior_carrerajudicial,
    ),
    ausencia_sanciones_carrerajudicial: str(
      valores.ausencia_sanciones_carrerajudicial,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaCarreraFuncionarial(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL]: str(
      valores[KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL],
    ),
    [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL]: str(
      valores[KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL],
    ),
    organo_emisor_carrerafuncionarial: str(
      valores.organo_emisor_carrerafuncionarial,
    ),
    estado_entidad_carrerafuncionarial: str(
      valores.estado_entidad_carrerafuncionarial,
    ),
    municipio_entidad_carrerafuncionarial: str(
      valores.municipio_entidad_carrerafuncionarial,
    ),
    direccion_entidad_carrerafuncionarial: str(
      valores.direccion_entidad_carrerafuncionarial,
    ),
    nombre_quiensuscribe_carrerafuncionarial: str(
      valores.nombre_quiensuscribe_carrerafuncionarial,
    ),
    cedula_quiensuscribe_carrerafuncionarial: str(
      valores.cedula_quiensuscribe_carrerafuncionarial,
    ),
    cargo_quiensuscribe_carrerafuncionarial: str(
      valores.cargo_quiensuscribe_carrerafuncionarial,
    ),
    nombre_postulante_carrerafuncionarial: str(
      valores.nombre_postulante_carrerafuncionarial,
    ),
    apellido_postulante_carrerafuncionarial: str(
      valores.apellido_postulante_carrerafuncionarial,
    ),
    cedula_postulante_carrerafuncionarial: str(
      valores.cedula_postulante_carrerafuncionarial,
    ),
    fecha_ingreso_carrerafuncionarial: str(
      valores.fecha_ingreso_carrerafuncionarial,
    ),
    estatus_servicio_carrerafuncionarial: str(
      valores.estatus_servicio_carrerafuncionarial,
    ),
    condicion_cargo_carrerafuncionarial: str(
      valores.condicion_cargo_carrerafuncionarial,
    ),
    cargo_desempenado_carrerafuncionarial: str(
      valores.cargo_desempenado_carrerafuncionarial,
    ),
    dependencia_adscripcion_carrerafuncionarial: str(
      valores.dependencia_adscripcion_carrerafuncionarial,
    ),
    naturaleza_cargo_carrerafuncionarial: str(
      valores.naturaleza_cargo_carrerafuncionarial,
    ),
    acto_designacion_carrerafuncionarial: str(
      valores.acto_designacion_carrerafuncionarial,
    ),
    periodo_desempeno_carrerafuncionarial: str(
      valores.periodo_desempeno_carrerafuncionarial,
    ),
    ausencia_sanciones_carrerafuncionarial: str(
      valores.ausencia_sanciones_carrerafuncionarial,
    ),
    fecha_expedicion_carrerafuncionarial: str(
      valores.fecha_expedicion_carrerafuncionarial,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaDjNoMilitancia(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA]: str(
      valores[KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA],
    ),
    nombre_declarante_nomilitancia: str(valores.nombre_declarante_nomilitancia),
    apellido_declarante_nomilitancia: str(
      valores.apellido_declarante_nomilitancia,
    ),
    estadocivil_declarante_nomilitancia: str(
      valores.estadocivil_declarante_nomilitancia,
    ),
    cedula_declarante_nomilitancia: str(valores.cedula_declarante_nomilitancia),
    manifestacion_nomilitancia: str(valores.manifestacion_nomilitancia),
    aclaratoria_renuncia_nomilitancia: str(
      valores.aclaratoria_renuncia_nomilitancia,
    ),
    estado_notaria_nomilitancia: str(valores.estado_notaria_nomilitancia),
    municipio_notaria_nomilitancia: str(valores.municipio_notaria_nomilitancia),
    nombre_notaria_nomilitancia: str(valores.nombre_notaria_nomilitancia),
    numero_folio_nomilitancia: str(valores.numero_folio_nomilitancia),
    numero_tomo_nomilitancia: str(valores.numero_tomo_nomilitancia),
    fecha_otorgamiento_nomilitancia: str(
      valores.fecha_otorgamiento_nomilitancia,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaDjNoParentesco(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOPARENTESCO]: str(
      valores[KEY_PREFIJO_CEDULA_DECLARANTE_NOPARENTESCO],
    ),
    nombre_declarante_noparentesco: str(valores.nombre_declarante_noparentesco),
    apellido_declarante_noparentesco: str(
      valores.apellido_declarante_noparentesco,
    ),
    estadocivil_declarante_noparentesco: str(
      valores.estadocivil_declarante_noparentesco,
    ),
    cedula_declarante_noparentesco: str(valores.cedula_declarante_noparentesco),
    manifestacion_ausenciavinculo_noparentesco: str(
      valores.manifestacion_ausenciavinculo_noparentesco,
    ),
    constancia_altosfuncionarios_noparentesco: str(
      valores.constancia_altosfuncionarios_noparentesco,
    ),
    estado_notaria_noparentesco: str(valores.estado_notaria_noparentesco),
    municipio_notaria_noparentesco: str(valores.municipio_notaria_noparentesco),
    nombre_notaria_noparentesco: str(valores.nombre_notaria_noparentesco),
    numero_folio_noparentesco: str(valores.numero_folio_noparentesco),
    numero_tomo_noparentesco: str(valores.numero_tomo_noparentesco),
    fecha_otorgamiento_noparentesco: str(
      valores.fecha_otorgamiento_noparentesco,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaActaMatrimonio(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO]: str(
      valores[KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO],
    ),
    [KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO]: str(
      valores[KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO],
    ),
    nombrejefatura_matrimonio_postulante: str(
      valores.nombrejefatura_matrimonio_postulante,
    ),
    numeroacta_matrimonio_postulante: str(
      valores.numeroacta_matrimonio_postulante,
    ),
    folio_matrimonio_postulante: str(valores.folio_matrimonio_postulante),
    tomo_matrimonio_postulante: str(valores.tomo_matrimonio_postulante),
    anio_matrimonio_postulante: str(valores.anio_matrimonio_postulante),
    nombre_conyugematrimonio_postulante: str(
      valores.nombre_conyugematrimonio_postulante,
    ),
    apellido_conyugematrimonio_postulante: str(
      valores.apellido_conyugematrimonio_postulante,
    ),
    cedula_conyugematrimonio_postulante: str(
      valores.cedula_conyugematrimonio_postulante,
    ),
    nombre_segundoconyuge_postulante: str(
      valores.nombre_segundoconyuge_postulante,
    ),
    apellido_segundoconyuge_postulante: str(
      valores.apellido_segundoconyuge_postulante,
    ),
    cedula_segundoconyuge_postulante: str(
      valores.cedula_segundoconyuge_postulante,
    ),
    fecha_celebracionmatrimonio_postulante: str(
      valores.fecha_celebracionmatrimonio_postulante,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaDjNoContratacion(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION]: str(
      valores[KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION],
    ),
    nombre_declarante_nocontratacion: str(
      valores.nombre_declarante_nocontratacion,
    ),
    apellido_declarante_nocontratacion: str(
      valores.apellido_declarante_nocontratacion,
    ),
    estadocivil_declarante_nocontratacion: str(
      valores.estadocivil_declarante_nocontratacion,
    ),
    cedula_declarante_nocontratacion: str(
      valores.cedula_declarante_nocontratacion,
    ),
    declaracion_inexistentecontratos_nocontratacion: str(
      valores.declaracion_inexistentecontratos_nocontratacion,
    ),
    declaracion_nolitigio_nocontratacion: str(
      valores.declaracion_nolitigio_nocontratacion,
    ),
    estado_notaria_nocontratacion: str(valores.estado_notaria_nocontratacion),
    municipio_notaria_nocontratacion: str(
      valores.municipio_notaria_nocontratacion,
    ),
    nombre_notaria_nocontratacion: str(valores.nombre_notaria_nocontratacion),
    numero_folio_nocontratacion: str(valores.numero_folio_nocontratacion),
    numero_tomo_nocontratacion: str(valores.numero_tomo_nocontratacion),
    fecha_otorgamiento_nocontratacion: str(
      valores.fecha_otorgamiento_nocontratacion,
    ),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaSintesisCurricular(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_SINTESIS]: str(valores[KEY_PREFIJO_CEDULA_SINTESIS]),
    [KEY_PREFIJO_INPRE_SINTESIS]: str(valores[KEY_PREFIJO_INPRE_SINTESIS]),
    nombre_postulante_sintesis: str(valores.nombre_postulante_sintesis),
    apellido_postulante_sintesis: str(valores.apellido_postulante_sintesis),
    estadocivil_postulante_sintesis: str(valores.estadocivil_postulante_sintesis),
    cedula_postulante_sintesis: str(valores.cedula_postulante_sintesis),
    inpreabogado_postulante_sintesis: str(valores.inpreabogado_postulante_sintesis),
    correo_postulante_sintesis: str(valores.correo_postulante_sintesis),
    ocupacion_postulante_sintesis: str(valores.ocupacion_postulante_sintesis),
    telefono_postulante_sintesis: str(valores.telefono_postulante_sintesis),
    estado_ubicacion_sintesis: str(valores.estado_ubicacion_sintesis),
    municipio_ubicacion_sintesis: str(valores.municipio_ubicacion_sintesis),
    ciudad_ubicacion_sintesis: str(valores.ciudad_ubicacion_sintesis),
    direccion_trabajo_sintesis: str(valores.direccion_trabajo_sintesis),
    direccion_habitacion_sintesis: str(valores.direccion_habitacion_sintesis),
    ...metaDesdeValores(valores),
  };
}

function normalizarParaOtroDocumento(
  valores: Readonly<ValoresFormularioRevision>,
): Record<string, unknown> {
  return {
    [KEY_PREFIJO_CEDULA_OTRO]: str(valores[KEY_PREFIJO_CEDULA_OTRO]),
    [KEY_PREFIJO_INPRE_OTRO]: str(valores[KEY_PREFIJO_INPRE_OTRO]),
    nombre_postulante_otro: str(valores.nombre_postulante_otro),
    apellido_postulante_otro: str(valores.apellido_postulante_otro),
    estadocivil_postulante_otro: str(valores.estadocivil_postulante_otro),
    cedula_postulante_otro: str(valores.cedula_postulante_otro),
    inpreabogado_postulante_otro: str(valores.inpreabogado_postulante_otro),
    descripcion_documento_otro: str(valores.descripcion_documento_otro),
    ...metaDesdeValores(valores),
  };
}

export function validarFormularioCedula(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioCedulaSchema.safeParse(normalizarParaCedula(valores));
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioPartida(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioPartidaSchema.safeParse(normalizarParaPartida(valores));
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioDjOtraNacionalidad(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioDjOtraNacionalidadSchema.safeParse(
    normalizarParaDjOtraNacionalidad(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioSolvenciaDeontologica(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioSolvenciaDeontologicaSchema.safeParse(
    normalizarParaSolvenciaDeontologica(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioCertMedicaMental(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioCertMedicaMentalSchema.safeParse(
    normalizarParaCertMedicaMental(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioAntecedentesPenales(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioAntecedentesPenalesSchema.safeParse(
    normalizarParaAntecedentesPenales(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioContraloriaCgr(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioContraloriaCgrSchema.safeParse(normalizarParaContraloriaCgr(valores));
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioTituloPregrado(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioTituloPregradoSchema.safeParse(normalizarParaTituloPregrado(valores));
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioTituloEspecialidad(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioTituloEspecialidadSchema.safeParse(
    normalizarParaTituloEspecialidad(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioConstanciaTeg(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioConstanciaTegSchema.safeParse(normalizarParaConstanciaTeg(valores));
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioTituloMaestria(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioTituloMaestriaSchema.safeParse(normalizarParaTituloMaestria(valores));
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioConstanciaMaestria(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioConstanciaMaestriaSchema.safeParse(
    normalizarParaConstanciaMaestria(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioTituloDoctorado(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioTituloDoctoradoSchema.safeParse(
    normalizarParaTituloDoctorado(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioConstanciaDoctorado(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioConstanciaDoctoradoSchema.safeParse(
    normalizarParaConstanciaDoctorado(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioInscripcionColegio(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioInscripcionColegioSchema.safeParse(
    normalizarParaInscripcionColegio(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioSolvenciaColegio(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioSolvenciaColegioSchema.safeParse(
    normalizarParaSolvenciaColegio(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioInscripcionInpreabogado(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioInscripcionInpreabogadoSchema.safeParse(
    normalizarParaInscripcionInpreabogado(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioSolvenciaInpreabogado(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioSolvenciaInpreabogadoSchema.safeParse(
    normalizarParaSolvenciaInpreabogado(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioPruebaEjercicioLibre(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioPruebaEjercicioLibreSchema.safeParse(
    normalizarParaPruebaEjercicioLibre(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioCertificacionDocente(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioCertificacionDocenteSchema.safeParse(
    normalizarParaCertificacionDocente(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioActaConcursoDocente(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioActaConcursoDocenteSchema.safeParse(
    normalizarParaActaConcursoDocente(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioCarreraJudicial(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioCarreraJudicialSchema.safeParse(
    normalizarParaCarreraJudicial(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioCarreraFuncionarial(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioCarreraFuncionarialSchema.safeParse(
    normalizarParaCarreraFuncionarial(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioDjNoMilitancia(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioDjNoMilitanciaSchema.safeParse(
    normalizarParaDjNoMilitancia(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioDjNoParentesco(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioDjNoParentescoSchema.safeParse(
    normalizarParaDjNoParentesco(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioActaMatrimonio(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioActaMatrimonioSchema.safeParse(
    normalizarParaActaMatrimonio(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioDjNoContratacion(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioDjNoContratacionSchema.safeParse(
    normalizarParaDjNoContratacion(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioSintesisCurricular(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioSintesisCurricularSchema.safeParse(
    normalizarParaSintesisCurricular(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioOtroDocumento(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioOtroDocumentoSchema.safeParse(
    normalizarParaOtroDocumento(valores),
  );
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioGenerico(
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  const r = formularioGenericoRevisionSchema.safeParse({
    notas: str(valores.notas),
    ...metaDesdeValores(valores),
  });
  return r.success ? {} : erroresDesdeZod(r.error);
}

export function validarFormularioRevision(
  slotKey: string,
  valores: Readonly<ValoresFormularioRevision>,
): ErroresFormularioRevision {
  if (esFormularioCedula(slotKey)) return validarFormularioCedula(valores);
  if (esFormularioPartida(slotKey)) return validarFormularioPartida(valores);
  if (esFormularioDjOtraNacionalidad(slotKey)) {
    return validarFormularioDjOtraNacionalidad(valores);
  }
  if (esFormularioSolvenciaDeontologica(slotKey)) {
    return validarFormularioSolvenciaDeontologica(valores);
  }
  if (esFormularioCertMedicaMental(slotKey)) {
    return validarFormularioCertMedicaMental(valores);
  }
  if (esFormularioAntecedentesPenales(slotKey)) {
    return validarFormularioAntecedentesPenales(valores);
  }
  if (esFormularioContraloriaCgr(slotKey)) {
    return validarFormularioContraloriaCgr(valores);
  }
  if (esFormularioTituloPregrado(slotKey)) {
    return validarFormularioTituloPregrado(valores);
  }
  if (esFormularioTituloEspecialidad(slotKey)) {
    return validarFormularioTituloEspecialidad(valores);
  }
  if (esFormularioConstanciaTeg(slotKey)) {
    return validarFormularioConstanciaTeg(valores);
  }
  if (esFormularioTituloMaestria(slotKey)) {
    return validarFormularioTituloMaestria(valores);
  }
  if (esFormularioConstanciaMaestria(slotKey)) {
    return validarFormularioConstanciaMaestria(valores);
  }
  if (esFormularioTituloDoctorado(slotKey)) {
    return validarFormularioTituloDoctorado(valores);
  }
  if (esFormularioConstanciaDoctorado(slotKey)) {
    return validarFormularioConstanciaDoctorado(valores);
  }
  if (esFormularioInscripcionColegio(slotKey)) {
    return validarFormularioInscripcionColegio(valores);
  }
  if (esFormularioSolvenciaColegio(slotKey)) {
    return validarFormularioSolvenciaColegio(valores);
  }
  if (esFormularioInscripcionInpreabogado(slotKey)) {
    return validarFormularioInscripcionInpreabogado(valores);
  }
  if (esFormularioSolvenciaInpreabogado(slotKey)) {
    return validarFormularioSolvenciaInpreabogado(valores);
  }
  if (esFormularioPruebaEjercicioLibre(slotKey)) {
    return validarFormularioPruebaEjercicioLibre(valores);
  }
  if (esFormularioCertificacionDocente(slotKey)) {
    return validarFormularioCertificacionDocente(valores);
  }
  if (esFormularioActaConcursoDocente(slotKey)) {
    return validarFormularioActaConcursoDocente(valores);
  }
  if (esFormularioCarreraJudicial(slotKey)) {
    return validarFormularioCarreraJudicial(valores);
  }
  if (esFormularioCarreraFuncionarial(slotKey)) {
    return validarFormularioCarreraFuncionarial(valores);
  }
  if (esFormularioDjNoMilitancia(slotKey)) {
    return validarFormularioDjNoMilitancia(valores);
  }
  if (esFormularioDjNoParentesco(slotKey)) {
    return validarFormularioDjNoParentesco(valores);
  }
  if (esFormularioActaMatrimonio(slotKey)) {
    return validarFormularioActaMatrimonio(valores);
  }
  if (esFormularioDjNoContratacion(slotKey)) {
    return validarFormularioDjNoContratacion(valores);
  }
  if (esFormularioSintesisCurricular(slotKey)) {
    return validarFormularioSintesisCurricular(valores);
  }
  if (esFormularioOtroDocumento(slotKey)) {
    return validarFormularioOtroDocumento(valores);
  }
  return validarFormularioGenerico(valores);
}

export function valoresVaciosCedula(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA]: "V",
    cedula_identidad_postulante: "",
    nombre_cedula_postulante: "",
    apellido_cedula_postulante: "",
    estadocivil_cedula_postulante: "",
    fechanacimiento_cedula_postulante: "",
    vigencia_cedula_postulante: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosPartida(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_PADRE]: "V",
    [KEY_PREFIJO_CEDULA_MADRE]: "V",
    nombre_partida_postulante: "",
    apellido_partida_postulante: "",
    fechanacimiento_partida_postulante: "",
    nombrepadre_partida_postulante: "",
    nacionalidadpadre_partida_postulante: "",
    cedulapadre_partida_postulante: "",
    nombremadre_partida_postulante: "",
    nacionalidadmadre_partida_postulante: "",
    cedulamadre_partida_postulante: "",
    nombrejefatura_partida_postulante: "",
    numeroacta_partida_postulante: "",
    tomo_partida_postulante: "",
    año_partida_postulante: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosDjOtraNacionalidad(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_OTRA]: "V",
    nombre_declarante_otranacionalidad: "",
    apellido_declarante_otranacionalidad: "",
    estadocivil_declarante_otranacionalidad: "",
    cedula_declarante_otranacionalidad: "",
    noposee_declaracion: "",
    renuncia_otranacionalidad: "",
    estado_otranacionalidad: "",
    municipio_otranacionalidad: "",
    nombrenotaria_otranacionalidad: "",
    numerofolio_otranacionalidad: "",
    numerotomo_otranacionalidad: "",
    fechaotorgamiento_otranacionalidad: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosSolvenciaDeontologica(): ValoresFormularioRevision {
  return {
    nombre_entidad_deontologica: "",
    estado_entidad_deontologica: "",
    municipio_entidad_deontologica: "",
    direccion_entidad_deontologica: "",
    nombre_quiensuscribe_deontologica: "",
    cedula_quiensuscribe_deontologica: "",
    cargo_quiensuscribe_deontologica: "",
    inpreabogado_quiensuscribe_deontologica: "",
    nombre_postulante_deontologica: "",
    apellido_postulante_deontologica: "",
    cedula_postulante_deontologica: "",
    inpreabogado_postulante_deontologica: "",
    declaracion_solvencia_deontologica: "",
    fecha_expedicion_deontologica: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosCertMedicaMental(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_SALUD]: "V",
    nombre_profesional_salud: "",
    cedula_profesional_salud: "",
    profesion_profesional_salud: "",
    colegiacion_profesional_salud: "",
    nombre_postulante_salud: "",
    apellido_postulante_salud: "",
    cedula_postulante_salud: "",
    conclusion_diagnostica_salud: "",
    fecha_expedicion_salud: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosAntecedentesPenales(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_PENALES]: "V",
    nombre_entidad_penales: "",
    nombre_quiensuscribe_penales: "",
    cargo_quiensuscribe_penales: "",
    designacion_quiensuscribe_penales: "",
    nombre_postulante_penales: "",
    apellido_postulante_penales: "",
    cedula_postulante_penales: "",
    dictamen_expreso_penales: "",
    codigo_verificacion_penales: "",
    fecha_suscripcion_penales: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosContraloriaCgr(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CGR]: "V",
    nombre_direccion_cgr: "",
    nombre_quiensuscribe_cgr: "",
    cargo_quiensuscribe_cgr: "",
    designacion_quiensuscribe_cgr: "",
    nombre_postulante_cgr: "",
    apellido_postulante_cgr: "",
    cedula_postulante_cgr: "",
    dictamen_expreso_cgr: "",
    codigo_verificacion_cgr: "",
    fecha_suscripcion_cgr: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosTituloPregrado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_PREGRADO]: "V",
    nombre_universidad_pregrado: "",
    nombre_rector_pregrado: "",
    nombre_secretario_pregrado: "",
    titulo_postulante_pregrado: "",
    nombre_postulante_pregrado: "",
    apellido_postulante_pregrado: "",
    cedula_postulante_pregrado: "",
    mencion_honor_pregrado: "",
    fecha_graduacion_pregrado: "",
    registro_publico_pregrado: "",
    numero_asentamiento_pregrado: "",
    tomo_registro_pregrado: "",
    folio_registro_pregrado: "",
    fecha_protocolizacion_pregrado: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosTituloEspecialidad(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_ESPECIALIDAD]: "V",
    nombre_universidad_especialidad: "",
    nombre_rector_especialidad: "",
    nombre_secretario_especialidad: "",
    rama_especialidad_derecho: "",
    nombre_pregrado_especialidad: "",
    nombre_postulante_especialidad: "",
    apellido_postulante_especialidad: "",
    cedula_postulante_especialidad: "",
    fecha_graduacion_especialidad: "",
    registro_publico_especialidad: "",
    numero_asentamiento_especialidad: "",
    tomo_registro_especialidad: "",
    folio_registro_especialidad: "",
    fecha_protocolizacion_especialidad: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosConstanciaTeg(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TEG]: "V",
    nombre_universidad_teg: "",
    rama_especialidad_teg: "",
    titulo_trabajo_grado: "",
    nombre_postulante_teg: "",
    apellido_postulante_teg: "",
    cedula_postulante_teg: "",
    jurado_examinador_teg: "",
    veredicto_calificacion_teg: "",
    fecha_defensa_teg: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosTituloMaestria(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_MAESTRIA]: "V",
    nombre_universidad_maestria: "",
    nombre_rector_maestria: "",
    nombre_secretario_maestria: "",
    area_maestria_derecho: "",
    nombre_pregrado_maestria: "",
    nombre_postulante_maestria: "",
    apellido_postulante_maestria: "",
    cedula_postulante_maestria: "",
    fecha_graduacion_maestria: "",
    registro_publico_maestria: "",
    numero_asentamiento_maestria: "",
    tomo_registro_maestria: "",
    folio_registro_maestria: "",
    fecha_protocolizacion_maestria: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosConstanciaMaestria(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_MAESTRIA]: "V",
    nombre_universidad_tesis_maestria: "",
    area_maestria_tesis: "",
    titulo_trabajo_maestria: "",
    nombre_postulante_tesis_maestria: "",
    apellido_postulante_tesis_maestria: "",
    cedula_postulante_tesis_maestria: "",
    jurado_examinador_maestria: "",
    veredicto_calificacion_maestria: "",
    fecha_defensa_maestria: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosTituloDoctorado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO]: "V",
    nombre_universidad_doctorado: "",
    nombre_rector_doctorado: "",
    nombre_secretario_doctorado: "",
    denominacion_titulo_doctorado: "",
    nombre_pregrado_doctorado: "",
    nombre_postulante_doctorado: "",
    apellido_postulante_doctorado: "",
    cedula_postulante_doctorado: "",
    fecha_graduacion_doctorado: "",
    registro_publico_doctorado: "",
    numero_asentamiento_doctorado: "",
    tomo_registro_doctorado: "",
    folio_registro_doctorado: "",
    fecha_protocolizacion_doctorado: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosConstanciaDoctorado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO]: "V",
    nombre_universidad_tesis_doctorado: "",
    denominacion_titulo_tesis_doctorado: "",
    titulo_tesis_doctorado: "",
    nombre_postulante_tesis_doctorado: "",
    apellido_postulante_tesis_doctorado: "",
    cedula_postulante_tesis_doctorado: "",
    jurado_examinador_doctorado: "",
    veredicto_calificacion_doctorado: "",
    fecha_defensa_doctorado: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosInscripcionColegio(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO]: "V",
    nombre_gremio_emisor: "",
    estado_gremio_emisor: "",
    direccion_gremio_emisor: "",
    nombre_firmante_gremio: "",
    cedula_firmante_gremio: "",
    cargo_firmante_gremio: "",
    inpreabogado_firmante_gremio: "",
    nombre_postulante_gremio: "",
    apellido_postulante_gremio: "",
    cedula_postulante_gremio: "",
    inpreabogado_postulante_colegio: "",
    fecha_inscripcion_gremio: "",
    fecha_expedicion_gremio: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosSolvenciaColegio(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_SOLVENCIA]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_COLEGIO]: "V",
    nombre_gremio_emisor_solvencia: "",
    estado_gremio_solvencia: "",
    direccion_gremio_solvencia: "",
    nombre_quiensuscribe_solvencia: "",
    cedula_quiensuscribe_solvencia: "",
    cargo_quiensuscribe_solvencia: "",
    inpreabogado_quiensuscribe_solvencia: "",
    nombre_postulante_solvencia: "",
    apellido_postulante_solvencia: "",
    cedula_postulante_solvencia: "",
    inpreabogado_postulante_solvencia: "",
    estatus_gremial_solvencia: "",
    fecha_suscripcion_solvencia: "",
    periodo_vigencia_solvencia: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosInscripcionInpreabogado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO]: "V",
    nombre_quiensuscribe_inpreabogado: "",
    cedula_quiensuscribe_inpreabogado: "",
    cargo_quiensuscribe_inpreabogado: "",
    numero_quiensuscribe_inpreabogado: "",
    nombre_postulante_inpreabogado: "",
    apellido_postulante_inpreabogado: "",
    cedula_postulante_inpreabogado: "",
    inpreabogado_postulante_nacional: "",
    fecha_inscripcion_inpreabogado: "",
    fecha_expedicion_inpreabogado: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosSolvenciaInpreabogado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_FIRMANTE_SOLVENCIA_INPRE]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_INPRE]: "V",
    nombre_firmante_solvencia_inpreabogado: "",
    cedula_firmante_solvencia_inpreabogado: "",
    cargo_firmante_solvencia_inpreabogado: "",
    inpreabogado_firmante_solvencia: "",
    nombre_postulante_solvencia_inpreabogado: "",
    apellido_postulante_solvencia_inpreabogado: "",
    cedula_postulante_solvencia_inpreabogado: "",
    inpreabogado_solicitante_solvencia: "",
    dictamen_solvencia_inpreabogado: "",
    fecha_expedicion_solvencia_inpreabogado: "",
    periodo_vigencia_solvencia_inpreabogado: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosPruebaEjercicioLibre(): ValoresFormularioRevision {
  return {
    tipo_documento_ejerciciolibre: "",
    nombre_postulante_ejerciciolibre: "",
    apellido_postulante_ejerciciolibre: "",
    inpreabogado_postulante_ejerciciolibre: "",
    rol_postulante_ejerciciolibre: "",
    fecha_acto_ejerciciolibre: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosCertificacionDocente(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA]: "V",
    nombre_universidad_docencia: "",
    facultad_docencia: "",
    organo_expedidor_docencia: "",
    catedra_impartida_docencia: "",
    nivel_docente_docencia: "",
    nombre_postulante_docencia: "",
    apellido_postulante_docencia: "",
    cedula_postulante_docencia: "",
    fecha_inicio_docencia: "",
    fecha_corte_docencia: "",
    condicion_docente_docencia: "",
    escalafon_docente_docencia: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosActaConcursoDocente(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE]: "V",
    nombre_universidad_concursodocente: "",
    facultad_concursodocente: "",
    catedra_concursodocente: "",
    numero_acta_concursodocente: "",
    fecha_acta_concursodocente: "",
    veredicto_concursodocente: "",
    categoria_otorgada_concursodocente: "",
    jurado_examinador_concursodocente: "",
    nombre_postulante_concursodocente: "",
    apellido_postulante_concursodocente: "",
    cedula_postulante_concursodocente: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosCarreraJudicial(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL]: "V",
    entidad_emisora_carrerajudicial: "",
    nombre_postulante_carrerajudicial: "",
    apellido_postulante_carrerajudicial: "",
    cedula_postulante_carrerajudicial: "",
    expediente_dem_carrerajudicial: "",
    fecha_ingreso_judicatura: "",
    fecha_corte_carrerajudicial: "",
    condicion_cargo_carrerajudicial: "",
    cargo_desempeñado_carrerajudicial: "",
    tribunal_competencia_carrerajudicial: "",
    circuito_judicial_carrerajudicial: "",
    estado_circunscripcion_carrerajudicial: "",
    resolucion_nombramiento_carrerajudicial: "",
    periodo_desempeño_carrerajudicial: "",
    es_juez_superior_carrerajudicial: "",
    ausencia_sanciones_carrerajudicial: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosCarreraFuncionarial(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL]: "V",
    organo_emisor_carrerafuncionarial: "",
    estado_entidad_carrerafuncionarial: "",
    municipio_entidad_carrerafuncionarial: "",
    direccion_entidad_carrerafuncionarial: "",
    nombre_quiensuscribe_carrerafuncionarial: "",
    cedula_quiensuscribe_carrerafuncionarial: "",
    cargo_quiensuscribe_carrerafuncionarial: "",
    nombre_postulante_carrerafuncionarial: "",
    apellido_postulante_carrerafuncionarial: "",
    cedula_postulante_carrerafuncionarial: "",
    fecha_ingreso_carrerafuncionarial: "",
    estatus_servicio_carrerafuncionarial: "",
    condicion_cargo_carrerafuncionarial: "",
    cargo_desempenado_carrerafuncionarial: "",
    dependencia_adscripcion_carrerafuncionarial: "",
    naturaleza_cargo_carrerafuncionarial: "",
    acto_designacion_carrerafuncionarial: "",
    periodo_desempeno_carrerafuncionarial: "",
    ausencia_sanciones_carrerafuncionarial: "",
    fecha_expedicion_carrerafuncionarial: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosDjNoMilitancia(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA]: "V",
    nombre_declarante_nomilitancia: "",
    apellido_declarante_nomilitancia: "",
    estadocivil_declarante_nomilitancia: "",
    cedula_declarante_nomilitancia: "",
    manifestacion_nomilitancia: "",
    aclaratoria_renuncia_nomilitancia: "",
    estado_notaria_nomilitancia: "",
    municipio_notaria_nomilitancia: "",
    nombre_notaria_nomilitancia: "",
    numero_folio_nomilitancia: "",
    numero_tomo_nomilitancia: "",
    fecha_otorgamiento_nomilitancia: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosDjNoParentesco(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOPARENTESCO]: "V",
    nombre_declarante_noparentesco: "",
    apellido_declarante_noparentesco: "",
    estadocivil_declarante_noparentesco: "",
    cedula_declarante_noparentesco: "",
    manifestacion_ausenciavinculo_noparentesco: "",
    constancia_altosfuncionarios_noparentesco: "",
    estado_notaria_noparentesco: "",
    municipio_notaria_noparentesco: "",
    nombre_notaria_noparentesco: "",
    numero_folio_noparentesco: "",
    numero_tomo_noparentesco: "",
    fecha_otorgamiento_noparentesco: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosActaMatrimonio(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO]: "V",
    [KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO]: "V",
    nombrejefatura_matrimonio_postulante: "",
    numeroacta_matrimonio_postulante: "",
    folio_matrimonio_postulante: "",
    tomo_matrimonio_postulante: "",
    anio_matrimonio_postulante: "",
    nombre_conyugematrimonio_postulante: "",
    apellido_conyugematrimonio_postulante: "",
    cedula_conyugematrimonio_postulante: "",
    nombre_segundoconyuge_postulante: "",
    apellido_segundoconyuge_postulante: "",
    cedula_segundoconyuge_postulante: "",
    fecha_celebracionmatrimonio_postulante: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosDjNoContratacion(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION]: "V",
    nombre_declarante_nocontratacion: "",
    apellido_declarante_nocontratacion: "",
    estadocivil_declarante_nocontratacion: "",
    cedula_declarante_nocontratacion: "",
    declaracion_inexistentecontratos_nocontratacion: "",
    declaracion_nolitigio_nocontratacion: "",
    estado_notaria_nocontratacion: "",
    municipio_notaria_nocontratacion: "",
    nombre_notaria_nocontratacion: "",
    numero_folio_nocontratacion: "",
    numero_tomo_nocontratacion: "",
    fecha_otorgamiento_nocontratacion: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosSintesisCurricular(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_SINTESIS]: "V",
    [KEY_PREFIJO_INPRE_SINTESIS]: "V",
    nombre_postulante_sintesis: "",
    apellido_postulante_sintesis: "",
    estadocivil_postulante_sintesis: "",
    cedula_postulante_sintesis: "",
    inpreabogado_postulante_sintesis: "",
    correo_postulante_sintesis: "",
    ocupacion_postulante_sintesis: "",
    telefono_postulante_sintesis: "",
    estado_ubicacion_sintesis: "",
    municipio_ubicacion_sintesis: "",
    ciudad_ubicacion_sintesis: "",
    direccion_trabajo_sintesis: "",
    direccion_habitacion_sintesis: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosOtroDocumento(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_OTRO]: "V",
    [KEY_PREFIJO_INPRE_OTRO]: "V",
    nombre_postulante_otro: "",
    apellido_postulante_otro: "",
    estadocivil_postulante_otro: "",
    cedula_postulante_otro: "",
    inpreabogado_postulante_otro: "",
    descripcion_documento_otro: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

export function valoresVaciosParaSlot(slotKey: string): ValoresFormularioRevision {
  if (esFormularioCedula(slotKey)) return valoresVaciosCedula();
  if (esFormularioPartida(slotKey)) return valoresVaciosPartida();
  if (esFormularioDjOtraNacionalidad(slotKey)) return valoresVaciosDjOtraNacionalidad();
  if (esFormularioSolvenciaDeontologica(slotKey)) {
    return valoresVaciosSolvenciaDeontologica();
  }
  if (esFormularioCertMedicaMental(slotKey)) return valoresVaciosCertMedicaMental();
  if (esFormularioAntecedentesPenales(slotKey)) {
    return valoresVaciosAntecedentesPenales();
  }
  if (esFormularioContraloriaCgr(slotKey)) return valoresVaciosContraloriaCgr();
  if (esFormularioTituloPregrado(slotKey)) return valoresVaciosTituloPregrado();
  if (esFormularioTituloEspecialidad(slotKey)) return valoresVaciosTituloEspecialidad();
  if (esFormularioConstanciaTeg(slotKey)) return valoresVaciosConstanciaTeg();
  if (esFormularioTituloMaestria(slotKey)) return valoresVaciosTituloMaestria();
  if (esFormularioConstanciaMaestria(slotKey)) return valoresVaciosConstanciaMaestria();
  if (esFormularioTituloDoctorado(slotKey)) return valoresVaciosTituloDoctorado();
  if (esFormularioConstanciaDoctorado(slotKey)) {
    return valoresVaciosConstanciaDoctorado();
  }
  if (esFormularioInscripcionColegio(slotKey)) {
    return valoresVaciosInscripcionColegio();
  }
  if (esFormularioSolvenciaColegio(slotKey)) {
    return valoresVaciosSolvenciaColegio();
  }
  if (esFormularioInscripcionInpreabogado(slotKey)) {
    return valoresVaciosInscripcionInpreabogado();
  }
  if (esFormularioSolvenciaInpreabogado(slotKey)) {
    return valoresVaciosSolvenciaInpreabogado();
  }
  if (esFormularioPruebaEjercicioLibre(slotKey)) {
    return valoresVaciosPruebaEjercicioLibre();
  }
  if (esFormularioCertificacionDocente(slotKey)) {
    return valoresVaciosCertificacionDocente();
  }
  if (esFormularioActaConcursoDocente(slotKey)) {
    return valoresVaciosActaConcursoDocente();
  }
  if (esFormularioCarreraJudicial(slotKey)) {
    return valoresVaciosCarreraJudicial();
  }
  if (esFormularioCarreraFuncionarial(slotKey)) {
    return valoresVaciosCarreraFuncionarial();
  }
  if (esFormularioDjNoMilitancia(slotKey)) {
    return valoresVaciosDjNoMilitancia();
  }
  if (esFormularioDjNoParentesco(slotKey)) {
    return valoresVaciosDjNoParentesco();
  }
  if (esFormularioActaMatrimonio(slotKey)) {
    return valoresVaciosActaMatrimonio();
  }
  if (esFormularioDjNoContratacion(slotKey)) {
    return valoresVaciosDjNoContratacion();
  }
  if (esFormularioSintesisCurricular(slotKey)) {
    return valoresVaciosSintesisCurricular();
  }
  if (esFormularioOtroDocumento(slotKey)) {
    return valoresVaciosOtroDocumento();
  }
  return {
    notas: "",
    es_documento: null,
    calidad_legibilidad: null,
    advertencias: null,
  };
}

/** Relleno mock de IA: visibles + 3 invisibles (no marca verificado). */
export function rellenoIaCedula(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA]: "V",
    cedula_identidad_postulante: "12456789",
    nombre_cedula_postulante: "María Elena",
    apellido_cedula_postulante: "Rodríguez Páez",
    estadocivil_cedula_postulante: "Soltera",
    fechanacimiento_cedula_postulante: "1985-03-12",
    vigencia_cedula_postulante: "2030-06-15",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaPartida(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_PADRE]: "V",
    [KEY_PREFIJO_CEDULA_MADRE]: "V",
    nombre_partida_postulante: "María Elena",
    apellido_partida_postulante: "Rodríguez Páez",
    fechanacimiento_partida_postulante: "1985-03-12",
    nombrepadre_partida_postulante: "José Luis Rodríguez",
    nacionalidadpadre_partida_postulante: "Venezolana",
    cedulapadre_partida_postulante: "4567890",
    nombremadre_partida_postulante: "Carmen Páez de Rodríguez",
    nacionalidadmadre_partida_postulante: "Venezolana",
    cedulamadre_partida_postulante: "5678901",
    nombrejefatura_partida_postulante: "Registro Civil del Municipio Libertador",
    numeroacta_partida_postulante: "4521",
    tomo_partida_postulante: "12",
    año_partida_postulante: "1985",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaDjOtraNacionalidad(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_OTRA]: "V",
    nombre_declarante_otranacionalidad: "María Elena",
    apellido_declarante_otranacionalidad: "Rodríguez Páez",
    estadocivil_declarante_otranacionalidad: "Soltera",
    cedula_declarante_otranacionalidad: "12456789",
    noposee_declaracion:
      "Declaro bajo fe de juramento que ostento única y exclusivamente la nacionalidad venezolana por nacimiento y que no poseo, no he solicitado ni he optado a ninguna otra nacionalidad.",
    renuncia_otranacionalidad: "",
    estado_otranacionalidad: "Distrito Capital",
    municipio_otranacionalidad: "Libertador",
    nombrenotaria_otranacionalidad: "Notaría Pública Tercera de Caracas",
    numerofolio_otranacionalidad: "145",
    numerotomo_otranacionalidad: "8",
    fechaotorgamiento_otranacionalidad: "2025-11-20",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaSolvenciaDeontologica(): ValoresFormularioRevision {
  return {
    nombre_entidad_deontologica: "Colegio de Abogados del Distrito Capital",
    estado_entidad_deontologica: "Distrito Capital",
    municipio_entidad_deontologica: "Libertador",
    direccion_entidad_deontologica: "Av. Universidad, Caracas",
    nombre_quiensuscribe_deontologica: "Pedro Antonio Gómez",
    cedula_quiensuscribe_deontologica: "5678901",
    cargo_quiensuscribe_deontologica: "Presidente",
    inpreabogado_quiensuscribe_deontologica: "45210",
    nombre_postulante_deontologica: "María Elena",
    apellido_postulante_deontologica: "Rodríguez Páez",
    cedula_postulante_deontologica: "12456789",
    inpreabogado_postulante_deontologica: "78901",
    declaracion_solvencia_deontologica:
      "Se certifica la reconocida honorabilidad, trayectoria impecable y la ausencia de expedientes disciplinarios o sanciones éticas en el ejercicio profesional del solicitante.",
    fecha_expedicion_deontologica: "2025-10-15",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaCertMedicaMental(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_PROFESIONAL_SALUD]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_SALUD]: "V",
    nombre_profesional_salud: "Dr. Carlos Pérez",
    cedula_profesional_salud: "6789012",
    profesion_profesional_salud: "Médico psiquiatra",
    colegiacion_profesional_salud: "15420",
    nombre_postulante_salud: "María Elena",
    apellido_postulante_salud: "Rodríguez Páez",
    cedula_postulante_salud: "12456789",
    conclusion_diagnostica_salud:
      "Se acredita la plena capacidad mental, la indemnidad cognitiva y la ausencia de patologías o trastornos psiquiátricos inhabilitantes para el ejercicio de la función pública.",
    fecha_expedicion_salud: "2025-09-30",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaAntecedentesPenales(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_PENALES]: "V",
    nombre_entidad_penales:
      "MINISTERIO DEL PODER POPULAR PARA RELACIONES INTERIORES, JUSTICIA Y PAZ",
    nombre_quiensuscribe_penales: "Félix Ramón Osorio Guzmán",
    cargo_quiensuscribe_penales:
      "Viceministro de Política Interior y Seguridad Jurídica",
    designacion_quiensuscribe_penales:
      "Designado según Decreto N° 4.521 de fecha 12 de marzo de 2024. Publicado en Gaceta Oficial de la República Bolivariana de Venezuela N° 42.850 Extraordinario en la misma fecha.",
    nombre_postulante_penales: "María Elena",
    apellido_postulante_penales: "Rodríguez Páez",
    cedula_postulante_penales: "12456789",
    dictamen_expreso_penales:
      "No registra antecedentes penales ni sentencias condenatorias firmes en el sistema judicial.",
    codigo_verificacion_penales: "AP-2025-X7K9M2",
    fecha_suscripcion_penales: "2025-08-14",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaContraloriaCgr(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CGR]: "V",
    nombre_direccion_cgr: "Dirección General de Procedimientos Especiales",
    nombre_quiensuscribe_cgr: "Carlos Ramón Gómez",
    cargo_quiensuscribe_cgr:
      "Director del departamento de determinación de responsabilidades",
    designacion_quiensuscribe_cgr:
      "Designado según Decreto N° 4.210 de fecha 5 de enero de 2024. Publicado en Gaceta Oficial de la República Bolivariana de Venezuela N° 42.800 Extraordinario en la misma fecha.",
    nombre_postulante_cgr: "María Elena",
    apellido_postulante_cgr: "Rodríguez Páez",
    cedula_postulante_cgr: "12456789",
    dictamen_expreso_cgr:
      "No registra inhabilitación para el ejercicio de funciones públicas ni sanción firme de responsabilidad administrativa.",
    codigo_verificacion_cgr: "CGR-2025-OF-88421",
    fecha_suscripcion_cgr: "2025-07-22",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaTituloPregrado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_PREGRADO]: "V",
    nombre_universidad_pregrado: "Universidad Central de Venezuela",
    nombre_rector_pregrado: "Carlos Ramón Gómez",
    nombre_secretario_pregrado: "Ana Teresa Villalba",
    titulo_postulante_pregrado: "Abogada",
    nombre_postulante_pregrado: "María Elena",
    apellido_postulante_pregrado: "Rodríguez Páez",
    cedula_postulante_pregrado: "12456789",
    mencion_honor_pregrado: "Cum Laude",
    fecha_graduacion_pregrado: "2008-07-18",
    registro_publico_pregrado: "Oficina Principal de Registro Público del Distrito Capital",
    numero_asentamiento_pregrado: "3210",
    tomo_registro_pregrado: "45",
    folio_registro_pregrado: "112",
    fecha_protocolizacion_pregrado: "2008-09-05",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaTituloEspecialidad(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_ESPECIALIDAD]: "V",
    nombre_universidad_especialidad: "Universidad Central de Venezuela",
    nombre_rector_especialidad: "Carlos Ramón Gómez",
    nombre_secretario_especialidad: "Ana Teresa Villalba",
    rama_especialidad_derecho: "Especialización en Derecho Penal",
    nombre_pregrado_especialidad: "Abogada",
    nombre_postulante_especialidad: "María Elena",
    apellido_postulante_especialidad: "Rodríguez Páez",
    cedula_postulante_especialidad: "12456789",
    fecha_graduacion_especialidad: "2012-11-20",
    registro_publico_especialidad:
      "Oficina Principal de Registro Público del Distrito Capital",
    numero_asentamiento_especialidad: "4412",
    tomo_registro_especialidad: "52",
    folio_registro_especialidad: "88",
    fecha_protocolizacion_especialidad: "2013-01-15",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaConstanciaTeg(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TEG]: "V",
    nombre_universidad_teg: "Universidad Central de Venezuela",
    rama_especialidad_teg: "Especialización en Derecho Penal",
    titulo_trabajo_grado:
      "El principio de proporcionalidad en la aplicación de la prisión preventiva dentro del proceso penal contemporáneo",
    nombre_postulante_teg: "María Elena",
    apellido_postulante_teg: "Rodríguez Páez",
    cedula_postulante_teg: "12456789",
    jurado_examinador_teg:
      "María del Carmen Pérez, Carlos Augusto Rodríguez, María Méndez",
    veredicto_calificacion_teg: "Aprobada por unanimidad, mención honorífica",
    fecha_defensa_teg: "2012-10-05",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaTituloMaestria(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_MAESTRIA]: "V",
    nombre_universidad_maestria: "Universidad Central de Venezuela",
    nombre_rector_maestria: "Carlos Ramón Gómez",
    nombre_secretario_maestria: "Ana Teresa Villalba",
    area_maestria_derecho: "Maestría en Derecho Constitucional",
    nombre_pregrado_maestria: "Abogada",
    nombre_postulante_maestria: "María Elena",
    apellido_postulante_maestria: "Rodríguez Páez",
    cedula_postulante_maestria: "12456789",
    fecha_graduacion_maestria: "2015-06-12",
    registro_publico_maestria:
      "Oficina Principal de Registro Público del Distrito Capital",
    numero_asentamiento_maestria: "5510",
    tomo_registro_maestria: "61",
    folio_registro_maestria: "94",
    fecha_protocolizacion_maestria: "2015-08-03",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaConstanciaMaestria(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_MAESTRIA]: "V",
    nombre_universidad_tesis_maestria: "Universidad Central de Venezuela",
    area_maestria_tesis: "Maestría en Derecho Constitucional",
    titulo_trabajo_maestria:
      "Límites político-criminales y dogmáticos de la autoría mediata en aparatos organizados de poder: Un análisis comparado de la jurisprudencia penal nacional",
    nombre_postulante_tesis_maestria: "María Elena",
    apellido_postulante_tesis_maestria: "Rodríguez Páez",
    cedula_postulante_tesis_maestria: "12456789",
    jurado_examinador_maestria:
      "María del Carmen Pérez, Carlos Augusto Rodríguez, María Méndez",
    veredicto_calificacion_maestria: "Aprobada por unanimidad, mención honorífica",
    fecha_defensa_maestria: "2015-05-20",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaTituloDoctorado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_DOCTORADO]: "V",
    nombre_universidad_doctorado: "Universidad Central de Venezuela",
    nombre_rector_doctorado: "Carlos Ramón Gómez",
    nombre_secretario_doctorado: "Ana Teresa Villalba",
    denominacion_titulo_doctorado: "Doctor en Ciencias Jurídicas",
    nombre_pregrado_doctorado: "Abogada",
    nombre_postulante_doctorado: "María Elena",
    apellido_postulante_doctorado: "Rodríguez Páez",
    cedula_postulante_doctorado: "12456789",
    fecha_graduacion_doctorado: "2019-11-22",
    registro_publico_doctorado:
      "Oficina Principal de Registro Público del Distrito Capital",
    numero_asentamiento_doctorado: "7821",
    tomo_registro_doctorado: "88",
    folio_registro_doctorado: "112",
    fecha_protocolizacion_doctorado: "2020-01-15",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaConstanciaDoctorado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_TESIS_DOCTORADO]: "V",
    nombre_universidad_tesis_doctorado: "Universidad Central de Venezuela",
    denominacion_titulo_tesis_doctorado: "Doctor en Ciencias Jurídicas",
    titulo_tesis_doctorado:
      "Hacia un modelo de imputación penal de la inteligencia artificial: Redefinición de la culpabilidad dogmática frente a los sistemas autónomos",
    nombre_postulante_tesis_doctorado: "María Elena",
    apellido_postulante_tesis_doctorado: "Rodríguez Páez",
    cedula_postulante_tesis_doctorado: "12456789",
    jurado_examinador_doctorado:
      "María del Carmen Pérez, Carlos Augusto Rodríguez, María Méndez",
    veredicto_calificacion_doctorado: "Aprobada por unanimidad, mención honorífica",
    fecha_defensa_doctorado: "2019-10-08",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaInscripcionColegio(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_FIRMANTE_GREMIO]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_GREMIO]: "V",
    nombre_gremio_emisor: "Colegio de Abogados del Distrito Capital",
    estado_gremio_emisor: "Distrito Capital",
    direccion_gremio_emisor: "Avenida Universidad, Caracas",
    nombre_firmante_gremio: "José Luis Hernández",
    cedula_firmante_gremio: "5678901",
    cargo_firmante_gremio: "Presidente",
    inpreabogado_firmante_gremio: "45210",
    nombre_postulante_gremio: "María Elena",
    apellido_postulante_gremio: "Rodríguez Páez",
    cedula_postulante_gremio: "12456789",
    inpreabogado_postulante_colegio: "88341",
    fecha_inscripcion_gremio: "2005-03-18",
    fecha_expedicion_gremio: "2024-06-10",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaSolvenciaColegio(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_SOLVENCIA]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_COLEGIO]: "V",
    nombre_gremio_emisor_solvencia: "Colegio de Abogados del Distrito Capital",
    estado_gremio_solvencia: "Distrito Capital",
    direccion_gremio_solvencia: "Avenida Universidad, Caracas",
    nombre_quiensuscribe_solvencia: "José Luis Hernández",
    cedula_quiensuscribe_solvencia: "5678901",
    cargo_quiensuscribe_solvencia: "Presidente",
    inpreabogado_quiensuscribe_solvencia: "45210",
    nombre_postulante_solvencia: "María Elena",
    apellido_postulante_solvencia: "Rodríguez Páez",
    cedula_postulante_solvencia: "12456789",
    inpreabogado_postulante_solvencia: "88341",
    estatus_gremial_solvencia: "Solvente y Activo",
    fecha_suscripcion_solvencia: "2024-06-10",
    periodo_vigencia_solvencia: "Del 01/01/2024 al 31/12/2024",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaInscripcionInpreabogado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_INPREABOGADO]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_INPREABOGADO]: "V",
    nombre_quiensuscribe_inpreabogado: "Carmen Rosa Delgado",
    cedula_quiensuscribe_inpreabogado: "3456789",
    cargo_quiensuscribe_inpreabogado: "Directora de Registro",
    numero_quiensuscribe_inpreabogado: "22100",
    nombre_postulante_inpreabogado: "María Elena",
    apellido_postulante_inpreabogado: "Rodríguez Páez",
    cedula_postulante_inpreabogado: "12456789",
    inpreabogado_postulante_nacional: "88341",
    fecha_inscripcion_inpreabogado: "2005-04-22",
    fecha_expedicion_inpreabogado: "2024-06-12",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaSolvenciaInpreabogado(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_FIRMANTE_SOLVENCIA_INPRE]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_SOLVENCIA_INPRE]: "V",
    nombre_firmante_solvencia_inpreabogado: "Carmen Rosa Delgado",
    cedula_firmante_solvencia_inpreabogado: "3456789",
    cargo_firmante_solvencia_inpreabogado: "Directora de Solvencias",
    inpreabogado_firmante_solvencia: "22100",
    nombre_postulante_solvencia_inpreabogado: "María Elena",
    apellido_postulante_solvencia_inpreabogado: "Rodríguez Páez",
    cedula_postulante_solvencia_inpreabogado: "12456789",
    inpreabogado_solicitante_solvencia: "88341",
    dictamen_solvencia_inpreabogado:
      "Se declara solvente y al día con las cotizaciones y aportes gremiales correspondientes.",
    fecha_expedicion_solvencia_inpreabogado: "2024-06-12",
    periodo_vigencia_solvencia_inpreabogado: "Del 01/01/2024 al 31/12/2024",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaPruebaEjercicioLibre(): ValoresFormularioRevision {
  return {
    tipo_documento_ejerciciolibre: "Libelo de demanda",
    nombre_postulante_ejerciciolibre: "María Elena",
    apellido_postulante_ejerciciolibre: "Rodríguez Páez",
    inpreabogado_postulante_ejerciciolibre: "88341",
    rol_postulante_ejerciciolibre: "Apoderado Judicial",
    fecha_acto_ejerciciolibre: "2008-09-15",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaCertificacionDocente(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_DOCENCIA]: "V",
    nombre_universidad_docencia: "Universidad Central de Venezuela",
    facultad_docencia: "Facultad de Ciencias Jurídicas y Políticas",
    organo_expedidor_docencia: "Consejo de Facultad",
    catedra_impartida_docencia: "Derecho Constitucional",
    nivel_docente_docencia: "Pregrado y Posgrado",
    nombre_postulante_docencia: "María Elena",
    apellido_postulante_docencia: "Rodríguez Páez",
    cedula_postulante_docencia: "12456789",
    fecha_inicio_docencia: "2005-09-01",
    fecha_corte_docencia: "2024-06-15",
    condicion_docente_docencia: "Docente activo",
    escalafon_docente_docencia: "Profesor Asociado",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaActaConcursoDocente(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CONCURSODOCENTE]: "V",
    nombre_universidad_concursodocente: "Universidad Central de Venezuela",
    facultad_concursodocente: "Facultad de Ciencias Jurídicas y Políticas",
    catedra_concursodocente: "Derecho Constitucional",
    numero_acta_concursodocente: "CU-2010-045",
    fecha_acta_concursodocente: "2010-05-20",
    veredicto_concursodocente: "Ganador del Concurso de Oposición",
    categoria_otorgada_concursodocente: "Ingreso a la Categoría de Instructor",
    jurado_examinador_concursodocente:
      "María del Carmen Pérez, Carlos Augusto Rodríguez, María Méndez",
    nombre_postulante_concursodocente: "María Elena",
    apellido_postulante_concursodocente: "Rodríguez Páez",
    cedula_postulante_concursodocente: "12456789",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaCarreraJudicial(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAJUDICIAL]: "V",
    entidad_emisora_carrerajudicial:
      "Dirección Ejecutiva de la Magistratura (DEM)",
    nombre_postulante_carrerajudicial: "María Elena",
    apellido_postulante_carrerajudicial: "Rodríguez Páez",
    cedula_postulante_carrerajudicial: "12456789",
    expediente_dem_carrerajudicial: "DEM-EXP-2004-1182",
    fecha_ingreso_judicatura: "2004-03-15",
    fecha_corte_carrerajudicial: "2024-06-20",
    condicion_cargo_carrerajudicial: "Juez activo",
    cargo_desempeñado_carrerajudicial: "Juez/a Superior",
    tribunal_competencia_carrerajudicial:
      "Tribunal Superior Primero en lo Contencioso Administrativo de la Región Capital",
    circuito_judicial_carrerajudicial:
      "Circunscripción judicial del Distrito Capital",
    estado_circunscripcion_carrerajudicial: "Distrito Capital",
    resolucion_nombramiento_carrerajudicial: "RES-DEM-2012-089",
    periodo_desempeño_carrerajudicial: "15/03/2012 – 20/06/2024",
    es_juez_superior_carrerajudicial: "SI",
    ausencia_sanciones_carrerajudicial:
      "Constancia de ausencia de sanciones de destitución, suspensión o amonestación dictadas por la Inspectoría General de Tribunales o el Tribunal Disciplinario Judicial.",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaCarreraFuncionarial(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_QUIENSUSCRIBE_CARRERAFUNCIONARIAL]: "V",
    [KEY_PREFIJO_CEDULA_POSTULANTE_CARRERAFUNCIONARIAL]: "V",
    organo_emisor_carrerafuncionarial: "Procuraduría General de la República",
    estado_entidad_carrerafuncionarial: "Distrito Capital",
    municipio_entidad_carrerafuncionarial: "Libertador",
    direccion_entidad_carrerafuncionarial: "Avenida Universidad, Caracas",
    nombre_quiensuscribe_carrerafuncionarial: "Pedro Antonio Méndez",
    cedula_quiensuscribe_carrerafuncionarial: "6789012",
    cargo_quiensuscribe_carrerafuncionarial: "Director de Recursos Humanos",
    nombre_postulante_carrerafuncionarial: "María Elena",
    apellido_postulante_carrerafuncionarial: "Rodríguez Páez",
    cedula_postulante_carrerafuncionarial: "12456789",
    fecha_ingreso_carrerafuncionarial: "2006-01-10",
    estatus_servicio_carrerafuncionarial: "2024-06-18",
    condicion_cargo_carrerafuncionarial: "Funcionario activo",
    cargo_desempenado_carrerafuncionarial: "Consultora Jurídica",
    dependencia_adscripcion_carrerafuncionarial: "Oficina de Asesoría Legal",
    naturaleza_cargo_carrerafuncionarial:
      "Atribuciones de redacción de dictámenes, sustanciación de expedientes administrativos y representación judicial del ente.",
    acto_designacion_carrerafuncionarial:
      "Designada según Decreto N° 4521 de fecha 10 de enero de 2006. Publicado en Gaceta Oficial de la República Bolivariana de Venezuela.",
    periodo_desempeno_carrerafuncionarial: "10/01/2006 – 18/06/2024",
    ausencia_sanciones_carrerafuncionarial:
      "Declaración de no haber sido objeto de destitución mediante sumario administrativo ni de inhabilitación por faltas graves en la función pública.",
    fecha_expedicion_carrerafuncionarial: "2024-06-18",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaDjNoMilitancia(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOMILITANCIA]: "V",
    nombre_declarante_nomilitancia: "María Elena",
    apellido_declarante_nomilitancia: "Rodríguez Páez",
    estadocivil_declarante_nomilitancia: "Soltera",
    cedula_declarante_nomilitancia: "12456789",
    manifestacion_nomilitancia:
      "Declaro bajo fe de juramento no ejercer activismo político partidista, no pertenecer a directivas de partidos políticos ni realizar actos de proselitismo.",
    aclaratoria_renuncia_nomilitancia: "",
    estado_notaria_nomilitancia: "Distrito Capital",
    municipio_notaria_nomilitancia: "Libertador",
    nombre_notaria_nomilitancia: "Notaría Pública Primera del Municipio Libertador",
    numero_folio_nomilitancia: "45",
    numero_tomo_nomilitancia: "12",
    fecha_otorgamiento_nomilitancia: "2024-05-10",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaDjNoParentesco(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOPARENTESCO]: "V",
    nombre_declarante_noparentesco: "María Elena",
    apellido_declarante_noparentesco: "Rodríguez Páez",
    estadocivil_declarante_noparentesco: "Soltera",
    cedula_declarante_noparentesco: "12456789",
    manifestacion_ausenciavinculo_noparentesco:
      "Declaro bajo fe de juramento no poseer parentesco hasta el cuarto grado de consanguinidad o segundo de afinidad, ni vínculo de matrimonio o unión estable de hecho, con Magistrados o Magistradas activos del TSJ.",
    constancia_altosfuncionarios_noparentesco:
      "Declaro no tener parentesco hasta el segundo grado de consanguinidad o tercero de afinidad con el Presidente/a de la República, Vicepresidente/a, Ministros/as, Fiscal General, Contralor/a, Defensor/a del Pueblo o Rectores/as del CNE.",
    estado_notaria_noparentesco: "Distrito Capital",
    municipio_notaria_noparentesco: "Libertador",
    nombre_notaria_noparentesco: "Notaría Pública Primera del Municipio Libertador",
    numero_folio_noparentesco: "52",
    numero_tomo_noparentesco: "14",
    fecha_otorgamiento_noparentesco: "2024-05-12",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaActaMatrimonio(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_CONYUGE_MATRIMONIO]: "V",
    [KEY_PREFIJO_CEDULA_SEGUNDO_CONYUGE_MATRIMONIO]: "V",
    nombrejefatura_matrimonio_postulante:
      "Registro Civil del Municipio Libertador",
    numeroacta_matrimonio_postulante: "1842",
    folio_matrimonio_postulante: "88",
    tomo_matrimonio_postulante: "7",
    anio_matrimonio_postulante: "2010",
    nombre_conyugematrimonio_postulante: "Carlos Andrés",
    apellido_conyugematrimonio_postulante: "Pérez Sosa",
    cedula_conyugematrimonio_postulante: "11223344",
    nombre_segundoconyuge_postulante: "María Elena",
    apellido_segundoconyuge_postulante: "Rodríguez Páez",
    cedula_segundoconyuge_postulante: "12456789",
    fecha_celebracionmatrimonio_postulante: "2010-06-20",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaDjNoContratacion(): ValoresFormularioRevision {
  return {
    [KEY_PREFIJO_CEDULA_DECLARANTE_NOCONTRATACION]: "V",
    nombre_declarante_nocontratacion: "María Elena",
    apellido_declarante_nocontratacion: "Rodríguez Páez",
    estadocivil_declarante_nocontratacion: "Soltera",
    cedula_declarante_nocontratacion: "12456789",
    declaracion_inexistentecontratos_nocontratacion:
      "Declaro bajo fe de juramento no ser propietaria, socia, accionista ni representante legal de sociedades mercantiles o firmas de consultoría con contratos vigentes con la administración pública nacional, estadal o municipal.",
    declaracion_nolitigio_nocontratacion:
      "Declaro no ejercer representación judicial activa en causas lucrativas privadas contra entes del Estado.",
    estado_notaria_nocontratacion: "Distrito Capital",
    municipio_notaria_nocontratacion: "Libertador",
    nombre_notaria_nocontratacion:
      "Notaría Pública Primera del Municipio Libertador",
    numero_folio_nocontratacion: "61",
    numero_tomo_nocontratacion: "15",
    fecha_otorgamiento_nocontratacion: "2024-05-15",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function rellenoIaParaSlot(slotKey: string): ValoresFormularioRevision {
  if (slotKey === "cedula_identidad") return rellenoIaCedula();
  if (slotKey === "partida_nacimiento") return rellenoIaPartida();
  if (slotKey === "dj_no_otra_nacionalidad") return rellenoIaDjOtraNacionalidad();
  if (slotKey === "solvencia_moral") return rellenoIaSolvenciaDeontologica();
  if (slotKey === "cert_medica_mental") return rellenoIaCertMedicaMental();
  if (slotKey === "antecedentes_penales") return rellenoIaAntecedentesPenales();
  if (slotKey === "contraloria_inhabilitacion") return rellenoIaContraloriaCgr();
  if (slotKey === "titulo_pregrado_abogado") return rellenoIaTituloPregrado();
  if (slotKey === "especializacion_titulo") return rellenoIaTituloEspecialidad();
  if (slotKey === "especializacion_constancia") return rellenoIaConstanciaTeg();
  if (slotKey === "maestria_titulo") return rellenoIaTituloMaestria();
  if (slotKey === "maestria_constancia") return rellenoIaConstanciaMaestria();
  if (slotKey === "doctorado_titulo") return rellenoIaTituloDoctorado();
  if (slotKey === "doctorado_constancia") return rellenoIaConstanciaDoctorado();
  if (slotKey === "tray_a_inscripcion_colegio") return rellenoIaInscripcionColegio();
  if (slotKey === "tray_a_solvencia_colegio") return rellenoIaSolvenciaColegio();
  if (slotKey === "tray_a_inscripcion_inpre") return rellenoIaInscripcionInpreabogado();
  if (slotKey === "tray_a_solvencia_inpre") return rellenoIaSolvenciaInpreabogado();
  if (slotKey === "tray_a_prueba_15_anos") return rellenoIaPruebaEjercicioLibre();
  if (slotKey === "tray_b_cert_docente") return rellenoIaCertificacionDocente();
  if (slotKey === "tray_b_actas_concurso") return rellenoIaActaConcursoDocente();
  if (slotKey === "tray_c_cert_dem") return rellenoIaCarreraJudicial();
  if (slotKey === "tray_c_cert_funcionarial") return rellenoIaCarreraFuncionarial();
  if (slotKey === "dj_no_militancia") return rellenoIaDjNoMilitancia();
  if (slotKey === "dj_parentesco") return rellenoIaDjNoParentesco();
  if (slotKey === "acta_matrimonio") return rellenoIaActaMatrimonio();
  if (slotKey === "dj_no_contratacion") return rellenoIaDjNoContratacion();
  return {
    notas: "Extracción automática (maqueta)",
    es_documento: true,
    calidad_legibilidad: "alta",
    advertencias: null,
  };
}

export function esFormularioCedula(slotKey: string): boolean {
  return slotKey === "cedula_identidad";
}

export function esFormularioPartida(slotKey: string): boolean {
  return slotKey === "partida_nacimiento";
}

export function esFormularioDjOtraNacionalidad(slotKey: string): boolean {
  return slotKey === "dj_no_otra_nacionalidad";
}

export function esFormularioSolvenciaDeontologica(slotKey: string): boolean {
  return slotKey === "solvencia_moral";
}

export function esFormularioCertMedicaMental(slotKey: string): boolean {
  return slotKey === "cert_medica_mental";
}

export function esFormularioAntecedentesPenales(slotKey: string): boolean {
  return slotKey === "antecedentes_penales";
}

export function esFormularioContraloriaCgr(slotKey: string): boolean {
  return slotKey === "contraloria_inhabilitacion";
}

export function esFormularioTituloPregrado(slotKey: string): boolean {
  return slotKey === "titulo_pregrado_abogado";
}

export function esFormularioTituloEspecialidad(slotKey: string): boolean {
  return slotKey === "especializacion_titulo";
}

export function esFormularioConstanciaTeg(slotKey: string): boolean {
  return slotKey === "especializacion_constancia";
}

export function esFormularioTituloMaestria(slotKey: string): boolean {
  return slotKey === "maestria_titulo";
}

export function esFormularioConstanciaMaestria(slotKey: string): boolean {
  return slotKey === "maestria_constancia";
}

export function esFormularioTituloDoctorado(slotKey: string): boolean {
  return slotKey === "doctorado_titulo";
}

export function esFormularioConstanciaDoctorado(slotKey: string): boolean {
  return slotKey === "doctorado_constancia";
}

export function esFormularioInscripcionColegio(slotKey: string): boolean {
  return slotKey === "tray_a_inscripcion_colegio";
}

export function esFormularioSolvenciaColegio(slotKey: string): boolean {
  return slotKey === "tray_a_solvencia_colegio";
}

export function esFormularioInscripcionInpreabogado(slotKey: string): boolean {
  return slotKey === "tray_a_inscripcion_inpre";
}

export function esFormularioSolvenciaInpreabogado(slotKey: string): boolean {
  return slotKey === "tray_a_solvencia_inpre";
}

export function esFormularioPruebaEjercicioLibre(slotKey: string): boolean {
  return slotKey === "tray_a_prueba_15_anos";
}

export function esFormularioCertificacionDocente(slotKey: string): boolean {
  return slotKey === "tray_b_cert_docente";
}

export function esFormularioActaConcursoDocente(slotKey: string): boolean {
  return slotKey === "tray_b_actas_concurso";
}

export function esFormularioCarreraJudicial(slotKey: string): boolean {
  return slotKey === "tray_c_cert_dem";
}

export function esFormularioCarreraFuncionarial(slotKey: string): boolean {
  return slotKey === "tray_c_cert_funcionarial";
}

export function esFormularioDjNoMilitancia(slotKey: string): boolean {
  return slotKey === "dj_no_militancia";
}

export function esFormularioDjNoParentesco(slotKey: string): boolean {
  return slotKey === "dj_parentesco";
}

export function esFormularioActaMatrimonio(slotKey: string): boolean {
  return slotKey === "acta_matrimonio";
}

export function esFormularioDjNoContratacion(slotKey: string): boolean {
  return slotKey === "dj_no_contratacion";
}

export function esFormularioSintesisCurricular(slotKey: string): boolean {
  return slotKey === "sintesis_curricular";
}

export function esFormularioOtroDocumento(slotKey: string): boolean {
  return slotKey === "otro_documento";
}

export function usaBotonVerificado(slotKey: string): boolean {
  return (
    esFormularioCedula(slotKey) ||
    esFormularioPartida(slotKey) ||
    esFormularioDjOtraNacionalidad(slotKey) ||
    esFormularioSolvenciaDeontologica(slotKey) ||
    esFormularioCertMedicaMental(slotKey) ||
    esFormularioAntecedentesPenales(slotKey) ||
    esFormularioContraloriaCgr(slotKey) ||
    esFormularioTituloPregrado(slotKey) ||
    esFormularioTituloEspecialidad(slotKey) ||
    esFormularioConstanciaTeg(slotKey) ||
    esFormularioTituloMaestria(slotKey) ||
    esFormularioConstanciaMaestria(slotKey) ||
    esFormularioTituloDoctorado(slotKey) ||
    esFormularioConstanciaDoctorado(slotKey) ||
    esFormularioInscripcionColegio(slotKey) ||
    esFormularioSolvenciaColegio(slotKey) ||
    esFormularioInscripcionInpreabogado(slotKey) ||
    esFormularioSolvenciaInpreabogado(slotKey) ||
    esFormularioPruebaEjercicioLibre(slotKey) ||
    esFormularioCertificacionDocente(slotKey) ||
    esFormularioActaConcursoDocente(slotKey) ||
    esFormularioCarreraJudicial(slotKey) ||
    esFormularioCarreraFuncionarial(slotKey) ||
    esFormularioDjNoMilitancia(slotKey) ||
    esFormularioDjNoParentesco(slotKey) ||
    esFormularioActaMatrimonio(slotKey) ||
    esFormularioDjNoContratacion(slotKey) ||
    esFormularioSintesisCurricular(slotKey) ||
    esFormularioOtroDocumento(slotKey)
  );
}
