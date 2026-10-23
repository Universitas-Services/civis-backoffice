# CIVIS — Autopostulación y PDF de objeciones del visualizador

Contrato entre el backoffice y `civis-api`. Implementado en `civis-api/src/postulaciones/` (migración `20261023120000_autopostulacion`) y en las páginas públicas `/postulacion/*` del panel. Prefijo `/api/v1`.

## 1. Autopostulación

El postulante se registra sin pasar por la secretaría, desde la pantalla de ingreso («Postularme»).

### Flujo

1. **Datos:** nombre, apellido, cédula (V/E), sala y **teléfono venezolano**.
2. **Comprobante:** el número de expediente (`EXP-0010`, de referencia) y el **código de acceso** secreto `CIVIS-XXXX-XXXX-XXXX`.
   - El código se muestra **una sola vez**: hay que copiarlo o descargar el comprobante (.txt).
   - «Continuar» se habilita tras marcar «Ya guardé mi código».
3. **Carga de documentos:** el mismo listado que usa la secretaría.
   - «Salir» cierra la postulación en ese navegador.
   - «Reanudar mi postulación» vuelve a entrar con el código.
4. **Envío a revisión:**
   - El postulante escribe un correo y recibe un código de 6 dígitos, válido 10 minutos. A los 5 intentos fallidos deja de valer.
   - Al confirmarlo, el expediente pasa a revisión documental y le llega un correo de confirmación con el número de expediente y el código de consulta.
5. **Después del envío:** con el código solo se **consulta** la etapa y los documentos enviados. Aunque la revisión lo devuelva, el postulante ya no puede cargar documentos.
   - **Si la revisora lo devuelve:** vuelve a borrador como siempre. La secretaría ve el aviso «Autopostulación devuelta: contacte al postulante», con su teléfono y su correo, y hace las correcciones.

### Teléfono

Formato nacional de 11 dígitos: `0` + código + 7 dígitos.

| Tipo | Códigos |
|---|---|
| Móviles | 0412 y 0422 (Digitel), 0414 y 0424 (Movistar), 0416 y 0426 (Movilnet) |
| Fijos | 02XX |

- El campo solo admite números.
- Si se pega `+58 414…`, se convierte a `0414…`.
- Se guarda como `04141234567`.

### Seguridad
- **Código de acceso:**
  - Unos 59 bits de azar, en Crockford base32 (sin 0/O/1/I/L/U).
  - En la base solo queda su **SHA-256**, que además se omite de todas las respuestas de la API.
- **El código nunca va en la URL:**
  - El panel lo guarda cifrado en la cookie HttpOnly `cp_postulacion`, que dura 7 días.
  - Desde el servidor de Next se envía en la cabecera `X-Codigo-Postulacion`.
- **Código del correo:**
  - Va ligado a la postulación (`purpose: POSTULACION`, `candidateId`); un código de denuncia no sirve aquí.
- **Límites por IP:** `RATE_LIMIT_POSTULACION_PER_HOUR` (5 por defecto) para las altas y los códigos por correo.
- **Campo trampa:** honeypot `website`.
- **Subidas:** mismas validaciones que la secretaría (tipo real, antivirus, tamaño y número de archivos). Solo se aceptan en un expediente de origen `AUTOPOSTULACION`, en borrador y nunca enviado.

### API (`@Public`)

| Ruta | Cuerpo / cabecera | Respuesta |
|---|---|---|
| `POST /public/postulaciones` | `{ firstName, lastName, nationalId, chamber, phone, website? }` | `{ fileNumber, accessCode, fullName }` · `409` si la cédula ya tiene expediente |
| `GET /public/postulaciones/actual` | cabecera con el código | etapa, sala, documentos vigentes, `puedeCargar` |
| `POST /public/postulaciones/documentos` | multipart `category`, `replaces?`, `file` + cabecera | documento creado |
| `POST /public/postulaciones/codigo-correo` | `{ email }` + cabecera | `{ enviado: true }` · exige al menos un documento |
| `POST /public/postulaciones/enviar` | `{ email, codigoCorreo }` + cabecera | estado actualizado |

### Modelo
- **`Candidate`:** se añaden `origin` (`SECRETARIA` | `AUTOPOSTULACION`), `accessCodeHash` y `selfSubmittedAt`.
- **`Submission.uploadedById` y `Document.uploadedById`** pasan a ser opcionales: el postulante no es un usuario del sistema.
- **`EmailVerification`:** se añaden `purpose`, `candidateId` y `attempts`.

## 2. Objeciones del visualizador

- **«Mis objeciones»** (ficha del postulante en el ranking):
  - Cada objeción tiene «Descargar PDF».
  - Es el mismo documento de denuncia que se adjunta al acuse, con la plantilla de la denuncia ciudadana.
  - El formulario de objeción pide la cédula de quien objeta (V/E y dígitos) antes de las causales, y el PDF la muestra.
  - Ruta: `GET /internal/objections/mine/:trackingCode/pdf`, solo `VIEWER`. Una objeción ajena responde `404`.
- **Evaluadores** («Ver objeciones»):
  - La objeción de un visualizador muestra «Presentada por **Nombre** (visualizador)».
  - La del ciudadano de la landing sigue «Ciudadano (identidad reservada)».
  - El nombre viaja en `submittedBy` en la bandeja y el resumen.
