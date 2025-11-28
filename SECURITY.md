# Documentación de Seguridad - GymSaaS

## Sistema de Control de Acceso Basado en Roles (RBAC)

Este proyecto implementa un sistema de seguridad de múltiples capas para garantizar que solo usuarios autorizados tengan acceso a las funcionalidades administrativas.

## Usuarios Autorizados

### Administrador Principal

**Email autorizado**: `julii1295@gmail.com`

Este es el único correo electrónico con acceso completo a:

- Dashboard principal
- Gestión de tiqueteras
- Gestión de miembros
- Control de asistencias
- Notificaciones
- Chat comunitario
- Feedback al desarrollador
- Configuración del sistema

### Cómo Agregar Más Administradores

Si necesitas autorizar más usuarios como administradores, edita el archivo:

```typescript
// lib/auth/permissions.ts

export const AUTHORIZED_ADMINS = [
  "julii1295@gmail.com",
  "nuevo_admin@example.com", // Agrega aquí
];
```

**IMPORTANTE**: Después de agregar un nuevo administrador, debes hacer commit y redeploy en Vercel.

## Capas de Seguridad

### 1. Middleware (proxy.ts)

La primera capa de protección se ejecuta en el middleware de Next.js:

```typescript
// Verifica autenticación con Clerk
await auth.protect();

// Verifica autorización basada en email
if (!isAuthorizedAdmin(userEmail)) {
  return NextResponse.redirect("/unauthorized");
}
```

**Rutas protegidas**:

- `/dashboard`
- `/tickets`
- `/members`
- `/attendance`
- `/notifications`
- `/chat`
- `/feedback`
- `/settings`

**Rutas públicas** (sin autenticación):

- `/` (landing page)
- `/sign-in`
- `/sign-up`
- `/unauthorized`

### 2. Server-Side Verification (Dashboard Layout)

Segunda capa de protección en el layout del dashboard:

```typescript
// Verifica usuario autenticado
const user = await currentUser();
if (!user) redirect("/sign-in");

// Verifica email autorizado
const userEmail = user.emailAddresses[0]?.emailAddress;
if (!isAuthorizedAdmin(userEmail)) redirect("/unauthorized");
```

Esta verificación se ejecuta en cada carga del dashboard, asegurando que incluso si alguien intenta acceder directamente, será redirigido.

### 3. Página de Acceso No Autorizado

Los usuarios no autorizados son redirigidos a `/unauthorized` donde se les informa que no tienen permisos.

## Flujo de Autenticación y Autorización

```
1. Usuario intenta acceder a /dashboard
   ↓
2. Middleware verifica autenticación (Clerk)
   ↓
3. Middleware verifica autorización (email en lista)
   ↓
4. Si no autorizado → Redirect a /unauthorized
   ↓
5. Si autorizado → Continúa al dashboard
   ↓
6. Dashboard layout verifica nuevamente (server-side)
   ↓
7. Si todo OK → Muestra contenido
```

## Escenarios de Usuario

### Escenario 1: Usuario Autorizado (julii1295@gmail.com)

1. Inicia sesión con Clerk
2. Puede acceder a todas las rutas protegidas
3. Ve badge de "ADMINISTRADOR" en el sidebar
4. Tiene acceso completo a todas las funcionalidades

### Escenario 2: Usuario No Autorizado

1. Inicia sesión con Clerk
2. Intenta acceder a `/dashboard` u otra ruta protegida
3. Es redirigido automáticamente a `/unauthorized`
4. Ve mensaje explicando que no tiene permisos
5. Solo puede ver la landing page pública

### Escenario 3: Usuario No Autenticado

1. Intenta acceder a una ruta protegida
2. Es redirigido a `/sign-in`
3. Después de iniciar sesión, se aplica el Escenario 1 o 2

## Archivos de Configuración

### lib/auth/permissions.ts

```typescript
// Lista de administradores autorizados
export const AUTHORIZED_ADMINS = ["julii1295@gmail.com"];

// Función de verificación
export function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMINS.includes(email.toLowerCase());
}

// Rutas protegidas
export const PROTECTED_ADMIN_ROUTES = [
  "/dashboard",
  "/tickets",
  // ... más rutas
];
```

### proxy.ts

Middleware que intercepta todas las peticiones y verifica permisos antes de permitir el acceso.

### app/(dashboard)/layout.tsx

Verificación adicional del lado del servidor en el layout del dashboard.

### app/unauthorized/page.tsx

Página mostrada a usuarios sin permisos.

## Seguridad en Producción

### Variables de Entorno Requeridas

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Mejores Prácticas

1. **No hardcodear secretos**: Usa variables de entorno en Vercel
2. **HTTPS obligatorio**: Vercel lo hace automáticamente
3. **Mantener Clerk actualizado**: Revisa actualizaciones de seguridad
4. **Auditar logs**: Revisa los logs de acceso en Vercel
5. **Rotar claves**: Cambia las claves periódicamente

## Testing de Seguridad

### Probar Acceso Autorizado

1. Inicia sesión con `julii1295@gmail.com`
2. Navega a `/dashboard`
3. Deberías ver el dashboard completo
4. Verifica que aparece el badge "ADMINISTRADOR"

### Probar Acceso No Autorizado

1. Crea una cuenta con otro email
2. Intenta acceder a `/dashboard`
3. Deberías ser redirigido a `/unauthorized`
4. No deberías poder acceder a ninguna ruta protegida

### Probar Sin Autenticación

1. Cierra sesión
2. Intenta acceder a `/dashboard`
3. Deberías ser redirigido a `/sign-in`

## Troubleshooting

### Usuario autorizado no puede acceder

1. Verifica que el email en Clerk coincida exactamente con el de la lista
2. Revisa que las mayúsculas/minúsculas sean correctas
3. Verifica que el deployment en Vercel tenga el código actualizado

### Página de unauthorized no se muestra

1. Verifica que `/unauthorized` esté en las rutas públicas del middleware
2. Revisa los logs de Vercel para ver errores

### Cambios en permissions.ts no se aplican

1. Haz commit de los cambios
2. Push a GitHub
3. Espera a que Vercel complete el deployment
4. Limpia el caché del navegador

## Extensiones Futuras

Posibles mejoras al sistema de seguridad:

1. **Roles múltiples**: Admin, Manager, Staff, Member
2. **Permisos granulares**: Por módulo o funcionalidad
3. **Gestión de roles desde UI**: Panel de administración
4. **Logs de auditoría**: Registro de accesos y acciones
5. **Autenticación de dos factores**: Mayor seguridad
6. **Sesiones con expiración**: Tokens con tiempo limitado

## Contacto

Para reportar problemas de seguridad, contacta al administrador del sistema.

---

**Última actualización**: 2024-11-28
