"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileStack, Sparkles } from "lucide-react";
import {
  conteoDocsRevision,
  type DocumentoRevision,
  type PostulanteRevision,
} from "@/lib/adaptar-revision-api";
import {
  enviarAEvaluacion,
  extraerConIa,
  guardarRevision,
  marcarDocumentoVerificado,
} from "@/app/(panel)/revision-documental/acciones";
import { esExtraibleConIa } from "@/contracts";
import { InsigniaEstado } from "@/components/insignias";
import { useToast } from "@/components/toast-provider";
import { SidebarDocsRevision } from "./sidebar-docs-revision";
import { VisorDocumentoRevision } from "./visor-documento-revision";
import { FormularioCedulaIdentidad } from "./formulario-cedula-identidad";
import { FormularioPartidaNacimiento } from "./formulario-partida-nacimiento";
import { FormularioDjOtraNacionalidad } from "./formulario-dj-otra-nacionalidad";
import { FormularioSolvenciaDeontologica } from "./formulario-solvencia-deontologica";
import { FormularioCertMedicaMental } from "./formulario-cert-medica-mental";
import { FormularioAntecedentesPenales } from "./formulario-antecedentes-penales";
import { FormularioContraloriaCgr } from "./formulario-contraloria-cgr";
import { FormularioTituloPregrado } from "./formulario-titulo-pregrado";
import { FormularioTituloEspecialidad } from "./formulario-titulo-especialidad";
import { FormularioConstanciaTeg } from "./formulario-constancia-teg";
import { FormularioTituloMaestria } from "./formulario-titulo-maestria";
import { FormularioConstanciaMaestria } from "./formulario-constancia-maestria";
import { FormularioTituloDoctorado } from "./formulario-titulo-doctorado";
import { FormularioConstanciaDoctorado } from "./formulario-constancia-doctorado";
import { FormularioInscripcionColegio } from "./formulario-inscripcion-colegio";
import { FormularioSolvenciaColegio } from "./formulario-solvencia-colegio";
import { FormularioInscripcionInpreabogado } from "./formulario-inscripcion-inpreabogado";
import { FormularioSolvenciaInpreabogado } from "./formulario-solvencia-inpreabogado";
import { FormularioPruebaEjercicioLibre } from "./formulario-prueba-ejercicio-libre";
import { FormularioCertificacionDocente } from "./formulario-certificacion-docente";
import { FormularioActaConcursoDocente } from "./formulario-acta-concurso-docente";
import { FormularioCarreraJudicial } from "./formulario-carrera-judicial";
import { FormularioCarreraFuncionarial } from "./formulario-carrera-funcionarial";
import { FormularioDjNoMilitancia } from "./formulario-dj-no-militancia";
import { FormularioDjNoParentesco } from "./formulario-dj-no-parentesco";
import { FormularioActaMatrimonio } from "./formulario-acta-matrimonio";
import { FormularioDjNoContratacion } from "./formulario-dj-no-contratacion";
import {
  esFormularioActaConcursoDocente,
  esFormularioActaMatrimonio,
  esFormularioAntecedentesPenales,
  esFormularioCarreraFuncionarial,
  esFormularioCarreraJudicial,
  esFormularioCedula,
  esFormularioCertificacionDocente,
  esFormularioCertMedicaMental,
  esFormularioConstanciaDoctorado,
  esFormularioConstanciaMaestria,
  esFormularioConstanciaTeg,
  esFormularioContraloriaCgr,
  esFormularioDjNoContratacion,
  esFormularioDjNoMilitancia,
  esFormularioDjNoParentesco,
  esFormularioDjOtraNacionalidad,
  esFormularioInscripcionColegio,
  esFormularioInscripcionInpreabogado,
  esFormularioPartida,
  esFormularioPruebaEjercicioLibre,
  esFormularioSolvenciaColegio,
  esFormularioSolvenciaDeontologica,
  esFormularioSolvenciaInpreabogado,
  esFormularioTituloDoctorado,
  esFormularioTituloEspecialidad,
  esFormularioTituloMaestria,
  esFormularioTituloPregrado,
  usaBotonVerificado,
  validarFormularioRevision,
  valoresVaciosParaSlot,
  type ErroresFormularioRevision,
  type ValoresFormularioRevision,
} from "./campos-formulario-revision";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

