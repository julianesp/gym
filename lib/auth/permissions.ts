// Super Admin - Acceso total al sistema y todos los gimnasios
export const SUPER_ADMIN_EMAIL = 'julii1295@gmail.com';

// Roles del sistema
export enum UserRole {
  SUPER_ADMIN = 'super_admin',    // Tú - Acceso a todo
  GYM_OWNER = 'gym_owner',        // Dueños de gimnasios - Acceso a su gimnasio
  GYM_STAFF = 'gym_staff',        // Personal del gimnasio - Acceso limitado
  MEMBER = 'member',              // Miembros del gimnasio - Solo chat y sugerencias
  UNAUTHORIZED = 'unauthorized'   // Sin acceso
}

// Función para verificar si un usuario es super admin
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

// Obtener rol del usuario basado en su email y datos de BD
export function getUserRole(email: string | null | undefined): UserRole {
  if (!email) return UserRole.UNAUTHORIZED;

  // Super admin tiene acceso total
  if (isSuperAdmin(email)) {
    return UserRole.SUPER_ADMIN;
  }

  // Por defecto, nuevos usuarios son gym owners
  // En producción, esto se verificaría contra la base de datos
  return UserRole.GYM_OWNER;
}

// Rutas que requieren autenticación (cualquier usuario autenticado)
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/tickets',
  '/members',
  '/attendance',
  '/notifications',
  '/chat',
  '/feedback',
  '/settings',
  '/onboarding',
];

// Rutas exclusivas para super admin
export const SUPER_ADMIN_ROUTES = [
  '/super-admin',
  '/super-admin/gyms',
  '/super-admin/users',
  '/super-admin/analytics',
];

// Verificar si una ruta requiere autenticación
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route)) ||
         SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

// Verificar si una ruta es exclusiva de super admin
export function isSuperAdminRoute(pathname: string): boolean {
  return SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

// Verificar si un usuario puede acceder a una ruta
export function canAccessRoute(pathname: string, role: UserRole): boolean {
  // Super admin puede acceder a todo
  if (role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Verificar rutas de super admin
  if (isSuperAdminRoute(pathname)) {
    return false;
  }

  // Gym owners y staff pueden acceder a rutas protegidas normales
  if (role === UserRole.GYM_OWNER || role === UserRole.GYM_STAFF) {
    return isProtectedRoute(pathname);
  }

  // Members solo pueden acceder a chat y feedback
  if (role === UserRole.MEMBER) {
    return pathname.startsWith('/chat') ||
           pathname.startsWith('/feedback') ||
           pathname.startsWith('/settings');
  }

  return false;
}
