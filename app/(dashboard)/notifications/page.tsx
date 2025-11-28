"use client";

import { useState } from "react";
import { Bell, AlertCircle, Info, CheckCircle, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "error";
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Tiquetera por vencer",
      message: "La tiquetera de Juan Pérez vence en 5 días. Le quedan 10 sesiones.",
      type: "warning",
      isRead: false,
      createdAt: "2024-11-28T10:30:00",
    },
    {
      id: "2",
      title: "Nuevo miembro registrado",
      message: "María González se ha registrado exitosamente en el gimnasio.",
      type: "success",
      isRead: false,
      createdAt: "2024-11-28T09:15:00",
    },
    {
      id: "3",
      title: "Tiquetera expirada",
      message: "La tiquetera de Carlos Ruiz ha expirado. Contacta al miembro para renovación.",
      type: "error",
      isRead: true,
      createdAt: "2024-11-27T14:20:00",
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getColor = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      case "info":
        return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "success":
        return "text-green-500 bg-green-500/10 border-green-500/30";
      case "error":
        return "text-red-500 bg-red-500/10 border-red-500/30";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notificaciones</h1>
          <p className="text-gray-400">
            Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-500">
              Cuando recibas notificaciones, aparecerán aquí
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gray-900 border rounded-xl p-6 transition-all ${
                notification.isRead
                  ? 'border-gray-800 opacity-60'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold mb-1">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(notification.createdAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Marcar como leída"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-300">{notification.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
