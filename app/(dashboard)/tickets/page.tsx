"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Calendar, DollarSign, X } from "lucide-react";

interface TicketPackage {
  id: string;
  name: string;
  total_sessions: number;
  validity_days: number;
  price: number;
  is_active: number;
}

const emptyForm = { name: "", total_sessions: 30, validity_days: 30, price: 0 };

export default function TicketsPage() {
  const [packages, setPackages] = useState<TicketPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TicketPackage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/tickets");
    const data = await res.json() as TicketPackage[];
    setPackages(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  function openCreate() {
    setEditingPackage(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  }

  function openEdit(pkg: TicketPackage) {
    setEditingPackage(pkg);
    setForm({ name: pkg.name, total_sessions: pkg.total_sessions, validity_days: pkg.validity_days, price: pkg.price });
    setError(null);
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    setPackages(prev => prev.filter(p => p.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const method = editingPackage ? "PUT" : "POST";
    const url = editingPackage ? `/api/tickets/${editingPackage.id}` : "/api/tickets";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Error al guardar");
      return;
    }

    setShowModal(false);
    fetchPackages();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tiqueteras</h1>
          <p className="text-gray-400">Gestiona los paquetes de sesiones</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Tiquetera
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Cargando tiqueteras...</div>
      ) : packages.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No hay tiqueteras. Crea la primera.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{pkg.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    pkg.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {pkg.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <TicketIcon className="w-5 h-5 text-purple-500" />
                  <span>{pkg.total_sessions} sesiones</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span>Válido por {pkg.validity_days} días</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-white">${pkg.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingPackage ? "Editar" : "Nueva"} Tiquetera
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del paquete *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="Ej: Paquete Básico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Número de sesiones</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.total_sessions}
                  onChange={e => setForm(f => ({ ...f, total_sessions: Number(e.target.value) }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Días de validez</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.validity_days}
                  onChange={e => setForm(f => ({ ...f, validity_days: Number(e.target.value) }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Precio</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {saving ? "Guardando..." : editingPackage ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
