import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isProtectedRoute, isSuperAdminRoute, getUserRole, canAccessRoute, isSuperAdmin } from './lib/auth/permissions';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/unauthorized',
  '/suscripcion(.*)',
  '/api/webhooks(.*)',
  '/api/payments(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin autenticación
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Proteger con autenticación de Clerk
  await auth.protect();

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Resolvemos el email desde los claims del JWT de Clerk.
  // REQUISITO: en el dashboard de Clerk → Sessions → Customize session token,
  // agregar:  { "email": "{{user.primary_email_address}}" }
  // Sin ese claim, sessionClaims.email es undefined y el middleware no puede
  // identificar al super admin (probamos varios nombres por compatibilidad).
  const claims = sessionClaims as Record<string, unknown> | undefined;
  const userEmail =
    (claims?.email as string | undefined) ??
    (claims?.email_address as string | undefined) ??
    (claims?.primaryEmail as string | undefined) ??
    undefined;

  const superAdmin = isSuperAdmin(userEmail);

  // El super admin gestiona los gimnasios; no es dueño de uno, así que nunca
  // debe pasar por el onboarding. Lo enviamos directo a su panel.
  if (superAdmin) {
    if (isOnboardingRoute(request)) {
      return NextResponse.redirect(new URL('/super-admin', request.url));
    }
    return NextResponse.next();
  }

  // Usuarios en /onboarding: dejarlos pasar siempre
  if (isOnboardingRoute(request)) {
    return NextResponse.next();
  }

  // Si el usuario llega al dashboard sin haber completado el onboarding,
  // redirigirlo. El flag `onboardingComplete` se guarda en sessionClaims
  // via Clerk metadata (se actualiza desde /api/onboarding al guardar el gym).
  // Mientras no esté implementado el webhook de Clerk, usamos la cookie como fallback.
  const onboardingDone =
    (claims?.publicMetadata as Record<string, unknown> | undefined)?.onboardingComplete === true ||
    request.cookies.get("gym_onboarding_done")?.value === "1";

  if (!onboardingDone && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Bloquear rutas de super admin para usuarios no autorizados
  if (isSuperAdminRoute(pathname)) {
    const userRole = getUserRole(userEmail);

    if (!canAccessRoute(pathname, userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
