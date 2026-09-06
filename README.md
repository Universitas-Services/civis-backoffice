# civis-backoffice

Panel interno del **Consejo Independiente de Verificación (CIVIS)**:
secretaría, evaluación, publicación y auditoría. Acceso restringido; **nunca
debe indexarse**.

| Repositorio | Qué es | Puerto local |
|---|---|---|
| [civis-api](https://github.com/Universitas-Services/civis-api) | API — única fuente de verdad | 3001 |
| [civis-landing](https://github.com/Universitas-Services/civis-landing) | Sitio público | 3000 |
| **civis-backoffice** (este) | Panel interno | 3002 |

## Arrancar

La API debe estar en marcha primero.

```bash
cp .env.example .env.local
# genere SESSION_SECRET:  openssl rand -base64 32
pnpm install
pnpm dev            # http://localhost:3002
```

Credenciales de demostración: las imprime `pnpm db:seed` en el proyecto de la
API. Son ficticias.

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript 6 ·
Tailwind CSS 4 · jose (cifrado de sesión) · Zod 4 · Playwright.

## Cómo está resuelta la sesión

El token de acceso de la API se guarda **cifrado** dentro de una cookie
HttpOnly y **nunca llega al JavaScript del navegador**: todas las llamadas
salen del servidor de Next. Un XSS en el panel no entrega la sesión.

`src/lib/api.ts` lleva `import "server-only"`: si alguien lo importa desde un
componente cliente, la compilación falla. **No lo quite.**

`proxy.ts` sólo comprueba que la cookie exista; no la descifra, porque corre en
el edge runtime. El permiso por rol lo comprueba cada página con `exigirRol`,
no el layout: Next renderiza layout y página en paralelo, y una decisión
tomada en el layout llega tarde.

**La autorización real la hace la API en cada llamada.** Ocultar un enlace del
menú es comodidad, no seguridad.

## Pantallas

Expedientes y wizard de carga (secretaría) · bandeja y evaluación a dos
columnas con visor de PDF (evaluación) · objeciones · ranking interno · cola de
publicación · usuarios con interruptor de suspensión · bitácora con exportación
a CSV (administración).

## Reglas que la interfaz no puede contradecir

1. Nunca envíe un total: se capturan valores por criterio y el servidor calcula.
2. Quien prepara no aprueba.
3. La justificación es obligatoria cuando un puntaje no es cero o cambia.
4. Publicar y retirar exigen motivo.
5. Una objeción no cambia un puntaje: aprobar el ajuste es otro paso.
6. Nada se borra.

La guía completa está en `.claude/skills/front-interno-civis/`.

## Comprobar

```bash
pnpm validate    # formato + lint + tipos + pruebas
pnpm test:e2e    # Playwright, requiere API y landing en marcha
pnpm build
```


## Documentación del sistema

La documentación transversal vive en
[civis-api/docs](https://github.com/Universitas-Services/civis-api/tree/main/docs).
