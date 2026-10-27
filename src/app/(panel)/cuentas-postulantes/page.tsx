import type { Metadata } from "next";
import Link from "next/link";
import {
  ESTADO_CUENTA_ETIQUETA,
  ESTADOS_CUENTA_POSTULANTE,
  type CuentaPostulante,
  type EstadoCuentaPostulante,
  type ListaCuentasPostulantes,
} from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { fechaLarga } from "@/lib/plazos";
import { CabeceraPagina, EstadoVacio } from "@/components/cabecera-pagina";
import { Paginacion } from "@/components/paginacion";
import { InsigniaEstado } from "@/components/insignias";
import { InterruptorUsuario } from "@/components/gestion-usuarios";

export const metadata: Metadata = { title: "Cuentas de postulantes" };

const PAGE_SIZE = 20;

const CLASE_ESTADO: Record<EstadoCuentaPostulante, string> = {
  PENDING_VERIFICATION: "bg-toga-100 text-toga-700",
  ACTIVE: "bg-validado-50 text-validado-700",
  SUSPENDED: "bg-balanza-50 text-balanza-700",
};

/**
 * Cuentas creadas desde el portal del postulante. Viven fuera de «Usuarios y
 * roles»: su rol nunca cambia. Aquí se consultan y se suspenden o reactivan.
 */
