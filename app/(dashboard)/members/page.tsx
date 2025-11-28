"use client";

import { useState } from "react";
import { Search, UserPlus, Edit, Trash2, Mail, Phone } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  joinedDate: string;
  ticketsActive: number;
}

export default function MembersPage() {
  const [members] = useState<Member[]>([
    {
      id: "1",
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+1234567890",
      status: "active",
      joinedDate: "2024-01-15",
      ticketsActive: 2,
    },
    {
      id: "2",
      name: "María González",
      email: "maria@example.com",
      phone: "+1234567891",
      status: "active",
      joinedDate: "2024-02-20",
      ticketsActive: 1,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Miembros</h1>
          <p className="text-gray-400">Gestiona los miembros del gimnasio</p>
        </div>
        <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          <UserPlus className="w-5 h-5" />
          Nuevo Miembro
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Members Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Nombre</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Contacto</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Estado</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Fecha de Registro</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Tiqueteras</th>
              <th className="text-right px-6 py-4 text-gray-400 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {member.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.status === 'active'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {member.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(member.joinedDate).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-semibold">{member.ticketsActive}</span>
                  <span className="text-gray-400 text-sm"> activas</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