function reviewDataAValores(
  slotKey: string,
  reviewData: Record<string, unknown> | null | undefined,
): ValoresFormularioRevision {
  const base = valoresVaciosParaSlot(slotKey);
  if (!reviewData) return base;
  return { ...base, ...reviewData } as ValoresFormularioRevision;
}

export function DetalleRevisionPostulante({
  postulante,
}: {
  readonly postulante: PostulanteRevision;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activo, setActivo] = useState<string | undefined>();
  const [valores, setValores] = useState<Record<string, ValoresFormularioRevision>>({});
  const [formulariosGuardados, setFormulariosGuardados] = useState<Set<string>>(() => {
    const inicial = new Set<string>();
    for (const d of postulante.documentos) {
      if (d.verificationStatus === "VERIFIED") inicial.add(d.id);
    }
    return inicial;
  });
  const [rellenandoIa, setRellenandoIa] = useState(false);
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);

  const doc = postulante.documentos.find((d) => d.id === activo);
  const { total } = conteoDocsRevision(postulante);
  const guardados = formulariosGuardados.size;
  const todosListos = guardados === total && total > 0;

  useEffect(() => {
    marcarSidebarDocumentoAbierto(Boolean(activo));
    return () => marcarSidebarDocumentoAbierto(false);
  }, [activo]);

  function valoresDe(documento: DocumentoRevision): ValoresFormularioRevision {
    if (valores[documento.id]) return valores[documento.id]!;
    return reviewDataAValores(documento.slotKey, documento.reviewData);
  }

  function seleccionar(id: string) {
    setActivo(id);
    const documento = postulante.documentos.find((d) => d.id === id);
    if (!documento || valores[id]) return;
    setValores((prev) => ({
      ...prev,
      [id]: reviewDataAValores(documento.slotKey, documento.reviewData),
    }));
  }

  function actualizarCampo(docId: string, key: string, value: string | boolean | null) {
    setValores((prev) => ({
      ...prev,
      [docId]: { ...(prev[docId] ?? {}), [key]: value },
    }));
  }

  async function persistirYMarcar(
    documento: DocumentoRevision,
    valoresDoc: ValoresFormularioRevision,
    tambienVerificar: boolean,
  ) {
    const limpios = Object.fromEntries(
      Object.entries(valoresDoc).filter(([, v]) => v !== undefined),
    );
    const guardado = await guardarRevision(documento.id, limpios);
    if (!guardado.ok) {
      toast.error(guardado.error ?? "No se pudo guardar.");
      return false;
    }
    if (tambienVerificar) {
      const verif = await marcarDocumentoVerificado(documento.id);
      if (!verif.ok) {
        toast.error(verif.error ?? "Se guardó, pero no se pudo marcar verificado.");
        setFormulariosGuardados((prev) => new Set(prev).add(documento.id));
        return false;
      }
    }
    setFormulariosGuardados((prev) => new Set(prev).add(documento.id));
    toast.exito(tambienVerificar ? "Documento guardado y verificado." : "Formulario guardado.");
    return true;
  }

  function marcarVerificado(docId: string) {
    const documento = postulante.documentos.find((d) => d.id === docId);
    if (!documento) return;
    const valoresDoc = valoresDe(documento);
    startTransition(async () => {
      await persistirYMarcar(documento, valoresDoc, usaBotonVerificado(documento.slotKey));
    });
  }

  async function rellenarConIa(documento: DocumentoRevision) {
    if (!esExtraibleConIa(documento.category)) return;
    setRellenandoIa(true);
    try {
      const r = await extraerConIa(documento.id);
      if (!r.ok || !r.reviewData) {
        toast.error(r.error ?? "No se pudo extraer. Complete a mano.");
        return;
      }
      setValores((prev) => ({
        ...prev,
        [documento.id]: {
          ...reviewDataAValores(documento.slotKey, documento.reviewData),
          ...(prev[documento.id] ?? {}),
          ...r.reviewData,
        } as ValoresFormularioRevision,
      }));
      toast.exito(
        "Campos propuestos por IA. Revise, edite si hace falta y pulse Guardar o Verificado.",
      );
    } finally {
      setRellenandoIa(false);
    }
  }

  function enviarAlEvaluador() {
    if (!todosListos) return;
    startTransition(async () => {
      const r = await enviarAEvaluacion(postulante.id);
      if (!r.ok) {
        const mensaje =
          r.codigo === 403
            ? (r.error ??
              "No se puede avanzar: el prefijo de cédula E está inhabilitado (art. 263.1 CRBV).")
            : (r.error ?? "No se pudo enviar a evaluación.");
        toast.error(mensaje);
        setConfirmandoEnvio(false);
        return;
      }
      toast.exito(
        `Expediente de ${postulante.nombre} ${postulante.apellido} enviado a evaluación.`,
      );
      setConfirmandoEnvio(false);
      router.push("/revision-documental");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6">
        <Link
          href="/revision-documental"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-balanza-700 hover:text-balanza-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a la cola
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="codigo text-xs text-toga-500">{postulante.fileNumber}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-toga-900">
              {postulante.nombre} {postulante.apellido}
            </h2>
            <p className="mt-1 text-sm text-toga-500">
              Seleccione cada documento cargado, complete su formulario y verifíquelo. El envío al
              evaluador se habilita cuando todos los documentos de este expediente estén revisados.
            </p>
          </div>
          <dl className="flex flex-wrap items-end gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-toga-500">Cédula</dt>
              <dd className="codigo font-medium text-toga-900">{postulante.cedula}</dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Sala</dt>
              <dd className="font-medium text-toga-900">{postulante.salaLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Formularios</dt>
              <dd className="cifra font-medium text-toga-900">
                {guardados}/{total}
              </dd>
            </div>
            <div>
              <InsigniaEstado estado="DOCUMENT_REVIEW" />
            </div>
          </dl>
        </div>

        <div className="mt-4 border-t border-toga-100 pt-4">
          {confirmandoEnvio ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-toga-700">
                ¿Confirma enviar a evaluación el expediente de{" "}
                <span className="font-semibold">
                  {postulante.nombre} {postulante.apellido}
                </span>
                ?
              </p>
              <button
                type="button"
                onClick={enviarAlEvaluador}
                disabled={pending}
                className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
              >
                {pending ? "Enviando…" : "Confirmar envío"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmandoEnvio(false)}
                disabled={pending}
                className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-toga-500">
                {todosListos
                  ? `Los ${total} documento${total === 1 ? "" : "s"} de este expediente están revisados.`
                  : `Faltan ${total - guardados} de ${total} documento${total === 1 ? "" : "s"} por revisar.`}
              </p>
              <button
                type="button"
                disabled={!todosListos}
                onClick={() => setConfirmandoEnvio(true)}
                className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar al evaluador
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <div className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
          {doc ? (
            <PanelVisualizacionYFormulario
              doc={doc}
              valores={valoresDe(doc)}
              verificado={formulariosGuardados.has(doc.id)}
              rellenandoIa={rellenandoIa}
              guardando={pending}
              onCampo={(key, value) => actualizarCampo(doc.id, key, value)}
              onVerificar={() => marcarVerificado(doc.id)}
              onRellenarIa={() => void rellenarConIa(doc)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-toga-700">
                Seleccione un documento del listado
              </p>
              <p className="mt-1 max-w-sm text-xs text-toga-500">
                Se mostrará el archivo cargado y el formulario correspondiente a ese tipo de
                documento.
              </p>
            </div>
          )}
        </div>

        <SidebarDocsRevision
          documentos={postulante.documentos}
          formulariosGuardados={formulariosGuardados}
          activo={activo}
          onSeleccionar={seleccionar}
        />
      </div>
    </div>
  );
}

function PanelVisualizacionYFormulario({
  doc,
  valores,
  verificado,
  rellenandoIa,
  guardando,
  onCampo,
  onVerificar,
  onRellenarIa,
}: {
  readonly doc: DocumentoRevision;
  readonly valores: Readonly<ValoresFormularioRevision>;
  readonly verificado: boolean;
  readonly rellenandoIa: boolean;
  readonly guardando: boolean;
  readonly onCampo: (key: string, value: string | boolean | null) => void;
  readonly onVerificar: () => void;
  readonly onRellenarIa: () => void;
}) {
  const toast = useToast();
  const mostrarIa = esExtraibleConIa(doc.category);
  const esCedula = esFormularioCedula(doc.slotKey);
  const esPartida = esFormularioPartida(doc.slotKey);
  const esDjOtra = esFormularioDjOtraNacionalidad(doc.slotKey);
  const esSolvencia = esFormularioSolvenciaDeontologica(doc.slotKey);
  const esCertMedica = esFormularioCertMedicaMental(doc.slotKey);
  const esAntecedentes = esFormularioAntecedentesPenales(doc.slotKey);
  const esCgr = esFormularioContraloriaCgr(doc.slotKey);
  const esPregrado = esFormularioTituloPregrado(doc.slotKey);
  const esEspecialidad = esFormularioTituloEspecialidad(doc.slotKey);
  const esConstanciaTeg = esFormularioConstanciaTeg(doc.slotKey);
  const esMaestria = esFormularioTituloMaestria(doc.slotKey);
  const esConstanciaMaestria = esFormularioConstanciaMaestria(doc.slotKey);
  const esDoctorado = esFormularioTituloDoctorado(doc.slotKey);
  const esConstanciaDoctorado = esFormularioConstanciaDoctorado(doc.slotKey);
  const esInscripcionColegio = esFormularioInscripcionColegio(doc.slotKey);
  const esSolvenciaColegio = esFormularioSolvenciaColegio(doc.slotKey);
  const esInscripcionInpre = esFormularioInscripcionInpreabogado(doc.slotKey);
  const esSolvenciaInpre = esFormularioSolvenciaInpreabogado(doc.slotKey);
  const esPruebaEjercicio = esFormularioPruebaEjercicioLibre(doc.slotKey);
  const esCertDocente = esFormularioCertificacionDocente(doc.slotKey);
  const esActaConcurso = esFormularioActaConcursoDocente(doc.slotKey);
  const esCarreraJudicial = esFormularioCarreraJudicial(doc.slotKey);
  const esCarreraFuncionarial = esFormularioCarreraFuncionarial(doc.slotKey);
  const esDjNoMilitancia = esFormularioDjNoMilitancia(doc.slotKey);
  const esDjNoParentesco = esFormularioDjNoParentesco(doc.slotKey);
  const esActaMatrimonio = esFormularioActaMatrimonio(doc.slotKey);
  const esDjNoContratacion = esFormularioDjNoContratacion(doc.slotKey);
  const botonVerificado = usaBotonVerificado(doc.slotKey);
  const [errores, setErrores] = useState<ErroresFormularioRevision>({});

  useEffect(() => {
    setErrores({});
  }, [doc.id]);

  function actualizarCampo(key: string, value: string | boolean | null) {
    setErrores((prev) => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    onCampo(key, value);
  }

  function intentarVerificar() {
    const e = validarFormularioRevision(doc.slotKey, valores);
    setErrores(e);
    if (Object.keys(e).length > 0) {
      toast.error(
        "Hay campos con formato inválido. Corríjalos o déjelos vacíos si no se pueden leer.",
      );
      return;
    }
    onVerificar();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-toga-900">Visualización y formulario</h3>
        {verificado && (
          <span className="inline-flex rounded-full bg-validado-50 px-2 py-0.5 text-[0.7rem] font-medium text-validado-700 ring-1 ring-inset ring-validado-700/20">
            Verificado
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <VisorDocumentoRevision
            documentId={doc.id}
            nombreArchivo={doc.nombreArchivo}
            sizeKb={doc.sizeKb}
            titulo={doc.titulo}
          />
        </div>

        <div>
          {esCedula ? (
            <FormularioCedulaIdentidad
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esPartida ? (
            <FormularioPartidaNacimiento
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esDjOtra ? (
            <FormularioDjOtraNacionalidad
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esSolvencia ? (
            <FormularioSolvenciaDeontologica
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esCertMedica ? (
            <FormularioCertMedicaMental
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esAntecedentes ? (
            <FormularioAntecedentesPenales
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esCgr ? (
            <FormularioContraloriaCgr
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esPregrado ? (
            <FormularioTituloPregrado
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esEspecialidad ? (
            <FormularioTituloEspecialidad
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esConstanciaTeg ? (
            <FormularioConstanciaTeg
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esMaestria ? (
            <FormularioTituloMaestria
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esConstanciaMaestria ? (
            <FormularioConstanciaMaestria
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esDoctorado ? (
            <FormularioTituloDoctorado
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esConstanciaDoctorado ? (
            <FormularioConstanciaDoctorado
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esInscripcionColegio ? (
            <FormularioInscripcionColegio
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esSolvenciaColegio ? (
            <FormularioSolvenciaColegio
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esInscripcionInpre ? (
            <FormularioInscripcionInpreabogado
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esSolvenciaInpre ? (
            <FormularioSolvenciaInpreabogado
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esPruebaEjercicio ? (
            <FormularioPruebaEjercicioLibre
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esCertDocente ? (
            <FormularioCertificacionDocente
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esActaConcurso ? (
            <FormularioActaConcursoDocente
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esCarreraJudicial ? (
            <FormularioCarreraJudicial
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esCarreraFuncionarial ? (
            <FormularioCarreraFuncionarial
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esDjNoMilitancia ? (
            <FormularioDjNoMilitancia
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esDjNoParentesco ? (
            <FormularioDjNoParentesco
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esActaMatrimonio ? (
            <FormularioActaMatrimonio
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : esDjNoContratacion ? (
            <FormularioDjNoContratacion
              valores={valores}
              errores={errores}
              onCampo={actualizarCampo}
            />
          ) : (
            <FormularioGenericoStub valores={valores} errores={errores} onCampo={actualizarCampo} />
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={intentarVerificar}
              disabled={guardando}
              className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : botonVerificado ? "Verificado" : "Guardar"}
            </button>
            {mostrarIa && (
              <button
                type="button"
                onClick={onRellenarIa}
                disabled={rellenandoIa || guardando}
                className="inline-flex items-center gap-1.5 rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-50 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {rellenandoIa ? "Rellenando…" : "Rellenar con IA"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormularioGenericoStub({
  valores,
  errores = {},
  onCampo,
}: {
  readonly valores: Readonly<ValoresFormularioRevision>;
  readonly errores?: Readonly<ErroresFormularioRevision>;
  readonly onCampo: (key: string, value: string | boolean | null) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="rounded-md border border-toga-100 bg-toga-50/80 px-3 py-2 text-xs text-toga-500">
        Formulario provisional. Se sustituirá cuando se defina el de este tipo de documento. Todos
        los campos son opcionales.
      </p>
      <div>
        <label htmlFor="campo-notas" className="block text-xs font-medium text-toga-600">
          Notas de revisión
        </label>
        <input
          id="campo-notas"
          type="text"
          value={String(valores.notas ?? "")}
          onChange={(e) => onCampo("notas", e.target.value)}
          className={`${CAMPO}${errores.notas ? " campo-con-error" : ""}`}
          aria-invalid={Boolean(errores.notas)}
          autoComplete="off"
        />
        {errores.notas && <p className="mensaje-error-campo">{errores.notas}</p>}
      </div>
    </div>
  );
}
