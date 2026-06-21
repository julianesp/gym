"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Dumbbell, Check, Shield, Clock } from "lucide-react";

declare global {
  interface Window {
    ePayco?: {
      checkout: {
        configure: (opts: { key: string; test: boolean }) => {
          open: (data: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function SuscripcionPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    gymName: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    typeDoc: "CC",
    numberDoc: "",
  });

  const loadEpayco = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.ePayco?.checkout) { resolve(); return; }
      const existing = document.querySelectorAll('script[src*="checkout.epayco.co"]');
      existing.forEach(s => s.remove());
      const script = document.createElement("script");
      script.src = "https://checkout.epayco.co/checkout.js";
      script.async = false;
      script.onload = () => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.ePayco?.checkout) { clearInterval(interval); resolve(); }
          else if (attempts > 100) { clearInterval(interval); reject(new Error("ePayco no cargó")); }
        }, 100);
      };
      script.onerror = () => reject(new Error("No se pudo cargar ePayco"));
      document.head.appendChild(script);
    });
  };

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loadEpayco();

      const reference = `GYM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch("/api/payments/epayco/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymName: form.gymName,
          customerName: user?.fullName ?? form.gymName,
          customerEmail: user?.emailAddresses[0]?.emailAddress ?? "",
          customerPhone: form.phone,
          customerAddress: form.address,
          customerCity: form.city,
          customerRegion: form.region,
          customerTypeDoc: form.typeDoc,
          customerNumberDoc: form.numberDoc,
          reference,
        }),
      });

      const data = await res.json() as { config?: Record<string, unknown>; error?: string };

      if (!res.ok || !data.config) {
        throw new Error(data.error ?? "Error al iniciar el pago");
      }

      const { key, test, ...paymentData } = data.config as { key: string; test: boolean } & Record<string, unknown>;
      const handler = window.ePayco!.checkout.configure({ key, test });
      handler.open(paymentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500/10 p-4 rounded-full">
              <Dumbbell className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Activa tu suscripción</h1>
          <p className="text-gray-400">Tu período de prueba ha terminado. Continúa gestionando tu gimnasio.</p>
        </div>

        {/* Plan card */}
        <div className="bg-gray-900 border border-red-500/40 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-xl">Plan GymSaaS</h2>
              <p className="text-gray-400 text-sm">Acceso completo a todas las funcionalidades</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">$39.900</p>
              <p className="text-gray-500 text-sm">COP / mes</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 space-y-2">
            {[
              "Miembros ilimitados",
              "Control de tiqueteras y sesiones",
              "Registro de asistencias",
              "Reportes de ingresos",
              "Notificaciones automáticas",
              "Chat comunitario",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePagar} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold text-lg mb-2">Datos de facturación</h3>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre del gimnasio *</label>
            <input required value={form.gymName} onChange={e => setForm(f => ({ ...f, gymName: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="Ej: FitZone Gym" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo de doc. *</label>
              <select value={form.typeDoc} onChange={e => setForm(f => ({ ...f, typeDoc: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500">
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Número de doc. *</label>
              <input required value={form.numberDoc} onChange={e => setForm(f => ({ ...f, numberDoc: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="1234567890" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Teléfono *</label>
            <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="3001234567" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Dirección *</label>
            <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="Calle 5 # 10-20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ciudad *</label>
              <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="Mocoa" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Departamento *</label>
              <input required value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="Putumayo" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />Procesando...</>
            ) : (
              <>Pagar $39.900 con ePayco</>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 pt-2 text-gray-500 text-xs">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Pago seguro</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Sin permanencia</span>
          </div>
        </form>
      </div>
    </div>
  );
}
