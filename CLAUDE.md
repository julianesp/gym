# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Concepto del Producto

GymSaaS es una **plataforma multi-tenant** para gestión de gimnasios. Cada gimnasio que contrata el servicio obtiene su propio espacio aislado dentro de la misma infraestructura. El modelo de negocio es SaaS: el dueño del sistema (`SUPER_ADMIN`) ofrece la plataforma a múltiples gimnasios (`GYM_OWNER`).

### Lo que hace cada gimnasio con la plataforma

- **Tiqueteras**: crean paquetes de sesiones (ej: "30 sesiones / 30 días / $50.000"). Los miembros compran tiqueteras y el sistema descuenta una sesión por cada asistencia registrada.
- **Asistencias**: registro de entrada/salida de miembros. Puede ser por código QR o manual. Cada entrada consume una sesión de la tiquetera activa del miembro, o se registra como pago en efectivo.
- **Miembros**: CRUD completo con datos de contacto, historial de tiqueteras y estado activo/inactivo.
- **Ingresos**: reportes diarios y mensuales de ventas de tiqueteras y pagos en efectivo.
- **Notificaciones**: alertas automáticas cuando una tiquetera está por vencer (5 días) o por agotarse en sesiones.
- **Chat**: canal comunitario del gimnasio con respuestas y reacciones.
- **Feedback**: canal de comunicación del dueño del gimnasio hacia el desarrollador (bugs, features, preguntas).

### Multi-tenancy

Todas las tablas principales (`members`, `ticket_packages`, `member_tickets`, `attendances`, etc.) tienen columna `gym_id` como FK hacia `gyms`. Cada query en producción debe filtrar por `gym_id` para aislar los datos de cada gimnasio.

## Commands

```bash
# Development
npm run dev           # Start Next.js dev server (localhost:3000)
npm run build         # Production build (suppresses baseline-browser-mapping warnings)
npm run lint          # ESLint

# Cloudflare Pages (alternative deployment target)
npm run pages:build   # Build with @cloudflare/next-on-pages
npm run pages:preview # Local preview with wrangler
npm run pages:deploy  # Deploy to Cloudflare Pages

# Database (Cloudflare D1)
npm run db:migrate       # Apply schema to remote D1
npm run db:migrate:local # Apply schema to local D1
```

## Architecture

This is a **gym management SaaS** built with Next.js 15 App Router, targeting both Vercel and Cloudflare Pages deployments.

### Dual Database Strategy

The project has two database backends in parallel:
- **Cloudflare D1 (SQLite)** — active backend for API routes. Schema in `d1-schema.sql`. Accessed via `lib/db/client.ts` (`getDB()` using `getRequestContext()` from `@cloudflare/next-on-pages`).
- **Supabase (PostgreSQL)** — legacy/alternative backend. Schema in `supabase-schema.sql`. Clients in `lib/supabase/client.ts` (anon key) and `lib/supabase/server.ts` (service role key).

All current API routes (`app/api/`) use the D1 path with `export const runtime = "edge"` and `getRequestContext()`. Do not mix the two backends in new code without clarifying intent.

### Auth & Role System

Authentication is handled by **Clerk** (`@clerk/nextjs`). The dashboard layout (`app/(dashboard)/layout.tsx`) checks auth server-side via `currentUser()` and redirects unauthenticated users.

Roles are defined in `lib/auth/permissions.ts`:
- `SUPER_ADMIN` — hardcoded to a single email (`SUPER_ADMIN_EMAIL`)
- `GYM_OWNER` — default for all authenticated users (temporary; production should query DB)
- `GYM_STAFF`, `MEMBER`, `UNAUTHORIZED`

Role assignment currently uses email matching only, not database lookups. The `getUserRole()` function returns `GYM_OWNER` for any non-super-admin authenticated user.

### Route Structure

- `/` — Landing page
- `/sign-in`, `/sign-up` — Clerk auth pages (catch-all routes)
- `/onboarding` — Gym setup wizard (not yet persisted to DB)
- `/(dashboard)/*` — Protected routes with sidebar layout:
  - `/dashboard`, `/members`, `/tickets`, `/attendance`
  - `/revenue`, `/notifications`, `/chat`, `/feedback`, `/settings`
- `/super-admin` — Super admin only panel
- `/unauthorized` — Access denied page
- `app/api/` — Edge API routes (D1-backed): `members`, `tickets`, `tickets/[id]`

### UI Patterns

