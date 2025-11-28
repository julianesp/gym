# Arquitectura Multi-Tenant - GymSaaS

## Visión General

GymSaaS es ahora una plataforma multi-tenant (multi-inquilino) que permite a múltiples gimnasios utilizar el sistema de forma independiente, mientras tú como desarrollador mantienes control total.

## Sistema de Roles

### 1. Super Admin (Tú)
**Email**: `julii1295@gmail.com`

**Permisos**:
- ✅ Acceso total al sistema
- ✅ Ver todos los gimnasios registrados
- ✅ Panel de super admin
- ✅ Analíticas globales
- ✅ Gestión de usuarios
- ✅ Configuración del sistema

**Acceso a**:
- Todas las rutas normales del dashboard
- `/super-admin` - Panel exclusivo
- Ver datos de todos los gimnasios

### 2. Gym Owner (Dueños de Gimnasios)
**Quiénes son**: Personas que pagan por usar GymSaaS

**Permisos**:
- ✅ Gestionar su propio gimnasio
- ✅ Crear y gestionar miembros
- ✅ Sistema de tiqueteras
- ✅ Control de asistencias
- ✅ Notificaciones
- ✅ Chat comunitario
- ✅ Recibir feedback de miembros
- ✅ Configuración de su gimnasio
- ❌ NO pueden ver otros gimnasios
- ❌ NO tienen acceso al panel de super admin

**Flujo de registro**:
1. Se registran con Clerk
2. Completan onboarding con datos del gimnasio
3. Acceden a su dashboard
4. Gestionan solo su gimnasio

### 3. Gym Staff (Personal del Gimnasio)
**Quiénes son**: Empleados de un gimnasio

**Permisos**:
- ✅ Control de asistencias
- ✅ Ver miembros
- ✅ Chat
- ❌ NO pueden modificar tiqueteras
- ❌ NO pueden ver finanzas

*Nota: Esta funcionalidad se implementará en el futuro*

### 4. Member (Miembros del Gimnasio)
**Quiénes son**: Usuarios que asisten al gimnasio

**Permisos**:
- ✅ Acceso al chat comunitario
- ✅ Enviar sugerencias al gimnasio
- ✅ Ver su perfil y tiqueteras
- ❌ NO pueden acceder al dashboard administrativo

*Nota: Esta funcionalidad se implementará en el futuro*

## Flujo de Onboarding

### Para Nuevos Dueños de Gimnasio

1. **Sign Up** - `/sign-up`
   - Crear cuenta con Clerk
   - Email, contraseña, etc.

2. **Onboarding** - `/onboarding`
   - Paso 1: Información del gimnasio
     - Nombre
     - Descripción
   - Paso 2: Información de contacto
     - Dirección
     - Teléfono
     - Email de contacto

3. **Dashboard** - `/dashboard`
   - Acceso completo a su gimnasio
   - Ver badge "PROPIETARIO"
   - Gestionar su negocio

### Para Super Admin (Tú)

1. **Sign In** - `/sign-in`
   - Iniciar sesión con tu email

2. **Dashboard** - `/dashboard`
   - Ver badge "SUPER ADMIN" dorado
   - Link especial al panel de super admin

3. **Super Admin Panel** - `/super-admin`
   - Ver todos los gimnasios
   - Estadísticas globales
   - Gestión de usuarios
   - Ingresos totales

## Aislamiento de Datos

### Cómo funciona

Cada gimnasio tiene su propio `gym_id` en la base de datos:

```sql
-- Tabla de gimnasios
CREATE TABLE gyms (
  id UUID PRIMARY KEY,
  owner_id TEXT NOT NULL,  -- Clerk user ID
  name VARCHAR(255) NOT NULL,
  ...
);

-- Tabla de miembros (aislada por gimnasio)
CREATE TABLE members (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),  -- Aislamiento
  ...
);

-- Todas las tablas están vinculadas a gym_id
```

### Reglas de Acceso

1. **Gym Owner solo ve sus datos**:
   ```typescript
   // Ejemplo de query
   const members = await supabase
     .from('members')
     .select('*')
     .eq('gym_id', userGymId);  // Filtrado automático
   ```

2. **Super Admin ve todo**:
   ```typescript
   // No hay filtro de gym_id
   const allGyms = await supabase
     .from('gyms')
     .select('*');
   ```

## Modelo de Negocio

### Planes de Suscripción

#### Basic - $29/mes
- Hasta 100 miembros
- Sistema de tiqueteras
- Control de asistencias básico
- Chat comunitario
- Soporte por email

#### Premium - $49/mes
- Miembros ilimitados
- Todo lo de Basic +
- Notificaciones automáticas
- Análisis y reportes
- Integraciones
- Soporte prioritario

