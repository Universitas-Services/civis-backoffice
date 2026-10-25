# CIVIS — Autopostulación, comité de objeciones y PDF del visualizador

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

## 2. Comité y descargos

Toda objeción llega primero al **comité** (rol `COMMITTEE`), no al Consejo (los evaluadores activos).

1. **Recibida:** el postulante con cuenta recibe un correo y la ve en «Objeciones». Si el
   expediente lo creó la secretaría, ella lo ve en el expediente y contacta al postulante.
2. **Descargo:** título, descripción y un documento opcional (PDF, JPEG o PNG). Uno por objeción;
   no se edita. Lo presenta el postulante con cuenta, o la secretaría si no tiene cuenta.
   Ni el postulante ni la secretaría ven quién presentó la objeción.
3. **Envío al Consejo:** el comité la envía cuando hay descargo. **Sin descargo también puede
   enviarla, pero con un motivo obligatorio** (≥10 caracteres) que el Consejo ve junto a la objeción.
4. **Consejo:** su bandeja, el resumen, las rondas de objeción y la inelegibilidad solo consideran
   objeciones enviadas (`forwardedAt`). Desde ahí, el flujo es el mismo de siempre.

| Ruta | Roles |
|---|---|
| `GET /internal/comite/objeciones?etapa=&page=` | SA, COMMITTEE |
| `GET /internal/comite/objeciones/:id` (identidad del objetante; se audita) | SA, COMMITTEE |
| `POST /internal/comite/objeciones/:id/enviar-consejo` `{ motivo? }` | SA, COMMITTEE |
| `GET /internal/candidates/:id/objeciones-descargo` | SA, SECRETARY |
| `POST /internal/objections/:id/descargo` (multipart `title`, `description`, `file?`) | SA, SECRETARY |
| `GET /internal/objections/:id/descargo/archivo` | SA, ADMIN, EVALUATOR, COMMITTEE, SECRETARY |
| `GET /applicant/objeciones`, `POST /applicant/objeciones/:id/descargo` | APPLICANT |

## 3. Interruptores del portal (`PATCH /internal/portal`, `GET /internal/portal`)

| Ajuste | Quién lo cambia | Efecto |
|---|---|---|
| `viewerObjectionsOpen` | SA, ADMIN | Los visualizadores ven «Objetar» en el ranking interno |
| `objectionsOpen` | SA | Objeciones públicas desde la landing |
| `publicRefreshEnabled` | SA | ADMIN y evaluadores ven «Actualizar en el ranking público» |

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
