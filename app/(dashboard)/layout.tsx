import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  Ticket,
  Users,
  ClipboardCheck,
  Bell,
  MessageCircle,
  MessageSquare,
  Settings,
  Shield,
  Crown
} from "lucide-react";
import { getUserRole, UserRole, isSuperAdmin } from "@/lib/auth/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación en el servidor
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Obtener email y rol del usuario
  const userEmail = user.emailAddresses[0]?.emailAddress;
  const userRole = getUserRole(userEmail);

  // Si el usuario no tiene rol válido, redirigir a onboarding
  if (userRole === UserRole.UNAUTHORIZED) {
    redirect('/unauthorized');
  }

  // Configurar navegación según el rol
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/tickets", icon: Ticket, label: "Tiqueteras", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/members", icon: Users, label: "Miembros", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/attendance", icon: ClipboardCheck, label: "Asistencias", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/notifications", icon: Bell, label: "Notificaciones", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/chat", icon: MessageCircle, label: "Chat", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF, UserRole.MEMBER] },
    { href: "/feedback", icon: MessageSquare, label: "Feedback", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER] },
    { href: "/settings", icon: Settings, label: "Configuración", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF, UserRole.MEMBER] },
  ];

  // Filtrar items de navegación según el rol
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  // Determinar badge y mensaje según el rol
  const getRoleBadge = () => {
    if (userRole === UserRole.SUPER_ADMIN) {
      return {
        icon: Crown,
        label: "SUPER ADMIN",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30"
      };
    }
    return {
      icon: Shield,
      label: "PROPIETARIO",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30"
    };
  };

  const badge = getRoleBadge();

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Dumbbell className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">GymSaaS</h1>
          </div>

          {/* Role Badge */}
          <div className={`mb-6 ${badge.bgColor} border ${badge.borderColor} rounded-lg p-3`}>
            <div className={`flex items-center gap-2 ${badge.color}`}>
              <badge.icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{badge.label}</span>
            </div>
          </div>

          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Super Admin Panel Link */}
            {isSuperAdmin(userEmail) && (
              <Link
                href="/super-admin"
                className="flex items-center gap-3 px-4 py-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors border border-yellow-500/30 mt-4"
              >
                <Crown className="w-5 h-5" />
                <span>Panel Super Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Bienvenido{userRole === UserRole.SUPER_ADMIN ? ', Super Admin' : ''}
              </h2>
              <p className="text-sm text-gray-400">
                {userRole === UserRole.SUPER_ADMIN
                  ? 'Control total del sistema'
                  : 'Gestiona tu gimnasio de forma eficiente'}
              </p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
