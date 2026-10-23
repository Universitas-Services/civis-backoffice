"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/toast-provider";
import { enviarPostulacion, pedirCodigoCorreo } from "@/app/(postulacion)/postulacion/acciones";

type Paso = "inicio" | "correo" | "codigo";

const CAMPO = "w-full rounded-md border border-toga-300 px-3 py-2 text-base";
const BOTON =
  "rounded-md bg-balanza-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-balanza-700 disabled:opacity-60";
const SECUNDARIO =
  "rounded-md border border-toga-300 bg-white px-3 py-1.5 text-xs font-medium text-toga-700 hover:bg-toga-50";

/**
 * Envío a revisión desde la autopostulación: el postulante indica un correo,
 * recibe un código de 6 dígitos y lo escribe para confirmar. Después ya no
 * puede cargar ni cambiar documentos.
 */
export function EnvioConCorreo({
  fileNumber,
  nombre,
  onEnviado,
}: {
  readonly fileNumber: string;
  readonly nombre: string;
  readonly onEnviado: () => void;
}) {
  const toast = useToast();
  const [paso, setPaso] = useState<Paso>("inicio");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pendiente, iniciar] = useTransition();

  function pedir() {
    iniciar(async () => {
      const r = await pedirCodigoCorreo(email);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo enviar el código.");
        return;
      }
      toast.exito(`Le enviamos un código a ${email}. Caduca en 10 minutos.`);
      setCodigo("");
      setPaso("codigo");
    });
  }

  function confirmar() {
    iniciar(async () => {
      const r = await enviarPostulacion(email, codigo);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo enviar el expediente.");
        return;
      }
      toast.exito(`Expediente ${fileNumber} enviado a revisión documental.`);
      onEnviado();
    });
  }

  if (paso === "inicio") {
    return (
      <button type="button" onClick={() => setPaso("correo")} className={`shrink-0 ${BOTON}`}>
        Enviar a revisión
      </button>
    );
  }

  if (paso === "correo") {
    return (
      <div className="w-full space-y-2 text-left">
        <label htmlFor="correo-envio" className="block text-xs font-medium text-toga-700">
          Correo de contacto
        </label>
        <input
          id="correo-envio"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={CAMPO}
        />
        <p className="text-xs leading-relaxed text-toga-500">
          Le enviaremos un código de verificación. Allí también recibirá la confirmación.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => setPaso("inicio")} className={SECUNDARIO}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={pedir}
            disabled={pendiente || !email.includes("@")}
            className={BOTON}
          >
            {pendiente ? "Enviando…" : "Enviar código"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 text-left">
      <label htmlFor="codigo-envio" className="block text-xs font-medium text-toga-700">
        Código recibido en {email}
      </label>
      <input
        id="codigo-envio"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className={`${CAMPO} codigo text-center tracking-[0.4em]`}
      />
      <p className="text-xs leading-relaxed text-toga-700">
        ¿Enviar el expediente <span className="codigo font-semibold">{fileNumber}</span> de{" "}
        <span className="font-semibold">{nombre}</span> a revisión? Después no podrá cargar ni
        cambiar documentos.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => setPaso("correo")} className={SECUNDARIO}>
          Cambiar correo
        </button>
        <button type="button" onClick={pedir} disabled={pendiente} className={SECUNDARIO}>
          Reenviar código
        </button>
        <button
          type="button"
          onClick={confirmar}
          disabled={pendiente || codigo.length !== 6}
          className={BOTON}
        >
          {pendiente ? "Enviando…" : "Confirmar envío"}
        </button>
      </div>
    </div>
  );
}
