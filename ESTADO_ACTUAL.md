# ESTADO_ACTUAL.md — Super Sam La Victoria

> **Propósito de este documento:** servir de fuente de verdad del estado real del proyecto (auditoría capa por capa, en tiempo real) y del plan de continuación por sprints. Está escrito para que **Grok** redacte las instrucciones de ejecución, y para que **Nemotron** las ejecute. Todo dato aquí está verificado contra el repositorio y los comandos reales indicados.
>
> **Cómo usarlo:** Grok debe leer este documento completo y producir, para cada sprint, instrucciones atómicas y verificables (archivo por archivo, comandos exactos, criterios de aceptación). No debe rediseñar lo ya hecho ni inventar reglas de negocio. Las decisiones de negocio confirmadas y las pendientes están en la sección 8.

- **Fecha de auditoría:** 2026-10-19
- **Rama:** `main` · **Remoto:** `origin https://github.com/UnethicalCapt/super-sam-la-victoria.git`
- **Últimos commits:** `324544d` baseline (Sprint 0) · `a8ba6a5` Sprint 1 (arquitectura SOLID)
- **Working tree:** limpio salvo `supabase/migrations/007_payment_weeks.sql` y `008_updated_at_trigger.sql` (sin commitear).

---

## 1. Resumen ejecutivo

El proyecto es una **PWA React + Vite + TypeScript + Tailwind + Supabase** para gestionar el san de motos. La **arquitectura interna está bien separada** (capa de servicios, componentes de dominio, utilidades) y **compila, lintea, testea y construye** sin errores. La PWA se genera correctamente (`manifest.webmanifest`, `sw.js`).

Sin embargo, el estado real está a mitad de camino entre “maqueta funcional” y “producto operable”. Los tres problemas más graves son:

1. **Deriva de esquema (CRÍTICO):** el código usa columnas de `profiles` (`first_name`, `last_name`, `address`, `birth_date`, `gender`) que **ninguna migración crea**. Registro y edición de perfil dependen de ellas. No hay reproducibilidad de la base desde el repositorio.
2. **Panel de administración parcialmente roto:** la búsqueda por cédula es imposible (busca por `id`), la vista de pagos de un usuario no carga (lee query param en vez de ruta), y **los comprobantes nunca se pueden ver** ( URLs firmadas no implementadas sobre un bucket privado).
3. **Funciones de negocio sin implementar:** tema claro/oscuro, cuota semanal, edición de participantes, compresión de subida, notificaciones push, config de semanas, sorteo/ganador.

Además, el **Supabase CLI no es viable** en el equipo del responsable (no descarga binarios); se definió un “Plan B” con un runner en Node (`Instructions/Instructions18.md`). Ninguna migración posterior a `003` está confirmada en remoto.

**Veredicto:** base sólida; se requiere un sprint de **corrección crítica + reproducibilidad de datos** antes de continuar con los sprints de producto.

---

## 2. Stack, entorno y configuración

| Elemento | Valor / Estado | Evidencia |
|---|---|---|
| Framework | React 18 + TypeScript 5.9 + Vite 4.5 | `package.json` |
| Estilos | Tailwind 3.3 (sin `darkMode`) | `tailwind.config.js` |
| Router | react-router-dom 6 | `src/App.tsx` |
| Backend | Supabase (`@supabase/supabase-js` 2.x) | `src/lib/supabase.ts` |
| PWA | `vite-plugin-pwa` 0.14, `generateSW`, autoUpdate | `vite.config.ts` |
| Tests | Vitest + jsdom + testing-library (1 test placeholder) | `vitest.config.ts`, `src/lib/__tests__/format.test.ts` |
| Calidad | ESLint 8 + Prettier 3 (0 errores, 18 warnings `any`) | `.eslintrc.cjs` |
| Node / npm | v24.21.0 / 11.19.0 | verificado |
| `.env` | existe (no impreso) | `Test-Path .env` = True |
| `supabase/config.toml` | **no existe** (CLI nunca inicializado) | verificado |
| `vite.config.js` | no existe (correcto) | verificado |
| `package.json` type | `"module"` | `package.json:6` |

