"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, Search, Calendar } from "lucide-react";

interface Attendance {
  id: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  ticketType: string;
  sessionsRemaining: number;
}

export default function AttendancePage() {
  const [attendances] = useState<Attendance[]>([
    {
      id: "1",
      memberName: "Juan Pérez",
      checkInTime: "2024-11-28T08:30:00",
      checkOutTime: "2024-11-28T10:00:00",
      ticketType: "Paquete Básico",
      sessionsRemaining: 25,
    },
    {
      id: "2",
      memberName: "María González",
      checkInTime: "2024-11-28T09:15:00",
      ticketType: "Paquete Premium",
      sessionsRemaining: 52,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [checkInCode, setCheckInCode] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Control de Asistencias</h1>
        <p className="text-gray-400">Registra el ingreso y salida de miembros</p>
      </div>

      {/* Check-in Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">Registrar Entrada</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Escanea código QR o ingresa ID de miembro"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
            />
            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Registrar Entrada
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500/20 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">Registrar Salida</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Escanea código QR o ingresa ID de miembro"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            />
            <button className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Registrar Salida
            </button>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-gray-400">Asistencias Hoy</h3>
          </div>
          <p className="text-3xl font-bold text-white">47</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-gray-400">Actualmente Dentro</h3>
          </div>
          <p className="text-3xl font-bold text-white">12</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-400">Promedio Mensual</h3>
          </div>
          <p className="text-3xl font-bold text-white">38</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar asistencias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Attendance History */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Historial de Asistencias</h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Miembro</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Entrada</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Salida</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Tipo de Ticket</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Sesiones Restantes</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((attendance) => (
              <tr key={attendance.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {attendance.memberName.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{attendance.memberName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(attendance.checkInTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {attendance.checkOutTime
                    ? new Date(attendance.checkOutTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </td>
                <td className="px-6 py-4 text-gray-300">{attendance.ticketType}</td>
                <td className="px-6 py-4">
                  <span className="text-white font-semibold">{attendance.sessionsRemaining}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    attendance.checkOutTime
                      ? 'bg-gray-500/20 text-gray-400'
                      : 'bg-green-500/20 text-green-500'
                  }`}>
                    {attendance.checkOutTime ? 'Completado' : 'En gimnasio'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