- Dark theme throughout: `bg-black`, `bg-gray-900`, `border-gray-800`
- Primary accent color: `red-500`
- All dashboard pages are `"use client"` components that fetch from `/api/*` routes
- No shared UI component library — inline Tailwind only
- Icons via `lucide-react`

### Environment Variables

Required in `.env.local` (see `.env.local.example`):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

For Cloudflare D1, the `DB` binding is provided by wrangler at runtime — no env var needed.

### Componentes destacados

- `components/home/GymCarousel.tsx` — carrusel infinito (CSS marquee) de gimnasios en la landing page. Usa una lista estática `DEMO_GYMS` como placeholder; en producción se poblará con datos reales de la tabla `gyms` via API. Se pausa al hacer hover.

### Onboarding — registro de gimnasios

Al registrarse, Clerk redirige a `/dashboard`. El middleware (`middleware.ts`) intercepta y redirige a `/onboarding` si la cookie `gym_onboarding_done` no existe. El onboarding tiene 3 pasos:
1. Información básica (nombre, descripción)
2. Contacto (dirección, ciudad, teléfono, email)
3. Métodos de cobro a miembros (ePayco y/o Nequi — opcionales)

Al completar, `POST /api/onboarding` crea el registro en `gyms` en D1 y setea la cookie `gym_onboarding_done=1`. Si el gym también configuró pagos, llama a `POST /api/gym/payment-config`.

### Cobros del gym a sus miembros

Cada gym puede cobrar tiqueteras a sus miembros con sus propias credenciales ePayco y/o su número Nequi. Las llaves se guardan en `gym_payment_config` en D1 (la llave privada nunca se expone al cliente).

Flujo ePayco para miembros:
1. Miembro elige tiquetera → `POST /api/gym/member-payment` → devuelve config con la llave pública del gym
2. Se abre el checkout de ePayco con las credenciales del gym (no de GymSaaS)
3. ePayco confirma → `POST /api/gym/member-payment/confirmation?gymId=xxx` → crea `member_ticket` en D1

Flujo Nequi: el sistema solo muestra el número del gym al miembro; la confirmación del pago es manual por el dueño.

### Pasarela de pagos — ePayco

Flujo implementado:
1. Usuario va a `/suscripcion` → llena datos de facturación → clic en "Pagar"
2. El cliente llama a `POST /api/payments/epayco/create-session` → devuelve `config` con la llave pública y datos del pago
3. El componente carga el script de ePayco dinámicamente y abre el checkout
4. ePayco redirige a `/suscripcion/respuesta?x_transaction_state=Aceptada|Rechazada|Pendiente`
5. ePayco hace POST a `/api/payments/epayco/confirmation` (webhook server-to-server)

Variables de entorno requeridas: `EPAYCO_PUBLIC_KEY`, `EPAYCO_PRIVATE_KEY`, `EPAYCO_TEST` (en `dashboard.epayco.co → Integración → API Keys`).

El patrón de carga del script ePayco (`loadEpayco()`) viene del proyecto neuraidev — está probado en producción y maneja reintentos.

### Modelo de negocio y precios

- **Trial**: 7 días gratis sin tarjeta de crédito al registrarse
- **Precio**: $39.900 COP/mes por gimnasio (decidido con base en mercado colombiano de pueblos)
  - La competencia directa (Gymsoft, ABC Evo, Trainingym) cobra desde $300.000/mes
  - Los gimnasios en pueblos cobran $50.000–$100.000/mes al usuario final
  - $39.900 representa menos del 1% de ingresos de un gym pequeño de 50 miembros
- **Integración de pagos**: pendiente (Stripe o Wompi/PSE para Colombia). Al implementar, el trial debe activarse desde el campo `trial_ends_at` en la tabla `gyms` o similar.

### Known Incomplete Areas

- Onboarding form does not persist to database yet (logs to console, redirects after timeout)
- `getUserRole()` always returns `GYM_OWNER` for non-super-admins (no DB lookup)
- `members` API sets `user_id = email` as a temporary placeholder
- Supabase clients exist but are unused by current API routes
- El carrusel de gimnasios en la Home usa datos de demostración hardcodeados; falta crear endpoint `/api/gyms` que devuelva los gimnasios reales de D1 y conectarlo al componente
- El webhook `/api/payments/epayco/confirmation` recibe el POST de ePayco pero aún no actualiza la BD (pendiente tabla de suscripciones en D1 y lógica de activación)
- El dashboard (`/dashboard`) ya consulta datos reales de D1; en entorno local sin binding D1 muestra valores en 0 (comportamiento correcto)