**Deploy objetivo:** Cloudflare Pages (`npm run build` → `dist`), variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. SPA fallback listo en `public/_redirects`. No hay `public/_headers` (pendiente menor de seguridad en Sprint 8).

---

## 3. Arquitectura por capas

```
src/
├── main.tsx                      Entrada: StrictMode > AuthProvider > ErrorBoundary > App
├── App.tsx                       Rutas (público / usuario / admin / 404) + loading global
├── index.css                     Solo @tailwind (sin tokens de tema)
├── vite-env.d.ts                 Tipos de Vite
├── lib/                          ── Capa de utilidades / infraestructura base ──
│   ├── supabase.ts               Cliente Supabase (SIN tipar con Database)
│   ├── constants.ts              PAYMENT_METHODS, PAYMENT_STATUS, APP_LIMITS, WEEKLY_AMOUNT_USD
│   ├── errors.ts                 toUserMessage(err) → mensajes en español
│   ├── cedula.ts                 normalizeCedula, isValidCedulaLength (POCO USADO)
│   └── format.ts                 formatDate, formatDateTime, formatCurrencyUSD (es-VE)
├── services/                     ── Capa de acceso a datos (única que usará Supabase, según plan) ──
│   ├── authService.ts            signUp/signIn/signOut/getSession/getUser/updatePassword/resetPassword
│   ├── paymentsService.ts        insert/updateStatus/getByUser/getPending/countByStatus
│   ├── profilesService.ts        getById/update/getAll
│   └── storageService.ts         createSignedUrls (sin uso) / uploadProof
├── contexts/
│   └── AuthContext.tsx           Sesión + perfil + isAdmin; importa supabase DIRECTAMENTE
├── hooks/
│   ├── useProfile.ts             Re-exporta useAuth
│   └── useSignedUrls.ts          Duplicado de storageService (sin uso)
├── components/
│   ├── auth/                     ProtectedRoute, AdminRoute
│   ├── layout/                   UserLayout, AdminLayout, AppHeader, AccountMenu
│   ├── payments/PaymentCard.tsx
│   ├── ui/                       Button, LinkButton (roto), Field, StatusBadge, MetricCard, Skeleton, Toast
│   └── ErrorBoundary.tsx
├── pages/
│   ├── auth/                     Login, Register
│   ├── dashboard/                UserHome, UploadPayment, MyPayments, Profile, ChangePassword
│   ├── admin/                    AdminDashboard, AdminSearch, AdminParticipants, AdminUserPayments
│   └── NotFound.tsx
├── types/database.ts             Interfaces hechas a mano (NO usadas por el cliente)
└── test/setup.ts
```

### Clasificación de la lógica de infraestructura

| Dominio | Dónde vive | Estado | Observación |
|---|---|---|---|
| Cliente Supabase | `src/lib/supabase.ts` | Implementado | **No tipado** con `Database`; no valida esquema |
| Autenticación | `services/authService.ts` + `contexts/AuthContext.tsx` | Funcional con reservas | `AuthContext` accede a Supabase directo (rompe la regla SOLID) |
| Perfil / participantes | `services/profilesService.ts` | **Incompleto** | Faltan `adminUpdate` y `searchByCedula`; columnas inexistentes |
| Pagos | `services/paymentsService.ts` | Parcial | No asigna `week_number`; `countByStatus` cuenta en cliente |
| Storage (comprobantes) | `services/storageService.ts` + `hooks/useSignedUrls.ts` | **Roto/duplicado** | Bucket privado pero nunca se generan URLs firmadas en UI |
| Esquema DB / RLS | `supabase/migrations/001..008` | Parcial | 004–008 no confirmadas en remoto; falta migración de columnas de perfil |
| Semanas de pago | `supabase/migrations/007` (archivo) | **No aplicado** | Sin UI, sin `week_number` asignado, sin config admin |
| Notificaciones push | (no existe) | **No implementado** | Sin migración 009, sin `sw.ts`, sin Edge Function |
| Tema claro/oscuro | (no existe) | **No implementado** | Todo hardcodeado a modo oscuro (`bg-gray-9xx`) |
| PWA | `vite.config.ts`, `public/_redirects` | Funcional | Genera SW; mejorar offline/headers en Sprint 8 |

