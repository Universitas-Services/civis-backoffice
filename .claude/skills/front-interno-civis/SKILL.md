---
name: front-interno-civis
description: Convenciones del panel interno (backoffice) de la plataforma de verificación de credenciales. Úsala SIEMPRE que se toque este proyecto - una pantalla, un componente, la sesión, una Server Action, la navegación por rol o cualquier llamada a la API. Actívala aunque solo digan "añade esta vista", "muestra este dato", "arregla el login" o "que se vea mejor". Cubre el manejo de sesión sin exponer el token al navegador, la navegación filtrada por rol, el sistema de diseño para herramienta de trabajo, y las reglas de negocio que la interfaz nunca debe contradecir.
---

# Panel interno — Consejo Independiente de Verificación de Credenciales

Herramienta de trabajo para secretaría, evaluación, publicación y
administración. No es un sitio de consulta: es donde se opera el proceso.

> **La identidad de este proyecto es propia.** El estándar de entrega de Mia
> Services **no aplica aquí**: esta plataforma es del Consejo Independiente y
> usa la paleta Neutral Judicial. Si otra skill de marca se activa, esta la
> reemplaza para todo lo visible de este proyecto.

## Sesión — cómo está resuelto y por qué

- El token de acceso de la API se guarda **cifrado** (`jose`, A256GCM) dentro
  de una cookie HttpOnly. **Nunca llega al JavaScript del navegador**: un XSS
  en el panel no entrega la sesión.
- Todas las llamadas a la API salen del **servidor** de Next, vía
  `llamarApi()` en `src/lib/api.ts`. Ese módulo lleva `import "server-only"`:
  si alguien lo importa desde un componente cliente, la compilación falla.
  **No lo quites.**
- `proxy.ts` sólo comprueba que la cookie **exista**; no la descifra, porque
  corre en el edge runtime y llevar el secreto allí sería peor. Sirve para
  evitar el parpadeo de cargar una pantalla y redirigir después.
- **La autorización real la hace la API**, en cada llamada. Ocultar un enlace
  del menú es comodidad, no seguridad.

## Navegación y roles

`components/barra-lateral.tsx` filtra las secciones por rol. Al añadir una
sección nueva, declara sus roles ahí **y** asegúrate de que el endpoint
correspondiente tenga su `@Roles()` en la API. Si sólo lo haces en un sitio,
lo has hecho mal.

Roles: `SUPER_ADMIN`, `SECRETARY`, `EVALUATOR`, `PUBLISHER`. Una persona puede
tener varios; la bitácora registra cuál se usó en cada acción.

## Reglas que la interfaz nunca debe contradecir

Si una pantalla sugiere lo contrario de esto, la pantalla está mal:

1. **Nunca envíes un total.** En la pantalla de evaluación se capturan valores
   por criterio; el total lo devuelve el servidor. No lo calcules en el
   cliente ni siquiera "para mostrarlo mientras tanto" sin dejar clarísimo
   que es provisional.
2. **Quien prepara no aprueba.** La ficha de la cola de publicación desactiva
   el formulario cuando el snapshot lo preparó el propio usuario, y explica
   por qué. No lo "arregles" habilitándolo.
3. **La justificación es obligatoria** cuando un puntaje no es cero o cambia.
4. **Publicar y retirar exigen motivo.** Nunca ofrezcas un atajo sin él.
5. **Una objeción no cambia un puntaje.** La interfaz de resolución propone un
   ajuste; aprobarlo es otro paso, de otra persona.
6. **Nada se borra.** No añadas botones de eliminar expedientes, evaluaciones
   u objeciones.

## Diseño — es una herramienta, no una vitrina

Misma paleta y tipografía que la landing (ver la skill `front-publico-civis`
para los tokens completos), pero con densidad de herramienta:

- Barra lateral en `toga-900`, con el elemento activo marcado por una barra
  de `balanza-600` a la izquierda **y** fondo más claro — nunca sólo color.
- Más densidad que la landing, pero **16px sigue siendo el suelo** del texto
  corrido. Los metadatos (fechas, hashes, contadores) pueden ir a 12–14px.
- Las cifras comparables llevan `.cifra` (`tabular-nums`).
- Los hashes y códigos llevan `.codigo` (IBM Plex Mono, sin ligaduras): hay
  que poder transcribirlos sin confundir `0` con `O`.
- Toda acción destructiva o irreversible pide confirmación con contexto
  concreto ("¿Confirma la publicación del perfil con puntaje 85?"), no un
  "¿Está seguro?" genérico.
- Estados vacíos que expliquen qué falta para que aparezca algo.

## Responsive

El panel se usa sobre todo en escritorio, pero debe ser utilizable en tableta
y teléfono — un evaluador puede necesitar consultar algo fuera de la oficina.

- La barra lateral pasa a fila horizontal desplazable por debajo de `md`.
- Las tablas de datos siguen el mismo patrón que la landing: **tarjetas por
  debajo del punto de quiebre, tabla por encima**. Nunca scroll horizontal de
  página.
- La pantalla de evaluación a dos columnas (visor de PDF + baremo) se apila en
  vertical por debajo de `lg`.

## Formularios

- Server Actions con `useActionState`; el estado de envío con `useFormStatus`.
- Se valida con los esquemas de `src/contracts/` — los mismos que la API — y
  **la validación que manda es la del servidor**.
- Los errores de la API se muestran tal cual llegan: son mensajes pensados
  para el operador, y así existe una sola redacción de cada regla.

## Antes de dar algo por terminado

```bash
pnpm validate    # formato + lint + typecheck + pruebas
pnpm build
```
