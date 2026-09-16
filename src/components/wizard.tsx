"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { CHAMBERS, PREFIJOS_TELEFONO, SALA_ETIQUETA } from "@/contracts";
import {
  crearExpediente,
  enviarARevision,
  type EstadoWizard,
  type ValoresWizard,
} from "@/app/(panel)/expedientes/nuevo/acciones";
import { useToast } from "@/components/toast-provider";
import { useToastDesdeEstado } from "@/hooks/use-toast-desde-estado";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZonaDocumentos, type DocumentoCargado } from "./zona-documentos";

const PASOS = ["Identificación", "Documentos", "Revisión y envío"] as const;

const VALORES_VACIOS: ValoresWizard = {
  nationalIdDigits: "",
  firstName: "",
  lastName: "",
  chamber: "",
  publicSummary: "",
  email: "",
  phonePrefix: "0412",
  phoneDigits: "",
  internalNotes: "",
};

/** Sólo letras (incl. tildes/ñ) y espacios internos. */
function filtrarNombre(valor: string): string {
  return valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").replace(/\s{2,}/g, " ");
}


/**
 * Barra de progreso del wizard.
 *
 * El paso actual se marca con el color de acento Y con `aria-current`: quien
 * usa lector de pantalla necesita saber en qué punto está, no sólo verlo.
 */
