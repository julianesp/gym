"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Users,
  Ticket,
  ClipboardCheck,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
} from "lucide-react";

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

type Detail = {
  gym: {
    id: string;
    name: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    status: string;
    suspended: boolean;
    state: "subscribed" | "trial" | "expired";
    trial_ends_at: string | null;
    subExpiresAt: string | null;
    created_at: string;
  };
  metrics: {
    members: number;
    active_members: number;
    packages: number;
    tickets_sold: number;
    attendances_total: number;
    attendances_30d: number;
    gym_revenue: number;
  };
  subscriptions: {
    id: string;
    status: string;
    started_at: string;
    expires_at: string | null;
  }[];
};

const STATE_LABEL: Record<Detail["gym"]["state"], { label: string; cls: string }> = {
  subscribed: { label: "Suscrito", cls: "bg-green-500/20 text-green-500" },
  trial: { label: "Prueba", cls: "bg-yellow-500/20 text-yellow-400" },
  expired: { label: "Vencido", cls: "bg-red-500/20 text-red-400" },
};

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("es-CO") : "—";
}

export default function GymDetailDrawer({
  gymId,
  onClose,
}: {
  gymId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/super-admin/gyms/${gymId}`)
      .then(async (r) => {
        const data = (await r.json()) as Detail & { error?: string };
        if (!r.ok) throw new Error(data.error ?? "Error al cargar el detalle");
        if (!cancelled) setDetail(data);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Error"));
    return () => {
      cancelled = true;
    };
  }, [gymId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-gray-900 border-l border-gray-800 h-full overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Detalle del gimnasio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="p-6 text-red-400 text-sm">{error}</div>
        ) : !detail ? (
          <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando…
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Encabezado */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                {detail.gym.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">{detail.gym.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATE_LABEL[detail.gym.state].cls}`}
                  >
                    {STATE_LABEL[detail.gym.state].label}
                  </span>
                  {detail.gym.suspended && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                      Suspendido
                    </span>
                  )}
                </div>
              </div>
            </div>

            {detail.gym.description && (
              <p className="text-gray-400 text-sm">{detail.gym.description}</p>
            )}

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={Users} label="Miembros" value={`${detail.metrics.active_members} / ${detail.metrics.members}`} hint="activos / total" />
              <Metric icon={Ticket} label="Tiqueteras" value={String(detail.metrics.tickets_sold)} hint={`${detail.metrics.packages} paquetes`} />
              <Metric icon={ClipboardCheck} label="Asistencias 30d" value={String(detail.metrics.attendances_30d)} hint={`${detail.metrics.attendances_total} histórico`} />
              <Metric icon={DollarSign} label="Ingresos del gym" value={COP.format(detail.metrics.gym_revenue)} hint="tiqueteras pagadas" />
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wide">Contacto</h4>
              <Row icon={Mail} value={detail.gym.email} />
              <Row icon={Phone} value={detail.gym.phone} />
              <Row icon={MapPin} value={[detail.gym.address, detail.gym.city].filter(Boolean).join(", ") || null} />
              <Row icon={Building2} value={`Registrado ${fmtDate(detail.gym.created_at)}`} />
              <Row
                icon={Calendar}
                value={
                  detail.gym.state === "subscribed"
                    ? `Suscripción vence ${fmtDate(detail.gym.subExpiresAt)}`
                    : `Prueba vence ${fmtDate(detail.gym.trial_ends_at)}`
                }
              />
            </div>

            {/* Historial de suscripciones */}
            <div className="space-y-2">
              <h4 className="text-gray-300 font-medium text-sm uppercase tracking-wide">
                Historial de pagos
              </h4>
              {detail.subscriptions.length === 0 ? (
                <p className="text-gray-500 text-sm">Sin pagos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {detail.subscriptions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="text-gray-300">{fmtDate(s.started_at)}</span>
                      <span className="text-gray-500">→ {fmtDate(s.expires_at)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          s.status === "active"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <p className="text-white font-bold text-lg leading-tight">{value}</p>
      {hint && <p className="text-gray-500 text-xs">{hint}</p>}
    </div>
  );
}

function Row({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <span>{value ?? "—"}</span>
    </div>
  );
}