---

## 4. Procesos actuales (flujo real de código)

### 4.1 Registro (`src/pages/auth/Register.tsx`)
1. Valida en cliente (nombre, apellido, cédula 6–12, teléfono, email regex, password ≥ 6, fecha de nacimiento).
2. `authService.signUp()` con `options.data = { full_name, cedula }` → el trigger `handle_new_user()` crea la fila en `profiles`.
3. **`authService.signIn()` inmediato** (depende de que la confirmación de email esté DESACTIVADA).
4. `profilesService.update()` con `first_name, last_name, full_name, birth_date, gender, phone, cedula`.
5. Navega a `/`.
- **Problema:** el paso 4 escribe columnas que no existen en las migraciones (deriva de esquema, C-01). Si `signIn` falla (email sin confirmar), queda un usuario huérfano en `auth.users` sin sesión.

### 4.2 Login + recuperación (`Login.tsx`)
- `signIn` → `profilesService.getById(user.id)` → redirige a `/admin` o `/app`.
- “¿Olvidaste tu contraseña?” llama `authService.resetPassword(email, origin + '/login')` y muestra un mensaje inline en el campo de error.
- **Problema:** no existe ruta ni página `/reset-password` que consuma la sesión de recuperación; el enlace de Supabase aterriza en `/login`. Recuperación **incompleta** (C-04).

### 4.3 Subida de comprobante (`UploadPayment.tsx`)
1. Input file (acepta jpeg/png, límite 1 MB, sin compresión ni preview).
2. `storageService.uploadProof('{user.id}/{timestamp}-{nombre}', file)` a bucket privado `payment-proofs`.
3. `paymentsService.insert({ amount: 100, method, proof_url: path, status: 'pending' })` (**sin `week_number`**).
4. Toast + `window.location.href = '/app/my-payments'`.
- **Problema:** no comprime (decisión de negocio: siempre optimizar), sin preview, sin progreso, sin `week_number` (C-08, C-09).

### 4.4 Mis pagos (`MyPayments.tsx`) y tarjeta (`PaymentCard.tsx`)
- Lista pagos del usuario y renderiza `PaymentCard`.
- El enlace “Ver comprobante” usa `proof_url` **como href directo**; el bucket es privado → **enlace roto** (C-03).

### 4.5 Revisión admin (`AdminUserPayments.tsx`)
- `useEffect` lee `new URLSearchParams(window.location.search).get('userId')`.
- La ruta real es `/admin/user/:userId/payments` y la navegación usa `window.location.href = '/admin/user/{id}/payments'` → **no hay query string** → `userId` siempre `null` → **no carga ningún pago** (C-02).
- El comprobante también se enlaza como `proof_url` directo (roto, C-03).
- Aprobar/rechazar actualiza `status, reviewed_by, reviewed_at, notes` (esta parte sí es correcta con RLS de 004).

### 4.6 Búsqueda admin por cédula (`AdminSearch.tsx`)
- `profilesService.getById(normalized)` donde `normalized` es una **cédula**, pero `getById` filtra `.eq('id', ...)` (UUID). **Nunca encuentra resultados; error de UUID inválido** (C-02b).

### 4.7 Participantes (`AdminParticipants.tsx`)
- `profilesService.getAll()` (RLS de admin permite ver todos) y filtrado en cliente por nombre/cédula. Funciona, pero:
  - Sin botón “Editar” ni marcar ganador (Sprint 4 pendiente).
  - Sin paginación; en móvil la tabla puede desbordar.

### 4.8 Dashboard admin (`AdminDashboard.tsx`)
- 5 consultas secuenciales (`getAll`, 3× `countByStatus`, `getPending`).
- `getPending` no hace join con `profiles`, así que `payment.profiles?.full_name` siempre es `undefined` → **nombre del participante nunca se muestra** (C-05).

---

## 5. Inventario de funciones inconclusas / rotas

Clasificación: **C = crítico**, **A = alto**, **M = medio**, **B = bajo**.