function Progreso({ actual }: { readonly actual: number }) {
  return (
    <ol className="mb-8 flex gap-2" aria-label="Progreso del registro">
      {PASOS.map((paso, i) => {
        const completado = i < actual;
        const activo = i === actual;
        return (
          <li key={paso} className="flex-1" aria-current={activo ? "step" : undefined}>
            <div
              className={`h-1 rounded-full ${
                completado ? "bg-balanza-600" : activo ? "bg-balanza-500" : "bg-toga-200"
              }`}
            />
            <p
              className={`mt-2 text-xs font-medium ${
                activo ? "text-toga-900" : completado ? "text-balanza-700" : "text-toga-400"
              }`}
            >
              <span className="cifra">{i + 1}</span>. {paso}
              {completado && (
                <span className="ml-1" aria-hidden="true">
                  ✓
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function BotonPaso1() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? "Creando expediente…" : "Continuar a documentos →"}
    </button>
  );
}

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

export function Wizard() {
  const router = useRouter();
  const toast = useToast();
  const [estado, accion] = useActionState<EstadoWizard, FormData>(crearExpediente, {});
  useToastDesdeEstado(estado);
  const [paso, setPaso] = useState(0);
  const [documentos, setDocumentos] = useState<DocumentoCargado[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [valores, setValores] = useState<ValoresWizard>(VALORES_VACIOS);

  // Tras un error de validación/API, rehidratar lo que el usuario ya había escrito.
  useEffect(() => {
    if (estado.valores) setValores(estado.valores);
  }, [estado.valores]);

  // El paso 1 lo cierra el servidor: en cuanto devuelve el expediente creado.
  const creado = estado.creado;
  const pasoEfectivo = creado ? Math.max(paso, 1) : 0;

  function actualizar<K extends keyof ValoresWizard>(campo: K, valor: ValoresWizard[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  function Error({ campo }: { readonly campo: string }) {
    if (!estado.campos?.[campo]) return null;
    return (
      <p id={`${campo}-error`} role="alert" className="mensaje-error-campo">
        {estado.campos[campo]}
      </p>
    );
  }

  function claseCampo(campo: string, extra = "") {
    const conError = Boolean(estado.campos?.[campo]);
    return `${CAMPO}${extra}${conError ? " campo-con-error" : ""}`;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Progreso actual={pasoEfectivo} />

      {/* ── Paso 1: identificación ─────────────────────────────────── */}
      {pasoEfectivo === 0 && (
        <form action={accion} className="space-y-5" noValidate>
          <fieldset className="rounded-lg border border-toga-200 bg-white p-5">
            <legend className="px-2 text-sm font-semibold text-toga-900">
              Datos del postulante
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nationalIdDigits" className="block text-xs font-medium text-toga-600">
                  Cédula de identidad <span className="text-balanza-700">*</span>
                </label>
                <div className="mt-1 flex">
                  <span
                    className="inline-flex shrink-0 items-center rounded-l-md border border-r-0 border-toga-300 bg-toga-50 px-3 text-sm font-medium text-toga-700 codigo"
                    aria-hidden="true"
                  >
                    V-
                  </span>
                  <input
                    id="nationalIdDigits"
                    name="nationalIdDigits"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="12345678"
                    maxLength={8}
                    value={valores.nationalIdDigits}
                    onChange={(e) =>
                      actualizar("nationalIdDigits", e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    aria-invalid={Boolean(estado.campos?.nationalIdDigits)}
                    aria-describedby={
                      estado.campos?.nationalIdDigits ? "nationalIdDigits-error" : undefined
                    }
                    className={claseCampo(
                      "nationalIdDigits",
                      " codigo rounded-l-none !mt-0",
                    )}
                  />
                </div>
                <Error campo="nationalIdDigits" />
              </div>
              <div>
                <label htmlFor="chamber-trigger" className="block text-xs font-medium text-toga-600">
                  Sala a la que se postula <span className="text-balanza-700">*</span>
                </label>
                {/* Radix Select no envía name nativo: el hidden mantiene el POST. */}
                <input type="hidden" name="chamber" value={valores.chamber} />
                <Select
                  value={valores.chamber || undefined}
                  onValueChange={(v) => actualizar("chamber", v)}
                >
                  <SelectTrigger
                    id="chamber-trigger"
                    aria-invalid={Boolean(estado.campos?.chamber)}
                    aria-describedby={estado.campos?.chamber ? "chamber-error" : undefined}
                    className={`mt-1 ${estado.campos?.chamber ? "campo-con-error" : ""}`}
                  >
                    <SelectValue placeholder="Seleccione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAMBERS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {SALA_ETIQUETA[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Error campo="chamber" />
              </div>
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-toga-600">
                  Nombres <span className="text-balanza-700">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  value={valores.firstName}
                  onChange={(e) => actualizar("firstName", filtrarNombre(e.target.value))}
                  aria-invalid={Boolean(estado.campos?.firstName)}
                  aria-describedby={estado.campos?.firstName ? "firstName-error" : undefined}
                  className={claseCampo("firstName")}
                />
                <Error campo="firstName" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-toga-600">
                  Apellidos <span className="text-balanza-700">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  value={valores.lastName}
                  onChange={(e) => actualizar("lastName", filtrarNombre(e.target.value))}
                  aria-invalid={Boolean(estado.campos?.lastName)}
                  aria-describedby={estado.campos?.lastName ? "lastName-error" : undefined}
                  className={claseCampo("lastName")}
                />
                <Error campo="lastName" />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-toga-200 bg-white p-5">
            <legend className="px-2 text-sm font-semibold text-toga-900">
              Contacto y notas <span className="font-normal text-toga-400">(opcional)</span>
            </legend>
            <p className="mb-3 text-xs leading-relaxed text-toga-500">
              El correo, el teléfono y las notas internas <strong>nunca se publican</strong>. El
              resumen sí es público: redáctelo pensando en quien lo lea desde la calle.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-toga-600">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  value={valores.email}
                  onChange={(e) => actualizar("email", e.target.value)}
                  aria-invalid={Boolean(estado.campos?.email)}
                  aria-describedby={estado.campos?.email ? "email-error" : undefined}
                  className={claseCampo("email")}
                />
                <Error campo="email" />
              </div>
              <div>
                <label htmlFor="phoneDigits" className="block text-xs font-medium text-toga-600">
                  Teléfono
                </label>
                <input type="hidden" name="phonePrefix" value={valores.phonePrefix} />
                <div className="mt-1 flex gap-2">
                  <Select
                    value={valores.phonePrefix || "0412"}
                    onValueChange={(v) => actualizar("phonePrefix", v)}
                  >
                    <SelectTrigger
                      id="phone-prefix-trigger"
                      aria-label="Prefijo telefónico"
                      aria-invalid={Boolean(estado.campos?.phone)}
                      className={`w-[7.5rem] shrink-0 ${estado.campos?.phone ? "campo-con-error" : ""}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREFIJOS_TELEFONO.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    id="phoneDigits"
                    name="phoneDigits"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="1234567"
                    maxLength={7}
                    value={valores.phoneDigits}
                    onChange={(e) =>
                      actualizar("phoneDigits", e.target.value.replace(/\D/g, "").slice(0, 7))
                    }
                    aria-invalid={Boolean(estado.campos?.phone)}
                    aria-describedby={estado.campos?.phone ? "phone-error" : undefined}
                    className={claseCampo("phone", " !mt-0")}
                  />
                </div>
                <Error campo="phone" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="publicSummary" className="block text-xs font-medium text-toga-600">
                  Resumen público
                </label>
                <textarea
                  id="publicSummary"
                  name="publicSummary"
                  rows={3}
                  value={valores.publicSummary}
                  onChange={(e) => actualizar("publicSummary", e.target.value)}
                  aria-invalid={Boolean(estado.campos?.publicSummary)}
                  aria-describedby={
                    estado.campos?.publicSummary ? "publicSummary-error" : undefined
                  }
                  className={claseCampo("publicSummary")}
                />
                <Error campo="publicSummary" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="internalNotes" className="block text-xs font-medium text-toga-600">
                  Notas internas
                </label>
                <textarea
                  id="internalNotes"
                  name="internalNotes"
                  rows={2}
                  value={valores.internalNotes}
                  onChange={(e) => actualizar("internalNotes", e.target.value)}
                  className={CAMPO}
                />
              </div>
            </div>
          </fieldset>

          <BotonPaso1 />
        </form>
      )}

      {/* ── Paso 2: documentos ─────────────────────────────────────── */}
      {pasoEfectivo === 1 && creado && (
        <div className="space-y-5">
          <p className="rounded-md border border-validado-700/20 bg-validado-50 px-4 py-3 text-sm text-validado-700">
            Expediente <strong className="codigo">{creado.fileNumber}</strong> abierto. Ya puede
            cargar los documentos.
          </p>

          <ZonaDocumentos
            submissionId={creado.submissionId}
            documentos={documentos}
            onCambio={setDocumentos}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPaso(2)}
              disabled={documentos.length === 0}
              className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar a revisión →
            </button>
            {documentos.length === 0 && (
              <p className="self-center text-xs text-toga-500">
                Cargue al menos un documento para continuar.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Paso 3: revisión ───────────────────────────────────────── */}
      {pasoEfectivo === 2 && creado && (
        <div className="space-y-5">
          <div className="rounded-lg border border-toga-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-toga-900">Resumen del expediente</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-toga-500">Número de expediente</dt>
                <dd className="codigo font-medium text-toga-900">{creado.fileNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-toga-500">Documentos cargados</dt>
                <dd className="cifra font-medium text-toga-900">{documentos.length}</dd>
              </div>
            </dl>
            <ul className="mt-4 divide-y divide-toga-100 border-t border-toga-100 text-sm">
              {documentos.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate text-toga-700">{d.originalName}</span>
                  <span className="shrink-0 text-xs text-toga-500">
                    {Math.round(d.sizeBytes / 1024)} KB
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm leading-relaxed text-balanza-700">
            Verifique que los nombres estén bien escritos y que los documentos sean legibles. Al
            enviar, el expediente pasa a revisión documental y el evaluador podrá devolverlo si
            encuentra un error.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={enviando}
              onClick={() => {
                setEnviando(true);
                void enviarARevision(creado.candidateId).then((r) => {
                  if (r.ok) router.push(`/expedientes/${creado.candidateId}`);
                  else {
                    toast.error(r.error ?? "No se pudo enviar");
                    setEnviando(false);
                  }
                });
              }}
              className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar a evaluación"}
            </button>
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="rounded-md border border-toga-300 px-5 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-100"
            >
              ← Volver a documentos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