#### Enterprise - Precio personalizado
- Todo lo de Premium +
- Múltiples sucursales
- API access
- Customización
- Soporte dedicado

### Cómo Cobrar

**Opción 1: Stripe Integration** (Recomendado)
```typescript
// Crear suscripción
const session = await stripe.checkout.sessions.create({
  customer_email: user.email,
  line_items: [{
    price: 'price_premium_monthly',
    quantity: 1,
  }],
  mode: 'subscription',
});
```

**Opción 2: Manual**
- Los gym owners te contactan
- Les activas manualmente
- Control total del proceso

## Configuración de Rutas

### Rutas Públicas
```typescript
/ - Landing page
/sign-in - Iniciar sesión
/sign-up - Registro
/unauthorized - Sin permisos
```

### Rutas Protegidas (Gym Owners)
```typescript
/onboarding - Configuración inicial
/dashboard - Panel principal
/tickets - Tiqueteras
/members - Miembros
/attendance - Asistencias
/notifications - Notificaciones
/chat - Chat
/feedback - Feedback
/settings - Configuración
```

### Rutas Super Admin (Solo tú)
```typescript
/super-admin - Panel de control global
/super-admin/gyms - Todos los gimnasios
/super-admin/users - Todos los usuarios
/super-admin/analytics - Analíticas
```

## Implementación Futura

### Fase 1: Actualmente Implementado ✅
- [x] Sistema de roles básico
- [x] Onboarding para gym owners
- [x] Panel de super admin
- [x] Aislamiento básico de datos

### Fase 2: Próximas Mejoras
- [ ] Integración con Stripe
- [ ] Sistema de suscripciones
- [ ] Gestión de pagos
- [ ] Webhooks de Clerk para sincronizar usuarios

### Fase 3: Funcionalidades Avanzadas
- [ ] Rol de Staff
- [ ] Rol de Member con app móvil
- [ ] Múltiples sucursales por gimnasio
- [ ] API para integraciones
- [ ] Whitelabel para gimnasios

## Seguridad

### Verificaciones en Múltiples Capas

**1. Middleware (`proxy.ts`)**
```typescript
// Verifica rol antes de permitir acceso
if (!canAccessRoute(pathname, userRole)) {
  redirect('/unauthorized');
}
```

**2. Dashboard Layout**
```typescript
// Verifica rol en el servidor
const userRole = getUserRole(userEmail);
if (userRole === UserRole.UNAUTHORIZED) {
  redirect('/unauthorized');
}
```

**3. API Routes** (A implementar)
```typescript
// Verifica que el usuario solo acceda a sus datos
if (gymId !== user.gymId && !isSuperAdmin(user)) {
  return forbidden();
}
```

## Testing

### Probar como Super Admin
1. Inicia sesión con `julii1295@gmail.com`
2. Deberías ver badge dorado "SUPER ADMIN"
3. Link al panel de super admin visible
4. Acceso a `/super-admin` permitido

### Probar como Gym Owner
1. Crea otra cuenta con email diferente
2. Completa onboarding
3. Deberías ver badge rojo "PROPIETARIO"
4. NO deberías ver link de super admin
5. Acceso a `/super-admin` denegado

## Preguntas Frecuentes

**P: ¿Cómo agrego otro super admin?**
R: Edita `lib/auth/permissions.ts` y agrega el email a `SUPER_ADMIN_EMAIL` (actualmente solo soporta uno, pero se puede extender a array)

**P: ¿Cómo cobro a los gym owners?**
R: Implementa Stripe Checkout y vincula las suscripciones al `gym_id` en Supabase

**P: ¿Los gym owners pueden ver datos de otros gimnasios?**
R: NO. Cada query debe filtrar por `gym_id` del usuario

**P: ¿Puedo tener múltiples gimnasios como super admin?**
R: SÍ. Como super admin ves todos los gimnasios y puedes crear uno de prueba

**P: ¿Qué pasa si un gym owner no completa el onboarding?**
R: Se le redirige automáticamente hasta que lo complete

## Roadmap de Monetización

### Corto Plazo (1-2 meses)
1. Integrar Stripe
2. Crear página de pricing
3. Implementar webhooks de pago
4. Dashboard de facturación

### Mediano Plazo (3-6 meses)
1. Sistema de referidos
2. Descuentos y promociones
3. Facturación automática
4. Reportes financieros

### Largo Plazo (6-12 meses)
1. Marketplace de plugins
2. Whitelabel
3. API de terceros
4. Programa de afiliados

---

**Última actualización**: 2024-11-28
**Versión**: 2.0 (Multi-tenant)
