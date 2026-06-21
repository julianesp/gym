"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Mail, Eye, Trash2, CreditCard, Info } from "lucide-react";

interface Suggestion {
  id: string;
  memberName: string;
  subject?: string;
  message: string;
  category: string;
  isAnonymous: boolean;
  isRead: boolean;
  status: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "payments" | "suggestions">("general");

  // General form
  const [gymForm, setGymForm] = useState({ name: "", description: "", address: "", city: "", phone: "", email: "" });
  const [savingGym, setSavingGym] = useState(false);
  const [gymMsg, setGymMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/gym/profile")
      .then(r => r.json() as Promise<{ gym?: { name: string; description: string; address: string; city: string; phone: string; email: string } | null }>)
      .then((data) => {
        if (data.gym) setGymForm({ name: data.gym.name ?? "", description: data.gym.description ?? "", address: data.gym.address ?? "", city: data.gym.city ?? "", phone: data.gym.phone ?? "", email: data.gym.email ?? "" });
      })
      .catch(() => {});
  }, []);

  const handleSaveGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGym(true);
    setGymMsg(null);
    try {
      const res = await fetch("/api/gym/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(gymForm) });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setGymMsg({ type: "ok", text: "Cambios guardados correctamente." });
    } catch (err) {
      setGymMsg({ type: "err", text: err instanceof Error ? err.message : "Error desconocido" });
    } finally {
      setSavingGym(false);
    }
  };

  const [paymentForm, setPaymentForm] = useState({
    acceptsEpayco: false,
    epaycoPublicKey: "",
    epaycoPrivateKey: "",
    acceptsNequi: false,
    nequiNumber: "",
  });
  const [savingPayments, setSavingPayments] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const setP = (field: string, value: string | boolean) =>
    setPaymentForm(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    fetch("/api/gym/payment-config")
      .then(r => r.json() as Promise<{ config?: { epayco_public_key?: string; nequi_number?: string; accepts_nequi?: number; accepts_epayco?: number } | null }>)
      .then((data) => {
        if (data.config) {
          setPaymentForm(prev => ({
            ...prev,
            acceptsEpayco: !!data.config?.accepts_epayco,
            epaycoPublicKey: data.config?.epayco_public_key ?? "",
            acceptsNequi: !!data.config?.accepts_nequi,
            nequiNumber: data.config?.nequi_number ?? "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePayments = async () => {
    setSavingPayments(true);
    setPaymentMsg(null);
    try {
      const res = await fetch("/api/gym/payment-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setPaymentMsg({ type: "ok", text: "Configuración guardada correctamente." });
    } catch (err) {
      setPaymentMsg({ type: "err", text: err instanceof Error ? err.message : "Error desconocido" });
    } finally {
      setSavingPayments(false);
    }
  };
  const [suggestions] = useState<Suggestion[]>([
    {
      id: "1",
      memberName: "Juan Pérez",
      subject: "Mejorar ventilación",
      message: "Sería bueno mejorar la ventilación en el área de cardio, especialmente en las tardes cuando hay más gente.",
      category: "facilities",
      isAnonymous: false,
      isRead: false,
      status: "pending",
      createdAt: "2024-11-27T14:30:00",
    },
    {
      id: "2",
      memberName: "Anónimo",
      message: "Me gustaría que hubiera más clases de yoga en la mañana.",
      category: "classes",
      isAnonymous: true,
      isRead: false,
      status: "pending",
      createdAt: "2024-11-26T10:00:00",
    },
  ]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      facilities: "Instalaciones",
      classes: "Clases",
      staff: "Personal",
      equipment: "Equipamiento",
      other: "Otro",
    };
    return labels[category] || category;
  };

  const unreadSuggestions = suggestions.filter(s => !s.isRead).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-gray-400">Gestiona tu gimnasio y revisa sugerencias</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex gap-8">
          {(["general", "payments", "suggestions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "general" && "General"}
              {tab === "payments" && "Métodos de cobro"}
              {tab === "suggestions" && (
                <>
                  Buzón de Sugerencias
                  {unreadSuggestions > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadSuggestions}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Información del Gimnasio</h2>
            <form onSubmit={handleSaveGym} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del Gimnasio</label>
                <input
                  type="text"
                  value={gymForm.name}
                  onChange={e => setGymForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Mi Gimnasio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Dirección</label>
                <input
                  type="text"
                  value={gymForm.address}
                  onChange={e => setGymForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Calle Principal 123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={gymForm.city}
                  onChange={e => setGymForm(p => ({ ...p, city: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Ej: Mocoa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={gymForm.phone}
                    onChange={e => setGymForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="3001234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={gymForm.email}
                    onChange={e => setGymForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="contacto@gimnasio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
                <textarea
                  rows={4}
                  value={gymForm.description}
                  onChange={e => setGymForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Describe tu gimnasio..."
                />
              </div>

              {gymMsg && (
                <p className={`text-sm px-4 py-2 rounded-lg border ${gymMsg.type === "ok" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                  {gymMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={savingGym}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {savingGym ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="space-y-6 max-w-2xl">
          <p className="text-gray-400 text-sm">
            Configura cómo tus miembros te pagan las tiqueteras. Puedes activar uno o ambos métodos.
          </p>

          {/* ePayco */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
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
                onClick={() => setP("acceptsEpayco", !paymentForm.acceptsEpayco)}
                className={`w-12 h-6 rounded-full transition-colors relative ${paymentForm.acceptsEpayco ? "bg-red-500" : "bg-gray-700"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${paymentForm.acceptsEpayco ? "left-7" : "left-1"}`} />
              </button>
            </div>
            {paymentForm.acceptsEpayco && (
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Obtén tus llaves en <strong className="ml-1">dashboard.epayco.co → Integración → API Keys</strong>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Llave pública *</label>
                  <input
                    type="text"
                    value={paymentForm.epaycoPublicKey}
                    onChange={e => setP("epaycoPublicKey", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Llave privada *</label>
                  <input
                    type="password"
                    value={paymentForm.epaycoPrivateKey}
                    onChange={e => setP("epaycoPrivateKey", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    placeholder="••••••••••••••••••••••••••••••••"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Nequi */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
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
                onClick={() => setP("acceptsNequi", !paymentForm.acceptsNequi)}
                className={`w-12 h-6 rounded-full transition-colors relative ${paymentForm.acceptsNequi ? "bg-red-500" : "bg-gray-700"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${paymentForm.acceptsNequi ? "left-7" : "left-1"}`} />
              </button>
            </div>
            {paymentForm.acceptsNequi && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Número Nequi *</label>
                <input
                  type="tel"
                  value={paymentForm.nequiNumber}
                  onChange={e => setP("nequiNumber", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="3001234567"
                />
                <p className="text-gray-500 text-xs mt-1">Los miembros verán este número para hacer la transferencia.</p>
              </div>
            )}
          </div>

          {paymentMsg && (
            <p className={`text-sm px-4 py-2 rounded-lg border ${
              paymentMsg.type === "ok"
                ? "text-green-400 bg-green-500/10 border-green-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}>{paymentMsg.text}</p>
          )}

          <button
            type="button"
            onClick={handleSavePayments}
            disabled={savingPayments}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {savingPayments ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === "suggestions" && (
        <div className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Lightbulb className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Buzón de Sugerencias</h3>
                <p className="text-gray-300">
                  Aquí verás todas las sugerencias que tus miembros envíen.
                  Estas son enviadas directamente a ti, no al desarrollador del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No hay sugerencias aún
                </h3>
                <p className="text-gray-500">
                  Cuando tus miembros envíen sugerencias, aparecerán aquí
                </p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`bg-gray-900 border rounded-xl p-6 transition-all ${
                    suggestion.isRead
                      ? 'border-gray-800 opacity-60'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {suggestion.isAnonymous ? "?" : suggestion.memberName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {suggestion.isAnonymous ? "Sugerencia Anónima" : suggestion.memberName}
                            {!suggestion.isRead && (
                              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                              {getCategoryLabel(suggestion.category)}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(suggestion.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {suggestion.subject && (
                        <h4 className="text-white font-medium mb-2">{suggestion.subject}</h4>
                      )}
                      <p className="text-gray-300">{suggestion.message}</p>

                      {!suggestion.isAnonymous && (
                        <div className="mt-4 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <button className="text-sm text-blue-400 hover:text-blue-300">
                            Responder al miembro
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!suggestion.isRead && (
                        <button
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Marcar como leída"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
