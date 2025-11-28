"use client";

import { Crown, Users, Building2, DollarSign, TrendingUp } from "lucide-react";

export default function SuperAdminPage() {
  // En producción, estos datos vendrían de Supabase
  const stats = [
    {
      title: "Total de Gimnasios",
      value: "12",
      change: "+3 este mes",
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Usuarios Activos",
      value: "847",
      change: "+125 esta semana",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Ingresos Mensuales",
      value: "$5,240",
      change: "+18% vs mes anterior",
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Crecimiento",
      value: "+23%",
      change: "Tendencia al alza",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
  ];

  const gyms = [
    {
      id: 1,
      name: "FitZone Gym",
      owner: "Juan Pérez",
      members: 156,
      plan: "Premium",
      status: "active",
      revenue: "$450/mes"
    },
    {
      id: 2,
      name: "PowerFit Center",
      owner: "María González",
      members: 203,
      plan: "Premium",
      status: "active",
      revenue: "$450/mes"
    },
    {
      id: 3,
      name: "CrossFit Elite",
      owner: "Carlos Ruiz",
      members: 89,
      plan: "Basic",
      status: "active",
      revenue: "$250/mes"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-500/10 p-3 rounded-lg">
          <Crown className="w-8 h-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Panel de Super Admin</h1>
          <p className="text-gray-400">Vista completa del sistema GymSaaS</p>
        </div>
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
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-green-500 text-xs">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Gyms Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Gimnasios Registrados</h2>
          <span className="text-sm text-gray-400">Total: {gyms.length}</span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Gimnasio</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Propietario</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Miembros</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Plan</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Estado</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Ingresos</th>
              <th className="text-right px-6 py-4 text-gray-400 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gyms.map((gym) => (
              <tr key={gym.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold">
                      {gym.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{gym.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{gym.owner}</td>
                <td className="px-6 py-4">
                  <span className="text-white font-semibold">{gym.members}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    gym.plan === 'Premium'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {gym.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    gym.status === 'active'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {gym.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-green-400 font-semibold">
                  {gym.revenue}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      Ver detalles
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {[
              { action: "Nuevo gimnasio registrado", gym: "FitZone Gym", time: "Hace 2 horas" },
              { action: "Plan actualizado", gym: "PowerFit Center", time: "Hace 5 horas" },
              { action: "Nuevo usuario agregado", gym: "CrossFit Elite", time: "Hace 1 día" },
              { action: "Pago recibido", gym: "FitZone Gym", time: "Hace 2 días" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.gym}</p>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg font-medium transition-colors text-left">
              📊 Ver Analíticas Completas
            </button>
            <button className="w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg font-medium transition-colors text-left">
              💰 Reporte de Ingresos
            </button>
            <button className="w-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-3 rounded-lg font-medium transition-colors text-left">
              👥 Gestionar Usuarios
            </button>
            <button className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg font-medium transition-colors text-left">
              ⚙️ Configuración del Sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
