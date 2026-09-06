# Backoffice — panel interno

Herramienta de trabajo del proceso. Uno de tres proyectos independientes:

| Carpeta      | Qué es                                                        | Puerto |
| ------------ | ------------------------------------------------------------- | ------ |
| `../api`     | Backend NestJS. Única fuente de verdad                        | 3001   |
| `../landing` | Front público de veeduría ciudadana                           | 3000   |
| `.` (este)   | Panel interno: secretaría, evaluación, publicación, auditoría | 3002   |

No son un monorepo: cada uno tiene su `package.json` y su despliegue.

## Arrancar

```bash
cd ../api && pnpm infra:up && pnpm dev   # la API debe estar arriba
pnpm install && pnpm dev                 # este panel, en :3002
```

Copia `.env.example` a `.env.local` y **cambia `SESSION_SECRET`**: la
aplicación se niega a arrancar la sesión si sigue el valor de ejemplo.

Credenciales de demostración: las imprime `pnpm db:seed` en el proyecto de la
API. Son ficticias.

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript 6 ·
Tailwind CSS 4 · jose (cifrado de sesión) · Zod 4 · Vitest 5 · pnpm 12 · Node 24.

TypeScript se mantiene en **6.0.3 a propósito**: `typescript-eslint` declara
`typescript <6.1.0`, así que TypeScript 7 rompería el linter con tipos.

## Antes de tocar nada

Lee la skill `front-interno-civis` (en `.claude/skills/`). Explica cómo está
resuelta la sesión —el token **nunca** llega al navegador— y las seis reglas
de negocio que la interfaz no puede contradecir.

## Comprobación

```bash
pnpm validate
pnpm build
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
