import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRequestContext } from "@cloudflare/next-on-pages";
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
  Crown,
  DollarSign,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { getUserRole, UserRole, isSuperAdmin } from "@/lib/auth/permissions";

export const runtime = "edge";

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

  if (userRole === UserRole.UNAUTHORIZED) {
    redirect('/onboarding');
  }

  // Estado de suscripción del gym (trial + pagos). Si el dueño ya pagó,
  // `subscribed` es true y no mostramos avisos de vencimiento del trial.
  let trialDaysLeft: number | null = null;
  let trialExpired = false;
  let subscribed = false;
  try {
    const { env } = getRequestContext();
    const db: D1Database = (env as unknown as { DB: D1Database }).DB;
    const gym = await db
      .prepare(`SELECT id, trial_ends_at FROM gyms WHERE owner_id = ? LIMIT 1`)
      .bind(user.id)
      .first<{ id: string; trial_ends_at: string | null }>();

    if (gym) {
      const now = Date.now();

      const sub = await db
        .prepare(
          `SELECT expires_at FROM gym_subscriptions
           WHERE gym_id = ? AND status = 'active'
           ORDER BY started_at DESC LIMIT 1`
        )
        .bind(gym.id)
        .first<{ expires_at: string | null }>();

      subscribed =
        !!sub && (!sub.expires_at || new Date(sub.expires_at).getTime() > now);

      if (!subscribed && gym.trial_ends_at) {
        const diff = Math.ceil(
          (new Date(gym.trial_ends_at).getTime() - now) / (1000 * 60 * 60 * 24)
        );
        trialDaysLeft = diff;
        trialExpired = diff < 0;
      }
    }
  } catch {
    // En local sin binding D1 no mostramos el banner
  }

  // Configurar navegación según el rol
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/tickets", icon: Ticket, label: "Tiqueteras", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/members", icon: Users, label: "Miembros", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/attendance", icon: ClipboardCheck, label: "Asistencias", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.GYM_STAFF] },
    { href: "/revenue", icon: DollarSign, label: "Ingresos", roles: [UserRole.SUPER_ADMIN, UserRole.GYM_OWNER] },
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

  // Gate de suscripción: si el trial venció y no hay pago activo, bloqueamos el
  // acceso a las herramientas del gym (super admin queda exento).
  const accessBlocked =
    userRole === UserRole.GYM_OWNER && trialExpired && !subscribed;

  if (accessBlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Tu prueba ha vencido</h1>
          <p className="text-gray-400 mb-6">
            Para seguir gestionando tu gimnasio necesitas activar tu suscripción
            de GymSaaS. Tus datos siguen guardados y volverán a estar disponibles
            apenas actives tu plan.
          </p>
          <Link
            href="/suscripcion"
            className="inline-flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Activar suscripción
          </Link>
          <div className="mt-6">
            <UserButton />
          </div>
        </div>
      </div>
    );
  }

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

            {/* Suscripción */}
            {userRole === UserRole.GYM_OWNER && (
              <Link
                href="/suscripcion"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border mt-4 ${
                  trialExpired
                    ? "text-red-400 hover:text-red-300 bg-red-500/10 border-red-500/40 hover:bg-red-500/20"
                    : "text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">Suscripción</span>
                  {trialDaysLeft !== null && (
                    <span className="text-xs opacity-75">
                      {trialExpired ? "Vencida" : `${trialDaysLeft}d restantes`}
                    </span>
                  )}
                </div>
              </Link>
            )}

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

        {/* Banner de trial */}
        {trialDaysLeft !== null && trialDaysLeft <= 7 && (
          <div className={`px-8 py-3 flex items-center justify-between gap-4 ${
            trialExpired
              ? "bg-red-900/60 border-b border-red-700"
              : trialDaysLeft <= 2
              ? "bg-orange-900/50 border-b border-orange-700"
              : "bg-yellow-900/40 border-b border-yellow-700"
          }`}>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${trialExpired ? "text-red-400" : "text-yellow-400"}`} />
              <span className={trialExpired ? "text-red-300" : "text-yellow-200"}>
                {trialExpired
                  ? "Tu período de prueba ha vencido. Activa tu suscripción para continuar usando GymSaaS."
                  : `Tu prueba gratuita vence en ${trialDaysLeft} día${trialDaysLeft !== 1 ? "s" : ""}. ¡Activa tu plan para no perder el acceso!`}
              </span>
            </div>
            <Link
              href="/suscripcion"
              className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Activar plan
            </Link>
          </div>
        )}

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