export default async function CuentasDePostulantes({
  searchParams,
}: {
  readonly searchParams: Promise<{ q?: string; estado?: string; page?: string }>;
}) {
  await exigirRol("SUPER_ADMIN", "ADMIN");

  const params = await searchParams;
  const estado = ESTADOS_CUENTA_POSTULANTE.find((e) => e === params.estado);
  const q = params.q?.trim().slice(0, 120) || undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q) query.set("q", q);
  if (estado) query.set("estado", estado);

  let datos: ListaCuentasPostulantes;
  try {
    datos = await llamarApi<ListaCuentasPostulantes>(`/internal/users/postulantes?${query}`);
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/cuentas-postulantes");
    throw error;
  }

  const total = ESTADOS_CUENTA_POSTULANTE.reduce((n, e) => n + (datos.resumen[e] ?? 0), 0);
  const enlace = (e?: EstadoCuentaPostulante) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (e) p.set("estado", e);
    const s = p.toString();
    return s ? `/cuentas-postulantes?${s}` : "/cuentas-postulantes";
  };

  return (
    <>
      <CabeceraPagina
        titulo="Cuentas de postulantes"
        descripcion="Cuentas creadas en el portal del postulante. No cambian de rol: aquí se consultan y, si hace falta, se suspenden o reactivan."
        meta={
          <p className="text-sm text-toga-500">
            <span className="cifra font-medium text-toga-800">{total}</span>{" "}
            {total === 1 ? "cuenta" : "cuentas"}
          </p>
        }
      />

      <div className="px-5 py-6 sm:px-8">
        <form className="flex flex-wrap items-end gap-2" role="search">
          <label className="min-w-0 flex-1 sm:max-w-sm">
            <span className="text-sm font-medium text-toga-800">Buscar</span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Nombre, correo o cédula"
              className="mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2 text-base text-toga-900 focus:border-balanza-600"
            />
          </label>
          {estado && <input type="hidden" name="estado" value={estado} />}
          <button
            type="submit"
            className="rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
          >
            Buscar
          </button>
        </form>

        <nav aria-label="Filtrar por estado" className="-mx-1 mt-4 flex flex-wrap gap-1.5">
          {[undefined, ...ESTADOS_CUENTA_POSTULANTE].map((e) => {
            const activo = e === estado;
            return (
              <Link
                key={e ?? "todas"}
                href={enlace(e)}
                aria-current={activo ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activo
                    ? "border-balanza-600 bg-balanza-50 text-balanza-700"
                    : "border-toga-200 bg-white text-toga-600 hover:border-toga-300 hover:text-toga-900"
                }`}
              >
                {e ? ESTADO_CUENTA_ETIQUETA[e] : "Todas"}
                <span className="cifra ml-1.5 text-xs text-toga-400">
                  ({e ? (datos.resumen[e] ?? 0) : total})
                </span>
              </Link>
            );
          })}
        </nav>

        {datos.items.length === 0 ? (
          <div className="mt-4">
            <EstadoVacio
              titulo="Sin cuentas"
              detalle={
                q
                  ? "Ninguna cuenta coincide con la búsqueda."
                  : "Todavía nadie se registró en el portal."
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-hidden rounded-lg border border-toga-200 bg-white lg:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Cuentas del portal del postulante</caption>
                <thead className="border-b-2 border-toga-300 bg-toga-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Postulante
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Cuenta
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Expediente
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-toga-700">
                      Acceso
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-toga-100">
                  {datos.items.map((c) => (
                    <tr key={c.id} className="align-top hover:bg-toga-50">
                      <th scope="row" className="px-4 py-3 text-left font-normal">
                        <p className="font-medium text-toga-900">{c.fullName}</p>
                        <p className="mt-0.5 break-all text-xs text-toga-500">{c.email}</p>
                      </th>
                      <td className="px-4 py-3">
                        <EstadoCuenta c={c} />
                      </td>
                      <td className="px-4 py-3">
                        <Expediente c={c} />
                      </td>
                      <td className="px-4 py-3">
                        <Acceso c={c} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 space-y-3 lg:hidden">
              {datos.items.map((c) => (
                <li key={c.id} className="space-y-3 rounded-lg border border-toga-200 bg-white p-4">
                  <div>
                    <p className="font-medium text-toga-900">{c.fullName}</p>
                    <p className="mt-0.5 break-all text-xs text-toga-500">{c.email}</p>
                  </div>
                  <EstadoCuenta c={c} />
                  <Expediente c={c} />
                  <Acceso c={c} />
                </li>
              ))}
            </ul>
          </>
        )}

        <Paginacion
          ruta="/cuentas-postulantes"
          page={datos.page}
          pageSize={datos.pageSize || PAGE_SIZE}
          total={datos.total}
          params={{ q, estado }}
        />
      </div>
    </>
  );
}

function EstadoCuenta({ c }: { readonly c: CuentaPostulante }) {
  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASE_ESTADO[c.status]}`}
      >
        {ESTADO_CUENTA_ETIQUETA[c.status]}
      </span>
      <p className="mt-1 text-xs text-toga-500">
        Creada el {fechaLarga(c.createdAt)}
        {c.lastLoginAt ? ` · último acceso el ${fechaLarga(c.lastLoginAt)}` : " · sin ingresos"}
      </p>
    </div>
  );
}

function Expediente({ c }: { readonly c: CuentaPostulante }) {
  if (!c.expediente) {
    return <p className="text-sm text-toga-500">Todavía no creó su postulación.</p>;
  }
  return (
    <div className="space-y-1">
      <Link
        href={`/expedientes/${c.expediente.candidateId}`}
        className="text-sm font-semibold text-balanza-700 hover:text-balanza-600"
      >
        {c.expediente.fileNumber ?? "Expediente"}
      </Link>
      <p className="codigo text-xs text-toga-500">{c.expediente.nationalId}</p>
      <InsigniaEstado estado={c.expediente.workflowStatus} />
    </div>
  );
}

function Acceso({ c }: { readonly c: CuentaPostulante }) {
  // Una cuenta sin verificar se activa sola cuando el postulante confirma su correo.
  if (c.status === "PENDING_VERIFICATION") {
    return <span className="text-xs text-toga-500">Espera la verificación del correo</span>;
  }
  return (
    <InterruptorUsuario
      id={c.id}
      nombre={c.fullName}
      activo={c.status === "ACTIVE"}
      esUnoMismo={false}
    />
  );
}
