"use client";

import { useState } from "react";
import { Search, UserPlus, Edit, Trash2, Mail, Phone, X } from "lucide-react";
import { getDB } from "@/lib/db/client";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  joinedDate: string;
  ticketsActive: number;
}

interface NewMemberForm {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact: string;
  emergency_phone: string;
}

const emptyForm: NewMemberForm = {
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  emergency_contact: "",
  emergency_phone: "",
};

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
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewMemberForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Error al crear el miembro");
        return;
      }

      setShowModal(false);
      setForm(emptyForm);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Miembros</h1>
          <p className="text-gray-400">Gestiona los miembros del gimnasio</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Miembro
        </button>
      </div>

      {/* Modal Nuevo Miembro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Nuevo Miembro</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fecha de nacimiento</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Contacto de emergencia</label>
                    <input
                      type="text"
                      name="emergency_contact"
                      value={form.emergency_contact}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Teléfono emergencia</label>
                    <input
                      type="tel"
                      name="emergency_phone"
                      value={form.emergency_phone}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? "Guardando..." : "Crear miembro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
