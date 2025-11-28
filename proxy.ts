import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isProtectedRoute, isAuthorizedAdmin } from './lib/auth/permissions';

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

  // Verificar autorización para rutas protegidas de admin
  if (isProtectedRoute(pathname)) {
    const { userId } = await auth();

    if (!userId) {
      // Si no hay usuario autenticado, redirigir a sign-in
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Obtener información del usuario desde Clerk
    const { sessionClaims } = await auth();
    const userEmail = sessionClaims?.email as string | undefined;

    // Verificar si el usuario está autorizado como admin
    if (!isAuthorizedAdmin(userEmail)) {
      // Redirigir a página de no autorizado
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
