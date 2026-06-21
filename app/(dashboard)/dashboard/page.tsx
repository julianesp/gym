export const runtime = "edge";


import { auth } from "@clerk/nextjs/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Users, Ticket, TrendingUp, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  let stats = {
    miembrosActivos: 0,
    tiquerasVendidas: 0,
    asistenciasHoy: 0,
    ingresosMes: 0,
  };

  let actividadReciente: { nombre: string; hace: string }[] = [];
  let tiquerasPorVencer: { nombre: string; dias: number; sesiones: number }[] = [];

  try {
    const { env } = getRequestContext();
    const db: D1Database = (env as unknown as { DB: D1Database }).DB;

    const hoy = new Date().toISOString().split("T")[0];
    const inicioMes = hoy.substring(0, 7) + "-01";

    const [miembros, tiqueras, asistencias, ingresos, recientes, porVencer] =
      await Promise.all([
        db.prepare(`SELECT COUNT(*) as total FROM members WHERE status = 'active'`).first<{ total: number }>(),
        db.prepare(`SELECT COUNT(*) as total FROM member_tickets WHERE strftime('%Y-%m', purchase_date) = strftime('%Y-%m', 'now')`).first<{ total: number }>(),
        db.prepare(`SELECT COUNT(*) as total FROM attendances WHERE date(check_in_time) = date('now')`).first<{ total: number }>(),
        db.prepare(`SELECT COALESCE(SUM(total_revenue), 0) as total FROM daily_revenue WHERE date >= ?`).bind(inicioMes).first<{ total: number }>(),
        db.prepare(
          `SELECT m.full_name as nombre, a.check_in_time as fecha
           FROM attendances a
           JOIN members m ON m.id = a.member_id
           ORDER BY a.created_at DESC LIMIT 4`
        ).all<{ nombre: string; fecha: string }>(),
        db.prepare(
          `SELECT m.full_name as nombre,
                  julianday(mt.expiration_date) - julianday('now') as dias,
                  mt.remaining_sessions as sesiones
           FROM member_tickets mt
           JOIN members m ON m.id = mt.member_id
           WHERE mt.status = 'active'
             AND julianday(mt.expiration_date) - julianday('now') <= 5
             AND julianday(mt.expiration_date) - julianday('now') >= 0
           ORDER BY dias ASC LIMIT 3`
        ).all<{ nombre: string; dias: number; sesiones: number }>(),
      ]);

    stats.miembrosActivos = miembros?.total ?? 0;
    stats.tiquerasVendidas = tiqueras?.total ?? 0;
    stats.asistenciasHoy = asistencias?.total ?? 0;
    stats.ingresosMes = ingresos?.total ?? 0;

    actividadReciente = (recientes.results ?? []).map((r) => {
      const diff = Math.round((Date.now() - new Date(r.fecha).getTime()) / 60000);
      const hace =
        diff < 60
          ? `Hace ${diff} min`
          : diff < 1440
          ? `Hace ${Math.round(diff / 60)} hora${Math.round(diff / 60) !== 1 ? "s" : ""}`
          : `Hace ${Math.round(diff / 1440)} día${Math.round(diff / 1440) !== 1 ? "s" : ""}`;
      return { nombre: r.nombre, hace };
    });

    tiquerasPorVencer = (porVencer.results ?? []).map((r) => ({
      nombre: r.nombre,
      dias: Math.round(r.dias),
      sesiones: r.sesiones,
    }));
  } catch {
    // En local sin D1 binding los valores quedan en 0
  }

  const statsCards = [
    {
      title: "Miembros Activos",
      value: stats.miembrosActivos.toString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Tiqueteras del Mes",
      value: stats.tiquerasVendidas.toString(),
      icon: Ticket,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Asistencias Hoy",
      value: stats.asistenciasHoy.toString(),
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Ingresos del Mes",
      value: `$${stats.ingresosMes.toLocaleString("es-CO")}`,
      icon: DollarSign,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
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
        {statsCards.map((stat) => (
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
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity & Expiring tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
          {actividadReciente.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin asistencias registradas hoy.</p>
          ) : (
            <div className="space-y-4">
              {actividadReciente.map((a, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{a.nombre}</p>
                    <p className="text-gray-400 text-xs">{a.hace}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Tiqueteras por Vencer</h3>
          {tiquerasPorVencer.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay tiqueteras próximas a vencer.</p>
          ) : (
            <div className="space-y-4">
              {tiquerasPorVencer.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">{t.nombre}</p>
                    <p className="text-gray-400 text-xs">
                      Vence en {t.dias === 0 ? "hoy" : `${t.dias} día${t.dias !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <span className="text-yellow-500 text-sm font-medium">{t.sesiones} sesiones</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
