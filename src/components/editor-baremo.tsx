"use client";

import { useState, useTransition } from "react";
import {
  actualizarBaremo,
  crearBaremo,
  eliminarBaremo,
  type ErrorCampoBaremo,
} from "@/app/(panel)/baremo/configuracion/acciones";
import {
  criterioVacio,
  mover,
  payloadBaremo,
  rangoVacio,
  type CriterioForm,
  type FormularioBaremo,
} from "@/lib/formulario-baremo";

const CAMPO =
  "mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900";

export function EditorBaremo({
  baremoId,
  inicial,
  activo = false,
}: {
  readonly baremoId?: string;
  readonly inicial?: FormularioBaremo;
  readonly activo?: boolean;
}) {
  const [form, setForm] = useState<FormularioBaremo>(
    inicial ?? { title: "", description: "", totalPoints: "", criterios: [] },
  );
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<readonly ErrorCampoBaremo[]>([]);
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  const totalTexto = form.totalPoints.trim();
  const total = Number(totalTexto);
  const suma = form.criterios.reduce((acc, c) => {
    const texto = c.points.trim();
    if (!texto) return acc;
    const n = Number(texto);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
  const hayPuntos = form.criterios.some((c) => c.points.trim() !== "");
  const sumaExcede = totalTexto !== "" && Number.isFinite(total) && hayPuntos && suma > total;
  const cupoCriterios = totalTexto !== "" && Number.isFinite(total) && hayPuntos && suma >= total;
  const mensaje = (campo: string) => errores.find((e) => e.field === campo)?.message;

  function aplicar(
    resultado: { ok: false; error: string; errores?: readonly ErrorCampoBaremo[] } | undefined,
  ) {
    if (!resultado) return;
    setError(resultado.error);
    setErrores(resultado.errores ?? []);
  }

  function guardar() {
    setError(null);
    setErrores([]);
    const payload = payloadBaremo(form);
    startTransition(async () => {
      const resultado = baremoId
        ? await actualizarBaremo(baremoId, payload)
        : await crearBaremo(payload);
      aplicar(resultado);
    });
  }

  function eliminar() {
    if (!baremoId) return;
    setError(null);
    startTransition(async () => {
      aplicar(await eliminarBaremo(baremoId));
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {error}
        </p>
      )}

      <section className="rounded-lg border border-toga-200 bg-white px-5 py-5">
        <label className="block text-xs font-medium text-toga-600" htmlFor="baremo-titulo">
          Título
        </label>
        <input
          id="baremo-titulo"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={`${CAMPO}${mensaje("title") ? " campo-con-error" : ""}`}
        />
        {mensaje("title") && <p className="mensaje-error-campo">{mensaje("title")}</p>}

        <label className="mt-4 block text-xs font-medium text-toga-600" htmlFor="baremo-desc">
          Descripción
        </label>
        <textarea
          id="baremo-desc"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={CAMPO}
        />

        <label className="mt-4 block text-xs font-medium text-toga-600" htmlFor="baremo-total">
          Puntuación total
        </label>
        <input
          id="baremo-total"
          inputMode="decimal"
          value={form.totalPoints}
          onChange={(e) => setForm({ ...form, totalPoints: e.target.value })}
          className={`${CAMPO} cifra max-w-[10rem]${mensaje("totalPoints") ? " campo-con-error" : ""}`}
        />
        {mensaje("totalPoints") && <p className="mensaje-error-campo">{mensaje("totalPoints")}</p>}
        <p className={`mt-2 text-sm ${sumaExcede ? "font-medium text-red-700" : "text-toga-600"}`}>
          Suma de criterios: <span className="cifra">{hayPuntos ? suma : "—"}</span> /{" "}
          <span className="cifra">{totalTexto !== "" && Number.isFinite(total) ? total : "—"}</span>
        </p>
        {(sumaExcede || mensaje("criterios")) && (
          <p className="mensaje-error-campo">
            {mensaje("criterios") ?? "La suma de los criterios supera el total."}
          </p>
        )}
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-toga-900">Criterios</h2>
        <button
          type="button"
          disabled={cupoCriterios}
          title={cupoCriterios ? "Los criterios ya cubren la puntuación total" : undefined}
          onClick={() => setForm({ ...form, criterios: [...form.criterios, criterioVacio()] })}
          className="rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-medium text-toga-800 hover:bg-toga-50 disabled:opacity-40"
        >
          Añadir criterio
        </button>
      </div>

      {form.criterios.map((criterio, indice) => (
        <CriterioEditor
          key={criterio.key}
          criterio={criterio}
          indice={indice}
          total={form.criterios.length}
          errores={errores}
          onChange={(siguiente) =>
            setForm({
              ...form,
              criterios: form.criterios.map((c) => (c.key === criterio.key ? siguiente : c)),
            })
          }
          onMover={(delta) => setForm({ ...form, criterios: mover(form.criterios, indice, delta) })}
          onQuitar={() =>
            setForm({ ...form, criterios: form.criterios.filter((c) => c.key !== criterio.key) })
          }
        />
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={pending}
          className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {baremoId &&
          !activo &&
          (confirmando ? (
            <span className="flex flex-wrap items-center gap-2 text-sm text-toga-700">
              ¿Eliminar «{form.title || "este baremo"}» con sus criterios y rangos?
              <button
                type="button"
                onClick={eliminar}
                disabled={pending}
                className="rounded-md border border-balanza-600 px-3 py-1.5 font-semibold text-balanza-700 hover:bg-balanza-50"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-md border border-toga-300 px-3 py-1.5"
              >
                Cancelar
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              disabled={pending}
              className="rounded-md border border-toga-300 px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Eliminar
            </button>
          ))}
      </div>
    </div>
  );
}

function CriterioEditor({
  criterio,
  indice,
  total,
  errores,
  onChange,
  onMover,
  onQuitar,
}: {
  readonly criterio: CriterioForm;
  readonly indice: number;
  readonly total: number;
  readonly errores: readonly ErrorCampoBaremo[];
  readonly onChange: (criterio: CriterioForm) => void;
  readonly onMover: (delta: number) => void;
  readonly onQuitar: () => void;
}) {
  const base = `criterios.${indice}`;
  const aviso = (campo: string) => errores.find((e) => e.field === campo)?.message;
  const puntosTexto = criterio.points.trim();
  const points = Number(puntosTexto);

  return (
    <section className="rounded-lg border border-toga-200 bg-white px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-toga-500">Criterio {indice + 1}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={indice === 0}
            onClick={() => onMover(-1)}
            className="text-xs text-toga-600 disabled:opacity-40"
          >
            Subir
          </button>
          <button
            type="button"
            disabled={indice === total - 1}
            onClick={() => onMover(1)}
            className="text-xs text-toga-600 disabled:opacity-40"
          >
            Bajar
          </button>
          <button type="button" onClick={onQuitar} className="text-xs text-balanza-700">
            Quitar
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div>
          <label
            className="block text-xs font-medium text-toga-600"
            htmlFor={`${criterio.key}-nombre`}
          >
            Nombre
          </label>
          <input
            id={`${criterio.key}-nombre`}
            value={criterio.name}
            onChange={(e) => onChange({ ...criterio, name: e.target.value })}
            className={`${CAMPO}${aviso(`${base}.name`) ? " campo-con-error" : ""}`}
          />
          {aviso(`${base}.name`) && <p className="mensaje-error-campo">{aviso(`${base}.name`)}</p>}
        </div>
        <div>
          <label
            className="block text-xs font-medium text-toga-600"
            htmlFor={`${criterio.key}-puntos`}
          >
            Puntos
          </label>
          <input
            id={`${criterio.key}-puntos`}
            inputMode="decimal"
            value={criterio.points}
            onChange={(e) => onChange({ ...criterio, points: e.target.value })}
            className={`${CAMPO} cifra${aviso(`${base}.points`) ? " campo-con-error" : ""}`}
          />
          {aviso(`${base}.points`) && (
            <p className="mensaje-error-campo">{aviso(`${base}.points`)}</p>
          )}
        </div>
      </div>
      <label
        className="mt-3 block text-xs font-medium text-toga-600"
        htmlFor={`${criterio.key}-desc`}
      >
        Descripción
      </label>
      <input
        id={`${criterio.key}-desc`}
        value={criterio.description}
        onChange={(e) => onChange({ ...criterio, description: e.target.value })}
        className={CAMPO}
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-toga-600">Rangos</p>
        <button
          type="button"
          onClick={() => onChange({ ...criterio, rangos: [...criterio.rangos, rangoVacio()] })}
          className="text-xs font-medium text-balanza-700"
        >
          Añadir rango
        </button>
      </div>
      <ul className="mt-2 space-y-3">
        {criterio.rangos.map((rango, rIndice) => {
          const minTexto = rango.minPoints.trim();
          const maxTexto = rango.maxPoints.trim();
          const min = Number(minTexto);
          const max = Number(maxTexto);
          const minMayor = minTexto !== "" && maxTexto !== "" && min > max;
          const topeExcede =
            maxTexto !== "" && puntosTexto !== "" && Number.isFinite(points) && max > points;
          const maxInvalido = minMayor || topeExcede;
          const ruta = `${base}.rangos.${rIndice}`;
          return (
            <li key={rango.key} className="rounded-md border border-toga-100 bg-toga-50 px-3 py-3">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={rIndice === 0}
                  onClick={() =>
                    onChange({ ...criterio, rangos: mover(criterio.rangos, rIndice, -1) })
                  }
                  className="text-xs text-toga-600 disabled:opacity-40"
                >
                  Subir
                </button>
                <button
                  type="button"
                  disabled={rIndice === criterio.rangos.length - 1}
                  onClick={() =>
                    onChange({ ...criterio, rangos: mover(criterio.rangos, rIndice, 1) })
                  }
                  className="text-xs text-toga-600 disabled:opacity-40"
                >
                  Bajar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...criterio,
                      rangos: criterio.rangos.filter((r) => r.key !== rango.key),
                    })
                  }
                  className="text-xs text-balanza-700"
                >
                  Quitar
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_6rem_6rem]">
                <input
                  aria-label="Título del rango"
                  value={rango.title}
                  onChange={(e) =>
                    onChange({
                      ...criterio,
                      rangos: criterio.rangos.map((r) =>
                        r.key === rango.key ? { ...r, title: e.target.value } : r,
                      ),
                    })
                  }
                  placeholder="Título"
                  className={`${CAMPO}${aviso(`${ruta}.title`) ? " campo-con-error" : ""}`}
                />
                <input
                  aria-label="Mínimo"
                  inputMode="decimal"
                  value={rango.minPoints}
                  onChange={(e) =>
                    onChange({
                      ...criterio,
                      rangos: criterio.rangos.map((r) =>
                        r.key === rango.key ? { ...r, minPoints: e.target.value } : r,
                      ),
                    })
                  }
                  placeholder="Mín."
                  className={`${CAMPO} cifra${minMayor || aviso(`${ruta}.minPoints`) ? " campo-con-error" : ""}`}
                />
                <input
                  aria-label="Máximo"
                  inputMode="decimal"
                  value={rango.maxPoints}
                  onChange={(e) =>
                    onChange({
                      ...criterio,
                      rangos: criterio.rangos.map((r) =>
                        r.key === rango.key ? { ...r, maxPoints: e.target.value } : r,
                      ),
                    })
                  }
                  placeholder="Máx."
                  className={`${CAMPO} cifra${maxInvalido || aviso(`${ruta}.maxPoints`) ? " campo-con-error" : ""}`}
                />
              </div>
              {aviso(`${ruta}.title`) && (
                <p className="mensaje-error-campo">{aviso(`${ruta}.title`)}</p>
              )}
              <input
                aria-label="Descripción del rango"
                value={rango.description}
                onChange={(e) =>
                  onChange({
                    ...criterio,
                    rangos: criterio.rangos.map((r) =>
                      r.key === rango.key ? { ...r, description: e.target.value } : r,
                    ),
                  })
                }
                placeholder="Descripción, si hace falta"
                className={CAMPO}
              />
              {minMayor && (
                <p className="mensaje-error-campo">El mínimo no puede ser mayor que el máximo.</p>
              )}
              {topeExcede && (
                <p className="mensaje-error-campo">
                  El máximo no puede superar los puntos del criterio.
                </p>
              )}
              {aviso(`${ruta}.minPoints`) && (
                <p className="mensaje-error-campo">{aviso(`${ruta}.minPoints`)}</p>
              )}
              {aviso(`${ruta}.maxPoints`) && (
                <p className="mensaje-error-campo">{aviso(`${ruta}.maxPoints`)}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
