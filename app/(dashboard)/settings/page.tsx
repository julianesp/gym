"use client";

import { useState } from "react";
import { Lightbulb, Mail, Eye, Trash2, CheckCircle } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"general" | "suggestions">("general");
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
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-4 font-medium transition-colors ${
              activeTab === "general"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`pb-4 font-medium transition-colors flex items-center gap-2 ${
              activeTab === "suggestions"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Buzón de Sugerencias
            {unreadSuggestions > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadSuggestions}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Información del Gimnasio</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nombre del Gimnasio
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Mi Gimnasio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Calle Principal 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="contacto@gimnasio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Describe tu gimnasio..."
                />
              </div>

              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
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
