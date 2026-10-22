# CIVIS — Rol visualizador: consultar, opinar y objetar

Contrato entre el backoffice y `civis-api`. **Implementado** en `civis-api` (módulo `src/visualizadores/`, migración `20261022120000_visualizador`). Prefijo `/api/v1`. Auth: Bearer JWT de sesión, como el resto de `/internal/*`.

El visualizador **ve todo acerca de un postulante**, pero sus **únicas acciones son opinar y objetar**. El `RolesGuard` exige que cada ruta liste sus roles, así que `VIEWER` no hereda nada: sólo escribe en las dos rutas `POST` de abajo.

## Contexto

La landing pública ya no está desplegada. **No se borra nada de `/public/*`**: puede volver a usarse.

Quienes consultan el ranking son ahora los **visualizadores**, en lo legal diputados registrados en el sistema. Entran al backoffice con usuario y contraseña, ven los postulantes y el ranking interno, y desde la ficha de cada postulante en el ranking pueden:

- **Opinar:** un comentario. No cambia nada del proceso. Lo ven todos los visualizadores y el equipo interno.
- **Objetar:** una objeción formal con las mismas causales que la denuncia de la landing. Llega a la bandeja de Objeciones como cualquier otra. **No pide código por correo**: el usuario ya está autenticado y su identidad sale de la sesión.

No hay lapso de objeciones: el visualizador puede objetar siempre. El panel ya no muestra el interruptor `objectionsOpen` ni ningún control para publicar en la landing.

---

## 1. Rol `VIEWER`

| Dónde | Cambio |
|---|---|
| `prisma/schema.prisma`, `enum Role` | Añadir `VIEWER`, con migración |
| `src/contracts/enums.ts`, `ROLES` | Añadir `"VIEWER"` |
| `users.service.ts` | Sin cambios: el ADMIN ya puede asignar todo menos `SUPER_ADMIN`, y el enum ya acepta `VIEWER` |
| `prisma/seed.ts` | Usuario de demostración `visualizador@demo.local` |

El panel muestra el rol como «Visualizador» y lo ofrece al ADMIN al crear usuarios. **No** se añadió cédula al usuario: la objeción del visualizador guarda `objectorNationalId = null` y queda ligada a la cuenta por `submittedById`.

## 2. Permisos de lectura

Añadir `"VIEWER"` al `@Roles` de:

| Endpoint | Para qué |
|---|---|
| `GET /internal/ranking` | Ranking interno |
| `GET /internal/candidates` | Lista de expedientes |
| `GET /internal/candidates/:id` | Ficha del expediente, en solo lectura |
| `GET /internal/candidates/:id/history` | Historial del expediente |
| `GET /internal/documents/:id/download` | URL firmada para el visor de PDF |
| `GET /internal/documents/:id/content` | Contenido del documento |

Sin acceso a la bandeja `/internal/objections`, `/internal/evaluations`, `/internal/dashboard`, `/internal/users` ni `/internal/audit`. El visualizador ve la ficha completa del postulante, con datos de contacto y notas internas.

## 3. Opiniones

### Modelo

```prisma
model CandidateOpinion {
  id          String   @id @default(uuid()) @db.Uuid
  candidateId String   @db.Uuid
  authorId    String   @db.Uuid
  body        String   @db.VarChar(2000)
  createdAt   DateTime @default(now())

  candidate Candidate @relation(fields: [candidateId], references: [id], onDelete: Restrict)
  author    User      @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@index([candidateId, createdAt])
}
```

**Nada se borra:** no hay endpoint de editar ni de eliminar.

### `GET /internal/candidates/:id/opinions`

Roles: `SUPER_ADMIN`, `ADMIN`, `EVALUATOR`, `VIEWER`. Orden cronológico ascendente.

```json
[
  {
    "id": "uuid",
    "body": "Tiene una trayectoria sólida en derecho constitucional.",
    "createdAt": "2026-10-21T14:05:00.000Z",
    "author": { "fullName": "Dip. Ana Pérez" }
  }
]
```

Si el postulante no existe, `404`. Sin opiniones, `[]`.

### `POST /internal/candidates/:id/opinions`

Rol: sólo `VIEWER`.

```json
{ "body": "Texto de la opinión" }
```

- **Validación:** `body` con `trim`, de 10 a 2000 caracteres. El panel valida lo mismo con `opinionSchema`; manda la del servidor.
- **Respuesta:** `201` con la opinión creada, en el mismo formato que el `GET`.
- **Bitácora:** nueva acción `candidate.opinion_created` sobre la entidad `Candidate` con id `:id`.

### Contador en el ranking

Cada entrada de `GET /internal/ranking` lleva `opinionCount: number`. Es opcional para el panel: si no viene, muestra «—».

## 4. Objeción de visualizador

### `POST /internal/candidates/:id/objections`

