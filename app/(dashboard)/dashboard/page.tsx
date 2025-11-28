import { auth } from "@clerk/nextjs/server";
import { Users, Ticket, TrendingUp, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  const stats = [
    {
      title: "Miembros Activos",
      value: "156",
      change: "+12%",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Tiqueteras Vendidas",
      value: "89",
      change: "+8%",
      icon: Ticket,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Asistencias Hoy",
      value: "47",
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Ingresos del Mes",
      value: "$12,450",
      change: "+23%",
      icon: DollarSign,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Resumen general de tu gimnasio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-green-500 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Nuevo miembro registrado</p>
                  <p className="text-gray-400 text-xs">Hace {i} hora{i > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Tiqueteras por Vencer</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">Usuario {i}</p>
                  <p className="text-gray-400 text-xs">Vence en {i + 2} días</p>
                </div>
                <span className="text-yellow-500 text-sm font-medium">{30 - i * 3} sesiones</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
