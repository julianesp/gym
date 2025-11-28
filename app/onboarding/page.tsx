"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Building2, Mail, Phone, MapPin, Check } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gymName: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí iría la lógica para guardar en Supabase
    console.log("Datos del gimnasio:", formData);

    // Simular guardado y redirigir al dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Bienvenido a GymSaaS!
          </h1>
          <p className="text-gray-400">
            Configuremos tu gimnasio en solo unos minutos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Paso {step} de 2</span>
            <span className="text-sm text-red-500 font-medium">{step === 1 ? 50 : 100}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${step === 1 ? 50 : 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Información Básica
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Nombre del Gimnasio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.gymName}
                    onChange={(e) => handleInputChange('gymName', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Ej: FitZone Gym"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Describe tu gimnasio..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.gymName}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Información de Contacto
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Calle Principal 123"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email de Contacto *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="contacto@gimnasio.com"
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
                    type="submit"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Completar Configuración
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Features Preview */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">¿Qué incluye tu suscripción?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Gestión de miembros ilimitados',
              'Sistema de tiqueteras',
              'Control de asistencias',
              'Notificaciones automáticas',
              'Chat comunitario',
              'Análisis y reportes',
              'Soporte técnico',
              'Actualizaciones gratuitas'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
