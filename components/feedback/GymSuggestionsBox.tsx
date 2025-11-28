"use client";

import { useState } from "react";
import { Lightbulb, Send, CheckCircle } from "lucide-react";

export default function GymSuggestionsBox() {
  const [showForm, setShowForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "facilities",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí iría la lógica para enviar la sugerencia a Supabase
    console.log("Sugerencia enviada:", { ...formData, isAnonymous });

    setFormData({
      subject: "",
      message: "",
      category: "facilities",
    });
    setIsAnonymous(false);
    setShowForm(false);
    setSubmitSuccess(true);

    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {submitSuccess && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-400">
            ¡Tu sugerencia ha sido enviada! El gimnasio la revisará pronto.
          </p>
        </div>
      )}

      <div className="flex items-start gap-4 mb-6">
        <div className="bg-purple-500/20 p-3 rounded-lg">
          <Lightbulb className="w-6 h-6 text-purple-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2">Buzón de Sugerencias</h3>
          <p className="text-gray-400 text-sm mb-4">
            Comparte tus ideas para mejorar el gimnasio. Tu opinión es importante para nosotros.
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Enviar Sugerencia
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6 pt-6 border-t border-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Asunto (opcional)
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Ej: Mejorar el área de pesas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="facilities">Instalaciones</option>
              <option value="classes">Clases</option>
              <option value="staff">Personal</option>
              <option value="equipment">Equipamiento</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tu sugerencia *
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Describe tu sugerencia..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-400">
              Enviar de forma anónima
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
