import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  Dumbbell,
  LayoutDashboard,
  Ticket,
  Users,
  ClipboardCheck,
  Bell,
  MessageCircle,
  MessageSquare,
  Settings
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/tickets", icon: Ticket, label: "Tiqueteras" },
    { href: "/members", icon: Users, label: "Miembros" },
    { href: "/attendance", icon: ClipboardCheck, label: "Asistencias" },
    { href: "/notifications", icon: Bell, label: "Notificaciones" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/feedback", icon: MessageSquare, label: "Feedback" },
    { href: "/settings", icon: Settings, label: "Configuración" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Dumbbell className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">GymSaaS</h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Bienvenido</h2>
              <p className="text-sm text-gray-400">Gestiona tu gimnasio de forma eficiente</p>
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
