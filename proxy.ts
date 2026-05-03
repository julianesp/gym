import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isProtectedRoute, isSuperAdminRoute, getUserRole, canAccessRoute } from './lib/auth/permissions';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/unauthorized',
  '/api/webhooks(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin autenticación
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Proteger con autenticación de Clerk
  await auth.protect();

  // Bloquear rutas de super admin para usuarios no autorizados
  if (isSuperAdminRoute(pathname)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const userEmail = sessionClaims?.email as string | undefined;
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