Rol: sólo `VIEWER`. `:id` es el **id interno** del postulante, no `publicId`.

```json
{
  "causes": ["POLITICAL_MILITANCY", "OTHER"],
  "otherCause": "Texto si marcó OTHER",
  "description": "Hechos, mínimo 50 caracteres…",
  "evidenceUrl": "https://…"
}
```

**Validación:** las mismas reglas que `createObjectionSchema` para `causes`, `otherCause`, `description` y `evidenceUrl`. `OTHER` exige `otherCause`. **Sin** `objectorFullName`, `objectorNationalId`, `objectorEmail`, `verificationCode`, `privacyConsent`, `website` ni `captchaToken`.

**Qué hace el servidor:**

1. **Sin** `exigirLapsoAbierto()`: no hay lapso para esta ruta. La ruta pública sigue igual.
2. Exige que el postulante esté en el ranking interno: una evaluación `APPROVED` vigente que no sea `ineligible`. Si no, `400` con mensaje para el operador. Ya **no** se exige `publicationStatus === "PUBLISHED"`.
3. Crea la `Objection` igual que `PublicService.createObjection`, con estos datos:
   - `objectorFullName` = `user.fullName`
   - `objectorEmail` = `user.email`
   - `objectorNationalId` = `null` (en el PDF del acuse: «No registrada»)
   - `emailVerifiedAt` = ahora, porque el usuario está autenticado
   - `privacyConsentAt` = ahora
   - `submittedIp` = `ctx.ip`
   - **nuevo** `submittedById` = `user.id`, con FK a `User` y `onDelete: Restrict`
   - `category` = `categoriaDeCausas(causes)`, como hoy
4. Acuse por correo con el PDF (`pdfDenuncia`, `correoAcuse`) a `user.email` y el respaldo a `DENUNCIA_BACKUP_EMAIL`, como en la pública. Las dos rutas comparten `PublicService.registrarObjecion`. Aquí **un fallo del correo no borra la objeción** (sólo se registra un aviso): la identidad no depende del correo. La pública sigue borrándola, como antes.
5. Bitácora: `objection.received`, con `newValue: { category, causes, candidateId, viaVisualizador: true }`.

**Respuesta `201`:**

```json
{ "trackingCode": "OBJ-XXXX", "status": "RECEIVED", "receivedAt": "2026-10-21T14:10:00.000Z" }
```

El panel muestra el `trackingCode` al terminar.

La objeción entra en `GET /internal/objections` y en la ronda de objeción del comité **sin cambios**: es una `Objection` normal. Por sí sola no cambia el puntaje.

### `GET /internal/objections/mine?candidateId=<uuid>`

Rol: sólo `VIEWER`. Las objeciones que presentó **este usuario** (`submittedById`) contra ese postulante. Sin `candidateId`, todas las suyas.

```json
[
  { "trackingCode": "OBJ-XXXX", "receivedAt": "2026-10-21T14:10:00.000Z", "publicStatus": "RECEIVED" }
]
```

`publicStatus` es uno de `RECEIVED`, `UNDER_REVIEW`, `RESOLVED` o `CLOSED`. No devolver datos de terceros.

## 5. Lo que no cambia

- Todo `/public/*` se queda: ranking público, fichas, `POST /public/objections/codigo`, `POST /public/candidates/:publicId/objections`, `GET /public/portal` y `PATCH /internal/portal`, con `objectionsOpen`.
- Los endpoints de publicación (`/internal/publications/*`, `/internal/reports/:id/publish`) se quedan. El panel ya no los llama.
- **Mensajes de error:** un `403` no debe nombrar el rol reservado `SUPER_ADMIN`. El `RolesGuard` ya lo filtra; en las validaciones nuevas, no escribir el nombre del rol en el mensaje.

## 6. Qué hace el panel hoy (para probar)

| Pantalla | `VIEWER` | Equipo interno |
|---|---|---|
| Menú | Sólo «Expedientes» y «Ranking interno». Entra a `/ranking` | Sin cambios |
| `/ranking` | Lista sin botones de publicar; por fila, «Opinar» y «Objetar» | Lista sin botones de publicar; «Ver opiniones» |
| `/ranking/[candidateId]` | Hilo de opiniones, formulario para opinar, formulario de objeción con confirmación y «Mis objeciones» | Hilo de opiniones (lectura) |
| `/expedientes/[id]` | Todo el expediente en solo lectura; el conteo de objeciones va sin enlace | Sin cambios (sale la insignia de «Publicación») |
| `/objeciones` | Sin acceso | Sin el interruptor del lapso |
| `/informes` | Sin acceso | Genera y descarga; ya no «Aprueba y publica» |

Mientras estos endpoints no existan, el panel responde con «Esta función todavía no está disponible en el servidor» en lugar de romper la pantalla. Lo hace con los `404`, y en las dos listas también con los `403`.