| ID | Sev | Función | Evidencia | Detalle |
|---|---|---|---|---|
| C-01 | C | Columnas de perfil inexistentes en migraciones | `AuthContext.tsx:54,85`, `profilesService.ts:6-11,22-27`, `Register.tsx:89-97`, `Profile.tsx:84-92`, `types/database.ts:3-7` | Código usa `first_name, last_name, address, birth_date, gender`; ninguna migración las crea |
| C-02 | C | Vista de pagos por usuario no carga | `AdminUserPayments.tsx:15-17` | Lee query param; la ruta usa path param |
| C-02b | C | Búsqueda por cédula imposible | `AdminSearch.tsx:22` | `getById(cedula)` compara UUID vs cédula |
| C-03 | C | Comprobantes nunca visibles | `PaymentCard.tsx:74`, `AdminUserPayments.tsx:117` | Bucket privado; se usa `proof_url` como href sin firmar |
| C-04 | A | Recuperación de contraseña incompleta | `Login.tsx:85`, `authService.resetPassword` | Sin página `/reset-password` |
| C-05 | M | Nombre de participante ausente en dashboard | `AdminDashboard.tsx:107` | Sin join/RPC `profiles` |
| C-06 | A | Política RLS admin de perfiles con posible recursión | `004_admin_helpers.sql:40-47` | Subconsulta a `profiles` en política de `profiles`; verificar/reemplazar |
| C-07 | A | Deriva de esquema no aplicada en remoto | `supabase/migrations/001..008` | 004–008 sin confirmar; sin runner de migraciones |
| C-08 | A | Subida sin compresión/preview/progreso | `UploadPayment.tsx` | Decisión de negocio: siempre optimizar |
| C-09 | A | `week_number` nunca asignado | `UploadPayment.tsx:61-67`, `paymentsService.insert` | Cuota semanal no operativa |
| C-10 | A | Tema claro/oscuro no implementado | `tailwind.config.js` (sin `darkMode`), clases `bg-gray-9xx` | Decisión de negocio confirmada |
| C-11 | A | Edición de participantes por admin ausente | `AdminParticipants.tsx` | Falta `adminUpdate`, modal, marcar ganador |
| C-12 | A | Config de semanas por admin ausente | no existe | Sprint 3.5 |
| C-13 | A | Push 1 día antes no implementado | no existe | Sprint 6 |
| C-14 | M | `AuthContext` y `useSignedUrls` importan `supabase` directo | `AuthContext.tsx:3`, `useSignedUrls.ts:2` | Rompe la regla “solo servicios” |
| C-15 | M | Duplicación de generación de signed URLs | `storageService.createSignedUrls` vs `useSignedUrls` | Dos implementaciones, ninguna usada |
| C-16 | M | Cliente Supabase sin tipar | `lib/supabase.ts:10` | Oculta errores de esquema en compile-time |
| C-17 | M | `countByStatus` cuenta en cliente | `paymentsService.ts:77-84` | Trae filas y hace `.length`; usar `head:true, count:'exact'` |
| C-18 | M | `LinkButton` roto | `LinkButton.tsx:20-27` | Pasa `asChild` a `Button` que no lo implementa; renderiza `<a>` dentro de `<button>` |
| C-19 | M | Fragmento sin `key` en `AccountMenu` | `AccountMenu.tsx:73` | `<>{...}</>` dentro de `.map`; warning de React |
| C-20 | M | Loading sin estilos | `App.tsx:24`, `ProtectedRoute.tsx:9`, `AdminRoute.tsx:12` | `<div>Cargando...</div>` |
| C-21 | B | `AppHeader` enlaza siempre a `/app` | `AppHeader.tsx:11` | Admin también va a `/app` |
| C-22 | B | Código muerto / deps sin uso | `Button`, `Field`, `Skeleton`, `LinkButton`, `useSignedUrls`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` | Sin uso confirmado |
| C-23 | B | `ChangePassword` usa `err.message` y redirección dura | `ChangePassword.tsx:38` | Inconsistente con `toUserMessage` |
| C-24 | B | Tests son placeholder | `format.test.ts` | No prueba `formatDate/Currency/USD` |
| C-25 | B | Sin `public/_headers` | — | Cabeceras de seguridad en Cloudflare (Sprint 8) |

---

## 6. Estado de la base de datos y migraciones

| Migración | Archivo | Contenido | ¿Aplicada en remoto? |
|---|---|---|---|
| 001 | `001_initial_schema.sql` | `groups`, `profiles`, `payments`, RLS, trigger `handle_new_user` | Presumiblemente sí (app usada) — **verificar** |
| 002 | `002_fix_profile_update_policy.sql` | Restringe UPDATE propio (protege `role`, `is_winner`, `group_id`) | **verificar** |
| 003 | `003_fix_handle_new_user.sql` | `search_path` seguro | **verificar** |
| 004 | `004_admin_helpers.sql` | `is_admin()`, políticas admin, policy admin-update profiles | **verificar** (posible recursión) |
| 005 | `005_storage_payment_proofs.sql` | Bucket privado `payment-proofs` + políticas | **verificar** |
| 006 | `006_payments_amount_check.sql` | `check (amount = 100.00)` | **verificar** |
| 007 | `007_payment_weeks.sql` | Tabla `payment_weeks` + `current_week_number()` | **No aplicada** (sin commitear) |
| 008 | `008_updated_at_trigger.sql` | `set_updated_at()` + trigger en `profiles` | **No aplicada** (sin commitear) |
| **009 (falta)** | — | **Columnas de perfil faltantes** | **No existe** |

**Requisito nuevo:** migración `009_extend_profiles.sql` (idempotente) que agregue `first_name`, `last_name`, `address`, `birth_date`, `gender` a `public.profiles` y, si aplica, rellene `first_name/last_name` desde `full_name`. Es prerequisito de registro/perfil.

**Herramienta recomendada:** `Instructions/Instructions18.md` (runner Node con `pg`), ya que el CLI no funciona en el equipo. Alternativa manual: SQL Editor.

---

## 7. Validación real ejecutada (2026-10-19)

| Comando | Resultado real |
|---|---|
| `npx tsc --noEmit` | **0 errores** (la deriva de esquema está oculta por casts `as ProfileRow`) |
| `npm run lint` | **0 errores, 18 warnings** (`@typescript-eslint/no-explicit-any`) |
| `npm run test` | 1 archivo, 1 test placeholder, **pasa** |
| `npm run build` | **OK** en ~24s; `dist/` con `manifest.webmanifest`, `sw.js`, `registerSW.js`; bundle JS 447 kB (122 kB gzip) |
| `rg "service_role" src` | sin resultados (correcto) |
| `rg "console.log" src` | sin resultados |
| `git status` | limpio + 2 migraciones sin commitear |
| `Test-Path supabase/config.toml` | `False` |

**Conclusión de calidad:** el verde del typecheck **no refleja** el estado funcional; la ausencia de tipado de Supabase enmascara C-01/C-16.

---

## 8. Decisiones de negocio

### Confirmadas (fuente de verdad)
1. **Tema claro/oscuro** con opción “Sistema”; preferencia persistente.
2. **Registro sin** consentimiento de privacidad ni confirmación de email; alta inicia sesión de inmediato.
3. **Cuota semanal**: el usuario ve estado de la semana actual + historial.
4. **Notificación push 1 día antes** del vencimiento.
5. **Admins editan** datos de participantes.
6. **Comprobantes siempre comprimidos/optimizados.**
7. **Cuota = 100 USD**.

### Pendientes (NO inventar; parametrizar)
- **Día de vencimiento semanal** → configurable por admin.
- **Fecha de inicio del san** → configurable por admin.
- **Reglas de sorteo/ganador** (frecuencia, notificación, beneficios) → sin definir.
- **Límite final de archivo** (hoy 1 MB; el plan sugiere validar real por firma).
- **Push vs. email de respaldo** → decidir si push no es viable.

---

## 9. Ruta a seguir — Plan de sprints

> Orden obligatorio. Los sprints **A** y **B** son nuevos (corrigen lo encontrado) y van **antes** de continuar con el plan original (2 → 8). Cada sprint cierra con `npm run typecheck && npm run lint && npm run test && npm run build` en 0.

### Etapa 0 — Prerrequisitos manuales (responsable) — ya documentada
- Definir `SUPABASE_DB_URL` (ver `Instructions/Instructions18.md`), respaldo en Supabase, mover el proyecto fuera de OneDrive.
- Estado: **pendiente del responsable**.

### Sprint A — Reproducibilidad de datos y esquema (CRÍTICO) — bloqueante
**Objetivo:** que la base sea reproducible desde el repo y coherente con el código.
1. Crear `supabase/migrations/009_extend_profiles.sql` (idempotente): agregar `first_name`, `last_name`, `address`, `birth_date`, `gender` a `public.profiles`; backfill `first_name/last_name` desde `full_name`.
2. Revisar/corregir `004_admin_helpers.sql`: evitar recursión en la política admin-update de `profiles` (usar `public.is_admin()` simple o un helper SECURITY DEFINER para verificar `role`).
3. Añadir `supabase/.temp/` y `supabase/.branches/` a `.gitignore`.
4. Aplicar migraciones `004`–`009` en remoto con el runner de `Instructions18.md` (o SQL Editor). Respaldo + verificación de solo lectura.
5. Alinear `src/types/database.ts` con el esquema real y **tipar** `createClient<Database>()` en `lib/supabase.ts`.
- **Aceptación:** `select` de columnas confirma 009; `pg_policies` sin recursión; `tsc` en 0 con cliente tipado; informes de migración consistentes.

### Sprint B — Corrección de funciones inconclusas (CRÍTICO/ALTO)
**Objetivo:** que el panel admin y los comprobantes funcionen de verdad.
1. **C-02b:** `profilesService.searchByCedula(cedula)` (normalizar y consultar por `cedula`); reescribir `AdminSearch.tsx` para usarlo.
2. **C-02:** `AdminUserPayments.tsx` usa `useParams()` para `:userId`; navegación con `<Link>`/`navigate` (no `window.location`).
3. **C-03/C-15:** unificar signed URLs en `storageService.createSignedUrls`; usarlo en `PaymentCard`/`MyPayments`/`AdminUserPayments`. Eliminar `useSignedUrls` duplicado.
4. **C-04:** página `/reset-password` que consuma la sesión de recuperación (`updateUser({ password })`) y ruta en `App.tsx`.
5. **C-05:** mostrar nombre/cédula en `AdminDashboard` (join en consulta o RPC `dashboard_stats`).
6. **C-18/C-19:** arreglar `LinkButton` (usar Radix `Slot` o eliminar) y el `key` del fragmento en `AccountMenu`.
7. **C-22:** eliminar código muerto y dependencias sin uso.
- **Aceptación:** un admin busca por cédula y encuentra; abre `/admin/user/:id/payments` y ve pagos y comprobante firmado; recuperación de contraseña end-to-end; sin código muerto.

### Sprint 2 — Tema claro/oscuro (original)
Tokens en Tailwind (`darkMode: 'class'`), `:root`/`.dark` en CSS, `ThemeContext` (light/dark/system, persistencia, `matchMedia`, `meta theme-color`), migrar clases `bg-gray-9xx`/`text-gray-1xx`, selector en `AccountMenu`.

### Sprint 3 (+3.5) — Cuota semanal y configuración de semanas
Asignar `week_number` al crear el pago (vía `current_week_number()` o `getActiveWeek()`); tarjeta “Mi cuota semanal” en `UserHome` (semana, vencimiento, monto, estado: Pagada/Pendiente/Por pagar/Vencida) y agrupación por semana en `MyPayments`; **pantalla `/admin/settings`** para crear semanas, definir día de vencimiento y fecha de inicio, y marcar activa (`weeksService`).

### Sprint 4 — Edición de participantes por admin
`profilesService.adminUpdate(id, patch)`; `EditParticipantModal` en `AdminParticipants` (nombre, apellido, cédula, teléfono, fecha nac., género; toggle **Ganador**); manejo de `23505`; actualización optimista. Confirmar política RLS de `004` y trigger `008`.

### Sprint 5 — Subida optimizada
`src/lib/image.ts` (`compressImage` con canvas nativo, `createImageBitmap` + fallback), preview con `URL.createObjectURL`, tamaño original→optimizado, validación por firma, progreso (`createSignedUploadUrl`+stream o spinner documentado), insertar con `week_number`.

### Sprint 6 — Notificaciones push (1 día antes)
Migración `009`→**renumerar a 010** por conflicto (la 009 la usa Sprint A): `push_subscriptions` + RLS. PWA `injectManifest` + `src/sw.ts` (`push`/`notificationclick`). `pushService.ts` y botón en `Profile`. Edge Function `send-weekly-reminders` + cron diario. Fallback email documentado. **Documentar VAPID, secretos y cron en el manual.**

### Sprint 7 — UX/accesibilidad/móvil
Skeletons, `ToastProvider` unificado (`aria-live`), confirmación modal + motivo obligatorio al rechazar, `AdminParticipants` responsive con paginación, accesibilidad (`htmlFor`/`id`, landmarks, skip-link, Escape, `document.title`, `autocomplete`), tab bar móvil, microcopy y consistencia visual.

### Sprint 8 — Rendimiento y PWA
`React.lazy`+`Suspense` por ruta, `select` explícito (no `*`), paralelizar dashboard (`Promise.all` o RPC), thumbnails y cache de signed URLs, `lang="es"`/favicon/`theme-color` dinámico, `public/_headers`.

### Etapa 9 — Deploy y smoke test (responsable + verificación)
GitHub → Cloudflare Pages (build `npm run build`, salida `dist`, variables `VITE_*`), crear/confirmar admin, ejecutar el smoke test del manual.

---

## 10. Riesgos y bloqueadores

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Estado de migraciones en remoto desconocido | Alto | Runner de `Instructions18.md` + verificación de solo lectura antes de escribir |
| Deriva de esquema (C-01) | Alto | Sprint A (009) antes de cualquier sprint de UI |
| Recursión RLS (C-06) | Medio | Reemplazar política en Sprint A |
| CLI Supabase inviable | Medio | Plan B (Node `pg` / SQL Editor) |
| OneDrive corrompe `node_modules`/`.git` | Medio | Mover a `C:\dev\...` |
| Notificaciones push complejas (VAPID, cron, Edge Function) | Medio | Sprint 6 con fallback email y manual detallado |
| Reglas de negocio sin definir | Medio | Parametrizar; nunca inventar |

---

## 11. Definition of Done (global del proyecto)

- [ ] Base reproducible: todas las migraciones `001`–`009(+)` en el repo y aplicables desde cero.
- [ ] `npm run typecheck`, `lint`, `test`, `build` en 0.
- [ ] Sin `supabase` importado fuera de `src/services/`.
- [ ] Panel admin 100% funcional: buscar por cédula, ver/editar participante, ver comprobante firmado, aprobar/rechazar, marcar ganador, configurar semanas.
- [ ] Tema claro/oscuro persistente.
- [ ] Cuota semanal visible y `week_number` asignado.
- [ ] Subida comprimida con preview y progreso.
- [ ] Push 1 día antes (o email documentado).
- [ ] Accesibilidad básica AA y móvil sin scroll horizontal.
- [ ] Deploy en Cloudflare Pages con `VITE_*` y smoke test aprobado.

---

## 12. Cómo debe trabajar Grok con este documento

1. Tratar la sección 5 (IDs C-xx) como backlog verificable; cada instrucción debe referenciar el ID.
2. Respetar el orden: **A → B → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9**.
3. Para cada sprint, entregar: objetivo, archivos exactos, cambios, comandos de verificación y criterios de aceptación (basados en la sección 9).
4. No proponer cambios que contradigan las decisiones confirmadas (sección 8) ni inventar las pendientes.
5. Mantener la regla de seguridad: `service_role` jamás en el frontend; secretos solo en terminal/Edge Function.
6. Recordar que el CLI de Supabase no es viable: usar el runner de `Instructions18.md`.
