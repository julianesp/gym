// Lista de correos autorizados con acceso completo al sistema
export const AUTHORIZED_ADMINS = [
  'julii1295@gmail.com',
];

// Función para verificar si un usuario tiene acceso de administrador
export function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMINS.includes(email.toLowerCase());
}

// Roles del sistema
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  UNAUTHORIZED = 'unauthorized'
}

// Obtener rol del usuario basado en su email
export function getUserRole(email: string | null | undefined): UserRole {
  if (!email) return UserRole.UNAUTHORIZED;

  if (isAuthorizedAdmin(email)) {
    return UserRole.ADMIN;
  }

  return UserRole.MEMBER;
}

// Rutas protegidas que requieren rol de admin
export const PROTECTED_ADMIN_ROUTES = [
  '/dashboard',
  '/tickets',
  '/members',
  '/attendance',
  '/notifications',
  '/chat',
  '/feedback',
  '/settings',
];

// Verificar si una ruta requiere permisos de admin
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ADMIN_ROUTES.some(route => pathname.startsWith(route));
}
