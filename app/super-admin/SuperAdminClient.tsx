"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Crown,
  Users,
  Building2,
  DollarSign,
  CreditCard,
  Loader2,
  Ban,
  CheckCircle2,
  CalendarPlus,
  Gift,
  Trash2,
  Search,
} from "lucide-react";
import GymDetailDrawer from "./GymDetailDrawer";

type GymState = "subscribed" | "trial" | "expired";

type StateFilter = "all" | "subscribed" | "trial" | "expired" | "suspended";

type Gym = {
  id: string;
  name: string;
  email: string | null;
  members: number;
  state: GymState;
  suspended: boolean;
  trialEndsAt: string | null;
  subExpiresAt: string | null;
  createdAt: string;
};

type Summary = {
  totalGyms: number;
  totalMembers: number;
  subscribedGyms: number;
  trialGyms: number;
  expiredGyms: number;
  suspendedGyms: number;
  monthlyRevenue: number;
};

const FILTERS: { key: StateFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "subscribed", label: "Suscritos" },
  { key: "trial", label: "En prueba" },
  { key: "expired", label: "Vencidos" },
  { key: "suspended", label: "Suspendidos" },
];

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const STATE_META: Record<GymState, { label: string; cls: string }> = {
  subscribed: { label: "Suscrito", cls: "bg-green-500/20 text-green-500" },
  trial: { label: "Prueba", cls: "bg-yellow-500/20 text-yellow-400" },
  expired: { label: "Vencido", cls: "bg-red-500/20 text-red-400" },
};

type ActionBody =
  | { action: "suspend" }
  | { action: "reactivate" }
  | { action: "extend_trial"; days: number }
  | { action: "grant_subscription"; months: number };

export default function SuperAdminClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StateFilter>("all");
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = useCallback((q: string, state: StateFilter) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state !== "all") params.set("state", state);
    fetch(`/api/super-admin/gyms?${params.toString()}`)
      .then(async (r) => {
        const data = (await r.json()) as { summary?: Summary; gyms?: Gym[]; error?: string };
        if (!r.ok) throw new Error(data.error ?? "Error al cargar los gimnasios");
        setSummary(data.summary ?? null);
        setGyms(data.gyms ?? []);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error desconocido"))
      .finally(() => setLoading(false));
  }, []);

  // Carga inicial + recarga al cambiar búsqueda (con debounce) o filtro.
  useEffect(() => {
    const t = setTimeout(() => load(search, filter), 300);
    return () => clearTimeout(t);
  }, [load, search, filter]);

  const reload = useCallback(() => load(search, filter), [load, search, filter]);

  const runAction = useCallback(
    async (gymId: string, body: ActionBody) => {
      setBusyId(gymId);
      try {
        const res = await fetch(`/api/super-admin/gyms/${gymId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Error al ejecutar la acción");
        reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setBusyId(null);
      }
    },
    [reload]
  );

  const deleteGym = useCallback(
    async (gym: Gym) => {
      if (
        !confirm(
          `¿Eliminar "${gym.name}" y TODOS sus datos (miembros, tiqueteras, asistencias)? Esta acción no se puede deshacer.`
        )
      ) {
        return;
      }
      setBusyId(gym.id);
      try {
        const res = await fetch(`/api/super-admin/gyms/${gym.id}`, { method: "DELETE" });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Error al eliminar");
        reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setBusyId(null);
      }
    },
    [reload]
  );

  const handleExtendTrial = (gym: Gym) => {
    const input = prompt(`Extender prueba de "${gym.name}" — ¿cuántos días?`, "7");
    if (input === null) return;
    const days = parseInt(input, 10);
    if (!Number.isFinite(days) || days <= 0) {
      setError("Número de días inválido");
      return;
    }
    runAction(gym.id, { action: "extend_trial", days });
  };

  const handleGrantSub = (gym: Gym) => {
    const input = prompt(`Suscripción cortesía para "${gym.name}" — ¿cuántos meses?`, "1");
    if (input === null) return;
    const months = parseInt(input, 10);
    if (!Number.isFinite(months) || months <= 0) {
      setError("Número de meses inválido");
      return;
    }
    runAction(gym.id, { action: "grant_subscription", months });
  };

  const stats = [
    {
      title: "Total de Gimnasios",
      value: summary ? String(summary.totalGyms) : "—",
      hint: summary ? `${summary.suspendedGyms} suspendidos` : undefined,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total de Miembros",
      value: summary ? String(summary.totalMembers) : "—",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Suscritos / Prueba",
      value: summary ? `${summary.subscribedGyms} / ${summary.trialGyms}` : "—",
      hint: summary ? `${summary.expiredGyms} vencidos` : undefined,
      icon: CreditCard,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Ingresos Mensuales (MRR)",
      value: summary ? COP.format(summary.monthlyRevenue) : "—",
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="space-y-8 max-w-7xl mx-auto">
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

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 text-xs">
              Cerrar
            </button>
          </div>
        )}

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
              {stat.hint && <p className="text-gray-500 text-xs">{stat.hint}</p>}
            </div>
          ))}
        </div>

        {/* Búsqueda + filtros */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-red-500 text-white"
                    : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gyms Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Gimnasios Registrados</h2>
            <span className="text-sm text-gray-400">Mostrando: {gyms.length}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando gimnasios…
            </div>
          ) : gyms.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              {search || filter !== "all"
                ? "Ningún gimnasio coincide con la búsqueda."
                : "Aún no hay gimnasios registrados."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Gimnasio</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Miembros</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Plan</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Cuenta</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Vence</th>
                    <th className="text-right px-6 py-4 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gyms.map((gym) => {
                    const meta = STATE_META[gym.state];
                    const vence = gym.state === "subscribed" ? gym.subExpiresAt : gym.trialEndsAt;
                    const busy = busyId === gym.id;
                    return (
                      <tr key={gym.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDetailId(gym.id)}
                            className="flex items-center gap-3 text-left group"
                            title="Ver detalle"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold">
                              {gym.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-medium group-hover:text-red-400 transition-colors">
                                {gym.name}
                              </span>
                              <span className="text-gray-500 text-xs">{gym.email ?? "—"}</span>
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold">{gym.members}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {gym.suspended ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                              Suspendido
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {vence ? new Date(vence).toLocaleDateString("es-CO") : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <>
                                <ActionBtn
                                  title="Extender prueba"
                                  onClick={() => handleExtendTrial(gym)}
                                  className="text-blue-400 hover:bg-blue-500/10"
                                >
                                  <CalendarPlus className="w-4 h-4" />
                                </ActionBtn>
                                <ActionBtn
                                  title="Suscripción cortesía"
                                  onClick={() => handleGrantSub(gym)}
                                  className="text-purple-400 hover:bg-purple-500/10"
                                >
                                  <Gift className="w-4 h-4" />
                                </ActionBtn>
                                {gym.suspended ? (
                                  <ActionBtn
                                    title="Reactivar"
                                    onClick={() => runAction(gym.id, { action: "reactivate" })}
                                    className="text-green-400 hover:bg-green-500/10"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </ActionBtn>
                                ) : (
                                  <ActionBtn
                                    title="Suspender"
                                    onClick={() => runAction(gym.id, { action: "suspend" })}
                                    className="text-yellow-400 hover:bg-yellow-500/10"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </ActionBtn>
                                )}
                                <ActionBtn
                                  title="Eliminar"
                                  onClick={() => deleteGym(gym)}
                                  className="text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </ActionBtn>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {detailId && <GymDetailDrawer gymId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

function ActionBtn({
  title,
  onClick,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
