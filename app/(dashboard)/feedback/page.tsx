"use client";

import { useState } from "react";
import { MessageSquare, Send, AlertCircle, CheckCircle } from "lucide-react";

interface FeedbackItem {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
    {
      id: "1",
      subject: "Solicitud de nueva función",
      message: "Sería genial tener un sistema de estadísticas avanzadas para ver el progreso de los miembros.",
      category: "feature_request",
      priority: "normal",
      status: "pending",
      createdAt: "2024-11-20T10:00:00",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "feature_request",
    priority: "normal",
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setFeedbackList([newFeedback, ...feedbackList]);
    setFormData({
      subject: "",
      message: "",
      category: "feature_request",
      priority: "normal",
    });
    setShowForm(false);
    setSubmitSuccess(true);

    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      bug: "Error/Bug",
      feature_request: "Solicitud de función",
      question: "Pregunta",
      other: "Otro",
    };
    return labels[category] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-500/20 text-gray-400",
      normal: "bg-blue-500/20 text-blue-400",
      high: "bg-orange-500/20 text-orange-400",
      urgent: "bg-red-500/20 text-red-400",
    };
    return colors[priority] || colors.normal;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      in_progress: "bg-blue-500/20 text-blue-400",
      resolved: "bg-green-500/20 text-green-400",
      closed: "bg-gray-500/20 text-gray-400",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Feedback al Desarrollador</h1>
        <p className="text-gray-400">
          Envía tus sugerencias, reporta bugs o solicita nuevas funciones
        </p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-400">
            ¡Tu feedback ha sido enviado exitosamente! El desarrollador lo revisará pronto.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500/20 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">¿Necesitas ayuda o tienes ideas?</h3>
            <p className="text-gray-300 mb-4">
              Este espacio es para comunicarte directamente con el desarrollador del sistema.
              Puedes reportar problemas, sugerir mejoras o hacer preguntas sobre funcionalidades.
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Enviar Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Nuevo Feedback</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Asunto
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                placeholder="Ej: Agregar función de reportes mensuales"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="feature_request">Solicitud de función</option>
                  <option value="bug">Error/Bug</option>
                  <option value="question">Pregunta</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mensaje
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                placeholder="Describe tu sugerencia, problema o pregunta en detalle..."
              />
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
                Enviar Feedback
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback History */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Historial de Feedback</h2>

        <div className="space-y-4">
          {feedbackList.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No has enviado feedback aún</p>
            </div>
          ) : (
            feedbackList.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{feedback.subject}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryLabel(feedback.category)}`}>
                        {getCategoryLabel(feedback.category)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status === 'pending' ? 'Pendiente' : feedback.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{feedback.message}</p>
                    <p className="text-gray-500 text-xs">
                      Enviado el {new Date(feedback.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
