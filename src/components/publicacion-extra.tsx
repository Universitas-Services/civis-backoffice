"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import type { FichaPublica } from "@/contracts";
import { SALA_ETIQUETA } from "@/contracts";
import {
  prepararFicha,
  retirarPublicacion,
  type EstadoPublicacion,
} from "@/app/(panel)/publicaciones/acciones";

interface Candidato {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly chamber: keyof typeof SALA_ETIQUETA;
  readonly publicationStatus: string;
  readonly evaluations: readonly { readonly totalPoints: string }[];
}

/**
 * Preparar la ficha pública de un postulante.
 *
 * Antes sólo se podía publicar el ranking. Un perfil evaluado y aprobado no
 * tenía camino hacia el sitio público desde la interfaz, aunque la API sí lo
 * permitía.
 */
export function PrepararFicha() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [elegido, setElegido] = useState("");
  const [vista, setVista] = useState<FichaPublica | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [cargandoVista, setCargandoVista] = useState(false);

  useEffect(() => {
    void fetch("/api/candidatos-publicables")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: Candidato[] }) => setCandidatos(d.items ?? []))
      .catch(() => setCandidatos([]));
  }, []);

  async function verVistaPrevia() {
    if (!elegido) return;
    setCargandoVista(true);
    setVista(null);
    try {
      const r = await fetch(`/api/vista-previa/${elegido}`);
      if (r.ok) setVista((await r.json()) as FichaPublica);
      else setMensaje({ texto: "No se pudo generar la vista previa.", error: true });
    } finally {
      setCargandoVista(false);
    }
  }

  return (
    <section
      aria-labelledby="preparar-ficha"
      className="rounded-lg border border-toga-200 bg-white p-5"
    >
      <h2 id="preparar-ficha" className="text-sm font-semibold text-toga-900">
        Preparar la ficha de un postulante
      </h2>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-toga-500">
        Mire primero la vista previa: es exactamente lo que verá la ciudadanía. Aprobar sin mirar es
        justo lo que esta cola existe para evitar.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <label htmlFor="candidato" className="block text-xs font-medium text-toga-600">
            Postulante con evaluación aprobada
          </label>
          <select
            id="candidato"
            value={elegido}
            onChange={(e) => {
              setElegido(e.target.value);
              setVista(null);
            }}
            className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Seleccione…</option>
            {candidatos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} · {SALA_ETIQUETA[c.chamber]}
                {c.evaluations[0] ? ` · ${Number(c.evaluations[0].totalPoints)} pts` : ""}
                {c.publicationStatus === "PUBLISHED" ? " · ya publicado" : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={!elegido || cargandoVista}
          onClick={() => void verVistaPrevia()}
          className="rounded-md border border-toga-300 px-4 py-2 text-sm font-semibold text-toga-700 hover:bg-toga-100 disabled:opacity-50"
        >
          {cargandoVista ? "Cargando…" : "Vista previa"}
        </button>
        <button
          type="button"
          disabled={!elegido || pendiente}
          onClick={() =>
            iniciar(async () => {
              const r = await prepararFicha(elegido);
              setMensaje({ texto: r.error ?? r.exito ?? "", error: Boolean(r.error) });
            })
          }
          className="rounded-md bg-toga-900 px-4 py-2 text-sm font-semibold text-white hover:bg-toga-800 disabled:opacity-50"
        >
          {pendiente ? "Preparando…" : "Preparar ficha"}
        </button>
      </div>

      {mensaje && (
        <p
          role={mensaje.error ? "alert" : "status"}
          className={`mt-3 rounded-md px-4 py-3 text-sm ${
            mensaje.error
              ? "border border-balanza-600/25 bg-balanza-50 text-balanza-700"
              : "border border-validado-700/20 bg-validado-50 text-validado-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      {vista && (
        <div className="mt-4 rounded-lg border-2 border-dashed border-toga-300 bg-toga-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-toga-500">
            Así lo verá la ciudadanía
          </p>
          <p className="mt-2 font-serif text-lg font-semibold text-toga-900">{vista.fullName}</p>
          <p className="text-xs text-toga-500">
            {SALA_ETIQUETA[vista.chamber]} · baremo {vista.rubricVersion}
            {vista.provisional && " · resultado provisional"}
          </p>
          <p className="cifra mt-2 text-2xl font-semibold text-toga-900">
            {vista.total}
            <span className="ml-1 text-sm font-normal text-toga-500">/ 100</span>
            {vista.ineligible && (
              <span className="ml-3 rounded-full bg-toga-800 px-2.5 py-1 text-xs font-medium text-toga-100">
                Inhabilitado
              </span>
            )}
          </p>
          {vista.publicSummary && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-toga-600">
              {vista.publicSummary}
            </p>
          )}
          <ul className="mt-3 space-y-1 text-sm text-toga-700">
            {vista.breakdown.map((b) => (
              <li key={b.dimensionKey} className="flex justify-between gap-4">
                <span>{b.label}</span>
                <span className="cifra">
                  {b.points} / {b.maxPoints}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-toga-500">
            {vista.documents.length} documento(s) público(s)
            {vista.objectedCredentials.length > 0 &&
              ` · credenciales objetadas: ${vista.objectedCredentials.join(", ")}`}
          </p>
        </div>
      )}
    </section>
  );
}

interface SnapshotPublicado {
  readonly id: string;
  readonly kind: string;
  readonly version: number;
  readonly publishedAt: string | null;
  readonly candidate: { readonly firstName: string; readonly lastName: string } | null;
}

const TIPO: Record<string, string> = {
  CANDIDATE_PROFILE: "Perfil",
  RANKING: "Ranking público",
  REPORT: "Informe",
};

/** Lo que está publicado ahora mismo, con la opción de retirarlo. */
export function PublicadosVigentes() {
  const [items, setItems] = useState<SnapshotPublicado[]>([]);

  useEffect(() => {
    void fetch("/api/publicados")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: SnapshotPublicado[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="vigentes">
      <h2 id="vigentes" className="text-base font-semibold text-toga-900">
        Publicado ahora mismo
      </h2>
      <p className="mt-1 text-sm text-toga-500">
        Retirar algo del sitio público exige motivo y queda en la bitácora.
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((s) => (
          <li key={s.id}>
            <FichaRetirar snapshot={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FichaRetirar({ snapshot }: { readonly snapshot: SnapshotPublicado }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, accion] = useActionState<EstadoPublicacion, FormData>(
    retirarPublicacion.bind(null, snapshot.id),
    {},
  );

  const nombre = snapshot.candidate
    ? `${snapshot.candidate.firstName} ${snapshot.candidate.lastName}`
    : (TIPO[snapshot.kind] ?? snapshot.kind);

  return (
    <article className="rounded-lg border border-toga-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-toga-900">{nombre}</p>
          <p className="text-xs text-toga-500">
            {TIPO[snapshot.kind] ?? snapshot.kind} · versión {snapshot.version}
            {snapshot.publishedAt &&
              ` · desde el ${new Date(snapshot.publishedAt).toLocaleDateString("es-VE", { dateStyle: "medium" })}`}
          </p>
        </div>
        {!estado.exito && (
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            className="rounded-md border border-toga-300 px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-100"
          >
            {abierto ? "Cancelar" : "Retirar"}
          </button>
        )}
      </div>

      {estado.exito && (
        <p
          role="status"
          className="mt-3 rounded-md border border-validado-700/20 bg-validado-50 px-3 py-2 text-sm text-validado-700"
        >
          {estado.exito}
        </p>
      )}
      {estado.error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-balanza-600/25 bg-balanza-50 px-3 py-2 text-sm text-balanza-700"
        >
          {estado.error}
        </p>
      )}

      {abierto && !estado.exito && (
        <form action={accion} className="mt-3 space-y-2 border-t border-toga-100 pt-3">
          <label htmlFor={`w-${snapshot.id}`} className="block text-xs font-medium text-toga-600">
            Motivo del retiro <span className="text-balanza-700">*</span>
          </label>
          <textarea
            id={`w-${snapshot.id}`}
            name="reason"
            rows={2}
            required
            minLength={10}
            placeholder="Por qué se retira del sitio público."
            className="w-full rounded-md border border-toga-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-toga-900 px-4 py-2 text-sm font-semibold text-white hover:bg-toga-800"
          >
            Confirmar retiro
          </button>
        </form>
      )}
    </article>
  );
}
