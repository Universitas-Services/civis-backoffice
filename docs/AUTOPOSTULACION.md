# CIVIS — Autopostulación, procedimiento de objeciones y PDF del visualizador

Contrato entre el backoffice y `civis-api`. Prefijo `/api/v1`. Migración `20261025120000_cuentas_comite`.

## 1. Autopostulación (fuera del panel)

Desde octubre de 2026 la autopostulación **no vive en este panel**: la atiende el proyecto
`civis-postulacion`, con cuenta propia del postulante. El panel ya no tiene `/postulacion/*`,
ni la cookie `cp_postulacion`, ni la cabecera `X-Codigo-Postulacion`.

- **Cuenta:** el postulante se registra con nombre, apellido, correo y clave, y confirma el
  correo con un código de 6 dígitos (`POST /public/cuentas/registro`, `/verificar`, `/reenviar`).
  Ingresa con el login común (`/auth/login`); una cuenta sin verificar recibe `403` con
  `codigo: CORREO_SIN_VERIFICAR`. El rol `APPLICANT` no se asigna desde el panel, y el login del
  panel rechaza las cuentas que solo tienen ese rol.
- **Postulación:** rutas `/applicant/postulacion` (solo `APPLICANT`, siempre sobre su propio
  expediente). Crear, corregir datos y cargar documentos mientras está en `DRAFT`; enviar a
  revisión sin código por correo.
- **Devolución:** si la revisión lo devuelve a borrador, el motivo se guarda en
  `Candidate.returnReason` (además de la bitácora) y el postulante recibe un correo. **Corrige él
  desde su cuenta, y la secretaría también puede hacerlo** desde el expediente.

### Teléfono

Formato nacional de 11 dígitos: `0` + código + 7 dígitos.

| Tipo | Códigos |
|---|---|
| Móviles | 0412 y 0422 (Digitel), 0414 y 0424 (Movistar), 0416 y 0426 (Movilnet) |
| Fijos | 02XX |

## 2. Comité: procedimiento legal de objeciones (LOTSJ arts. 71 y 72)

Toda objeción llega primero al **comité** (rol `COMMITTEE`). Etapas (`Objection.stage`):

1. **Recibida** (`RECIBIDA`): durante el lapso de objeciones **sólo el comité la ve**. Nadie más
   recibe aviso.
2. **Admisión** (8 días continuos tras cerrar el lapso):
   - **Admitir** → auto de admisión en PDF y notificación al postulado con el auto y la denuncia
     (con la identidad del objetante reservada). Si el expediente lo cargó la secretaría y el
     postulado no tiene cuenta, el correo va a la secretaría. Abre el **plazo de descargo**
     (3 días continuos, vence al final del día en Caracas) → `EN_DESCARGO`.
   - **Inadmitir** → auto de inadmisión al objetante. El postulado nunca la ve → `INADMITIDA`.
3. **Descargo**: título, descripción y documento opcional, sólo dentro del plazo. Lo presenta el
   postulado desde su cuenta, o la secretaría si no tiene cuenta → `DESCARGO_PRESENTADO`.
   Si vence sin respuesta → `SIN_DESCARGO` y alerta «sin descargos» al postulado (o la secretaría)
   y al comité.
4. **Comprobación** (hasta 5 días continuos tras vencer el descargo) y **decisión**:
   - **Con lugar** → auto y paso al Consejo (`forwardedAt`), que declara la inelegibilidad
     (excluye del ranking interno) o ajusta el puntaje → `CON_LUGAR`.
   - **Sin lugar** → auto que ratifica la elegibilidad → `SIN_LUGAR`.
   - La decisión se notifica al postulado (o la secretaría) y al objetante.

Ni el postulado ni la secretaría ven quién objetó. El Consejo sólo ve lo declarado con lugar.
Los autos se generan una vez, se guardan en el bucket y se numeran `CIVIS-AUTO-<año>-<n>`
(ver `civis-api/docs/AUTOS.md`).

Los vencimientos se marcan solos: cada 10 minutos en la API, al abrir las bandejas y desde
Cloud Scheduler (`POST /internal/tareas/vencimientos` con la cabecera `X-Tareas-Token`).

| Ruta | Roles |
|---|---|
| `GET /internal/comite/objeciones?etapa=RECIBIDAS\|EN_DESCARGO\|POR_DECIDIR\|DECIDIDAS` | SA, COMMITTEE |
| `GET /internal/comite/objeciones/:id` (identidad del objetante; se audita) | SA, COMMITTEE |
| `POST /internal/comite/objeciones/:id/admision` `{ admitir, consideraciones? }` | SA, COMMITTEE |
| `POST /internal/comite/objeciones/:id/decision` `{ decision, consideraciones? }` | SA, COMMITTEE |
| `GET /internal/objections/:id/autos/:autoId` (PDF) | SA, ADMIN, EVALUATOR, COMMITTEE, SECRETARY |
| `GET /internal/candidates/:id/objeciones-descargo` (sólo admitidas) | SA, SECRETARY |
| `POST /internal/objections/:id/descargo` (multipart `title`, `description`, `file?`) | SA, SECRETARY |
| `GET /internal/objections/:id/descargo/archivo` | SA, ADMIN, EVALUATOR, COMMITTEE, SECRETARY |
| `GET /applicant/objeciones`, `POST /applicant/objeciones/:id/descargo`, `GET /applicant/objeciones/:id/autos/:autoId` | APPLICANT |

## 3. Configuración del proceso (`/configuracion`, sólo SA)

| Ajuste | Quién lo cambia | Efecto |
|---|---|---|
| `applicationsClosed` | SA | Sin expedientes nuevos ni primer envío (secretaría y portal). Los devueltos sí se reenvían |
| `viewerObjectionsOpen` | SA, ADMIN | Los visualizadores ven «Objetar» en el ranking interno |
| `objectionsOpen` | SA | Objeciones públicas desde la landing |
| `publicRefreshEnabled` | SA | ADMIN y evaluadores ven «Actualizar en el ranking público» |
| `objectionPeriodStart`, `objectionPeriodDays`, `objectionBusinessDays`, `admissionDays`, `descargoDays`, `verificationDays`, `holidays` | SA | Calendario del proceso |

Al cerrar las postulaciones se calcula el **calendario**: lapso de objeciones desde el día hábil
siguiente (15 días hábiles por defecto; la ley dice continuos y se puede cambiar), admisión,
descargos y comprobación estimados. Alargar un periodo es cambiar sus días y guardar. El ADMIN
conserva en `/ranking` el interruptor de los visualizadores.

Enviar postulantes del ranking interno al público (`POST /internal/publications/ranking/enviar`):
solo SA.

## 4. Objeciones del visualizador

- **«Mis objeciones»** (ficha del postulante en el ranking):
  - Cada objeción tiene «Descargar PDF».
  - Es el mismo documento de denuncia que se adjunta al acuse, con la plantilla de la denuncia ciudadana.
  - El formulario de objeción pide la cédula de quien objeta (V/E y dígitos) antes de las causales, y el PDF la muestra.
  - Ruta: `GET /internal/objections/mine/:trackingCode/pdf`, solo `VIEWER`. Una objeción ajena responde `404`.
- **Evaluadores** («Ver objeciones»):
  - La objeción de un visualizador muestra «Presentada por **Nombre** (visualizador)».
  - La del ciudadano de la landing sigue «Ciudadano (identidad reservada)».
  - El nombre viaja en `submittedBy` en la bandeja y el resumen.
