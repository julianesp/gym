"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Dumbbell, Building2, Mail, Phone, MapPin, Check, CreditCard, Info } from "lucide-react";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    gymName: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    city: "",
    // Configuración de cobros del gym a sus miembros
    epaycoPublicKey: "",
    epaycoPrivateKey: "",
    nequiNumber: "",
    acceptsNequi: false,
    acceptsEpayco: false,
  });

  const set = (field: string, value: string | boolean) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymName: formData.gymName,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
        }),
      });

      const data = await res.json() as { gymId?: string; error?: string };

      if (!res.ok) throw new Error(data.error ?? "Error al guardar");

      // Guardar config de pagos del gym en D1 (si configuró algo)
      if (data.gymId && (formData.acceptsEpayco || formData.acceptsNequi)) {
        await fetch("/api/gym/payment-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gymId: data.gymId,
            epaycoPublicKey: formData.epaycoPublicKey,
            epaycoPrivateKey: formData.epaycoPrivateKey,
            nequiNumber: formData.nequiNumber,
            acceptsNequi: formData.acceptsNequi,
            acceptsEpayco: formData.acceptsEpayco,
          }),
        });
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSaving(false);
    }
  };

  const STEPS = [
    { n: 1, label: "Información básica" },
    { n: 2, label: "Contacto" },
    { n: 3, label: "Métodos de cobro" },
  ];

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500/10 p-4 rounded-full">
              <Dumbbell className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            ¡Bienvenido{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="text-gray-400">Configura tu gimnasio en 3 pasos</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step > s.n ? "bg-green-500 text-white" :
                step === s.n ? "bg-red-500 text-white" :
                "bg-gray-800 text-gray-500"
              }`}>
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-xs hidden sm:block ${step === s.n ? "text-white" : "text-gray-600"}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-2 ${step > s.n ? "bg-green-500" : "bg-gray-800"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-8">
          <div
            className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">

          {/* Paso 1 — Información básica */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-white">Información básica</h2>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Nombre del gimnasio *
                </label>
                <input
                  type="text" required
                  value={formData.gymName}
                  onChange={e => set("gymName", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Ej: FitZone Gym"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción (opcional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => set("description", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Describe brevemente tu gimnasio..."
                />
              </div>

              <button
                type="button"
                disabled={!formData.gymName.trim()}
                onClick={() => setStep(2)}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Paso 2 — Contacto */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-white">Información de contacto</h2>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Dirección *
                </label>
                <input
                  type="text" required
                  value={formData.address}
                  onChange={e => set("address", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Calle 5 # 10-20"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Ciudad *</label>
                <input
                  type="text" required
                  value={formData.city}
                  onChange={e => set("city", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Ej: Mocoa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono *
                  </label>
                  <input
                    type="tel" required
                    value={formData.phone}
                    onChange={e => set("phone", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="3001234567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email de contacto *
                  </label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={e => set("email", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="contacto@migym.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={!formData.address.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.city.trim()}
                  onClick={() => setStep(3)}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Paso 3 — Métodos de cobro */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Métodos de cobro a tus miembros</h2>
                <p className="text-sm text-gray-400">
                  Configura cómo quieres recibir los pagos de tiqueteras. Puedes omitir esto y configurarlo después en Ajustes.
                </p>
              </div>

              {/* ePayco */}
              <div className="border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">ePayco</p>
                      <p className="text-gray-500 text-xs">Tarjetas, PSE, Nequi vía ePayco</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("acceptsEpayco", !formData.acceptsEpayco)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.acceptsEpayco ? "bg-red-500" : "bg-gray-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.acceptsEpayco ? "left-7" : "left-1"}`} />
                  </button>
                </div>

                {formData.acceptsEpayco && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Obtén tus llaves en <strong className="ml-1">dashboard.epayco.co → Integración → API Keys</strong>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Llave pública *</label>
                      <input
                        type="text"
                        value={formData.epaycoPublicKey}
                        onChange={e => set("epaycoPublicKey", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Llave privada *</label>
                      <input
                        type="password"
                        value={formData.epaycoPrivateKey}
                        onChange={e => set("epaycoPrivateKey", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                        placeholder="••••••••••••••••••••••••••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Nequi */}
              <div className="border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">N</div>
                    <div>
                      <p className="text-white font-medium">Nequi</p>
                      <p className="text-gray-500 text-xs">Pago directo por número Nequi</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("acceptsNequi", !formData.acceptsNequi)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.acceptsNequi ? "bg-red-500" : "bg-gray-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.acceptsNequi ? "left-7" : "left-1"}`} />
                  </button>
                </div>

                {formData.acceptsNequi && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Número Nequi *</label>
                    <input
                      type="tel"
                      value={formData.nequiNumber}
                      onChange={e => set("nequiNumber", e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                      placeholder="3001234567"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Los miembros verán este número para hacer la transferencia manualmente.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</>
                  ) : (
                    <><Check className="w-5 h-5" />Completar configuración</>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-600">
                Puedes configurar o cambiar los métodos de cobro en cualquier momento desde Configuración.
              </p>
            </div>
          )}
        </div>

        {/* Features preview */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3 text-sm">Tu prueba gratuita de 7 días incluye:</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Miembros ilimitados",
              "Sistema de tiqueteras",
              "Control de asistencias",
              "Cobros a miembros",
              "Notificaciones automáticas",
              "Chat comunitario",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
