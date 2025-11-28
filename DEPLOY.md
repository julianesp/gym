# Guía de Deployment a Vercel

Esta guía te ayudará a desplegar tu proyecto GymSaaS en Vercel.

## Pre-requisitos

Antes de desplegar, asegúrate de tener:

1. ✅ Cuenta de Vercel ([vercel.com](https://vercel.com))
2. ✅ Proyecto en GitHub (ya configurado)
3. ✅ Credenciales de Clerk configuradas
4. ✅ Proyecto de Supabase configurado
5. ✅ Base de datos creada (ejecuta `supabase-schema.sql` en Supabase SQL Editor)

## Paso 1: Importar Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New..." → "Project"
3. Importa tu repositorio de GitHub: `julianesp/gym`
4. Selecciona el proyecto y click en "Import"

## Paso 2: Configurar Variables de Entorno

En la sección "Environment Variables" de Vercel, agrega las siguientes variables:

### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZHluYW1pYy1mb3hob3VuZC04LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_qLjNTZ453kVItplmHzIXzqo6178rRpMFlYdpgac0lY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://eghktdjctnfqolcihxua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaGt0ZGpjdG5mcW9sY2loeHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDU5ODEsImV4cCI6MjA3OTkyMTk4MX0.7P3b5k8gS9Y_FQ3mduCyCuDRQujFtH4TNekuAF0QuTo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaGt0ZGpjdG5mcW9sY2loeHVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM0NTk4MSwiZXhwIjoyMDc5OTIxOTgxfQ.i2jfvROrcBxiCng9deW0Sr8t-Nf_0dqgoiHYJNRG62o
```

### App URL (se actualizará después del deploy)
```
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

**IMPORTANTE**: Copia y pega cada variable una por una en la interfaz de Vercel.

## Paso 3: Configurar Build Settings

Vercel detectará automáticamente que es un proyecto Next.js. La configuración predeterminada debería funcionar:

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Paso 4: Deploy

1. Click en "Deploy"
2. Espera a que termine el build (puede tomar 2-5 minutos)
3. Una vez completado, obtendrás una URL de producción

## Paso 5: Actualizar Configuraciones Post-Deploy

### 5.1 Actualizar Variable de Entorno

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Edita `NEXT_PUBLIC_APP_URL` con tu URL de producción (ej: `https://gym-saas.vercel.app`)
4. Redeploy el proyecto

### 5.2 Actualizar Clerk

1. Ve a tu dashboard de Clerk
2. Configure → Paths
3. Agrega tu dominio de Vercel a "Allowed redirect URLs"
4. Agrega las siguientes URLs:
   - `https://tu-proyecto.vercel.app/sign-in`
   - `https://tu-proyecto.vercel.app/sign-up`
   - `https://tu-proyecto.vercel.app/dashboard`

### 5.3 Actualizar Supabase (opcional)

Si quieres restringir el acceso solo desde tu dominio de Vercel:

1. Ve a tu proyecto en Supabase
2. Settings → API
3. En "API Settings", agrega tu dominio de Vercel a la lista de dominios permitidos

## Paso 6: Verificar Deployment

Visita tu URL de producción y verifica:

- ✅ Landing page carga correctamente
- ✅ Puedes registrarte (Sign Up)
- ✅ Puedes iniciar sesión (Sign In)
- ✅ Dashboard es accesible después de autenticarse
- ✅ Todas las páginas funcionan

## Configuración de Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. Ve a Settings → Domains en tu proyecto de Vercel
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los DNS
4. Actualiza las URLs en Clerk y en la variable `NEXT_PUBLIC_APP_URL`

## Troubleshooting

### Error 500 en producción

- Verifica que todas las variables de entorno estén configuradas correctamente
- Revisa los logs en Vercel (Deployments → Click en el deployment → Logs)

### Clerk no funciona

- Asegúrate de agregar tu dominio de Vercel en Clerk
- Verifica que las URLs de redirección sean correctas

### Base de datos no conecta

- Verifica las credenciales de Supabase
- Asegúrate de que el esquema SQL se haya ejecutado correctamente

## Deployments Automáticos

Cada vez que hagas push a la rama `main` en GitHub, Vercel automáticamente:

1. Detectará el cambio
2. Construirá el proyecto
3. Desplegará la nueva versión

Para deployments de staging, puedes crear una rama `develop` y Vercel creará preview deployments automáticamente.

## Comandos Útiles

```bash
# Deploy desde CLI (requiere Vercel CLI instalado)
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs [deployment-url]
```

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Clerk con Vercel](https://clerk.com/docs/deployments/deploy-to-vercel)
- [Supabase con Vercel](https://supabase.com/docs/guides/integrations/vercel)

---

¡Tu aplicación GymSaaS está lista para producción! 🎉
