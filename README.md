# GymSaaS - Plataforma de Gestión para Gimnasios

Una plataforma SaaS completa para la gestión de gimnasios, que incluye administración de miembros, control de asistencias, sistema de tiqueteras, notificaciones inteligentes y más.

## Características Principales

### Gestión de Miembros
- CRUD completo de miembros
- Perfiles detallados con información de contacto
- Estado de membresía (activo/inactivo)
- Historial de tiqueteras

### Sistema de Tiqueteras
- Creación de paquetes personalizados (sesiones, días de validez, precio)
- Compra de tiqueteras por miembros
- Seguimiento de sesiones restantes
- Renovación automática (opcional)
- Compra anticipada de tiqueteras

### Control de Asistencias
- Registro de entrada/salida con código QR
- Descuento automático de sesiones
- Historial completo de asistencias
- Estadísticas en tiempo real

### Notificaciones Inteligentes
- Alertas cuando faltan 5 días para vencimiento
- Notificaciones de sesiones por agotarse
- Recordatorios de renovación
- Sistema de notificaciones en tiempo real

### Chat/Red Social
- Chat comunitario para miembros
- Respuestas y reacciones a mensajes
- Comunicación privada entre miembros
- Fomenta la comunidad del gimnasio

### Sistema de Feedback
- **Feedback al Desarrollador**: Los dueños de gimnasios pueden reportar bugs, solicitar funciones o hacer preguntas
- **Buzón de Sugerencias**: Los miembros pueden enviar sugerencias al gimnasio (anónimas o no)
- Sistema de categorización y prioridades
- Seguimiento de estado de solicitudes

## Tecnologías Utilizadas

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Estilos**: TailwindCSS
- **Autenticación**: Clerk
- **Base de Datos**: Supabase (PostgreSQL)
- **Iconos**: Lucide React

## Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd gym-saas
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurar Clerk

1. Ve a [clerk.com](https://clerk.com) y crea una cuenta
2. Crea una nueva aplicación
3. Copia las claves API y pégalas en `.env.local`
4. Configura los métodos de autenticación que prefieras (email, Google, etc.)

### 5. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Copia la URL y las claves API
3. Ve al SQL Editor en Supabase
4. Ejecuta el contenido del archivo `supabase-schema.sql` (ubicado en la raíz del proyecto)
5. Esto creará todas las tablas, índices y funciones necesarias

### 6. Ejecutar el proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
gym-saas/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── tickets/         # Gestión de tiqueteras
│   │   ├── members/         # Gestión de miembros
│   │   ├── attendance/      # Control de asistencias
│   │   ├── notifications/   # Notificaciones
│   │   ├── chat/           # Chat comunitario
│   │   ├── feedback/       # Feedback al desarrollador
│   │   └── settings/       # Configuración y sugerencias
│   ├── api/                # API routes
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── tickets/
│   ├── attendance/
│   ├── notifications/
│   ├── chat/
│   └── feedback/
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Cliente de Supabase
│   │   └── server.ts       # Cliente de Supabase (server-side)
│   ├── clerk/
│   └── utils/
├── supabase-schema.sql     # Esquema de base de datos
└── .env.local.example      # Ejemplo de variables de entorno
```

## Esquema de Base de Datos

### Tablas Principales

- **gyms**: Información de gimnasios
- **members**: Miembros del gimnasio
- **ticket_packages**: Paquetes de tiqueteras disponibles
- **member_tickets**: Tiqueteras compradas por miembros
- **attendances**: Registro de asistencias
- **notifications**: Sistema de notificaciones
- **chat_messages**: Mensajes del chat comunitario
- **developer_feedback**: Feedback de dueños al desarrollador
- **gym_suggestions**: Sugerencias de miembros al gimnasio

### Funciones Automáticas

- **check_expired_tickets()**: Actualiza el estado de tiqueteras expiradas
- **create_expiring_ticket_notifications()**: Crea notificaciones para tiqueteras por vencer

## Funcionalidades del Sistema

### 1. Sistema de Tiqueteras

Los gimnasios pueden crear paquetes de sesiones con:
- Número de sesiones (por defecto 30)
- Días de validez (por defecto 30)
- Precio personalizado
- Estado activo/inactivo

Cuando un miembro compra una tiquetera:
- Se crea un registro en `member_tickets`
- Se calcula la fecha de expiración
- Se inicia el contador de sesiones

### 2. Control de Asistencias

Al registrar asistencia:
- Se crea un registro en `attendances`
- Se descuenta una sesión de la tiquetera activa
- Se actualiza el estado si se agotan las sesiones
- Se registra hora de entrada y salida

### 3. Notificaciones

El sistema genera notificaciones automáticas cuando:
- Faltan 5 días para que venza una tiquetera
- Una tiquetera se ha vencido
- Quedan pocas sesiones disponibles
- Eventos importantes del gimnasio

### 4. Chat Comunitario

- Los miembros pueden enviar mensajes públicos
- Se pueden responder mensajes
- Sistema de reacciones con emojis
- Fomenta la comunidad del gimnasio

### 5. Sistema de Feedback

**Para Desarrollador**:
- Los dueños de gimnasios pueden reportar bugs
- Solicitar nuevas funciones
- Hacer preguntas sobre el sistema
- Categorías: bug, feature_request, question, other
- Prioridades: low, normal, high, urgent

**Para Gimnasio**:
- Los miembros envían sugerencias al gimnasio
- Pueden ser anónimas
- Categorías: facilities, classes, staff, equipment, other
- Los dueños las ven en Configuración

## Próximos Pasos

### Para Producción

1. **Implementar API Routes**: Conectar los componentes con Supabase
2. **Webhooks de Clerk**: Sincronizar usuarios de Clerk con la base de datos
3. **Sistema de Pagos**: Integrar Stripe para pagos de tiqueteras
4. **Códigos QR**: Generar códigos QR únicos para cada miembro
5. **Envío de Emails**: Implementar notificaciones por email
6. **Dashboard de Analytics**: Gráficos y estadísticas avanzadas

### Mejoras Futuras

- App móvil para miembros
- Sistema de reservas de clases
- Gestión de inventario
- Integración con dispositivos de acceso
- Sistema de referidos
- Programas de fidelización

## Soporte

Para reportar bugs o solicitar funciones:
1. Ve a la sección "Feedback" en el dashboard
2. Llena el formulario con tu solicitud
3. El desarrollador lo revisará y responderá

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Desarrollado con por GymSaaS Team
