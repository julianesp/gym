"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, DollarSign } from "lucide-react";

interface TicketPackage {
  id: string;
  name: string;
  sessions: number;
  validityDays: number;
  price: number;
  isActive: boolean;
}

export default function TicketsPage() {
  const [packages, setPackages] = useState<TicketPackage[]>([
    {
      id: "1",
      name: "Paquete Básico",
      sessions: 30,
      validityDays: 30,
      price: 50,
      isActive: true,
    },
    {
      id: "2",
      name: "Paquete Premium",
      sessions: 60,
      validityDays: 60,
      price: 90,
      isActive: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TicketPackage | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tiqueteras</h1>
          <p className="text-gray-400">Gestiona los paquetes de sesiones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Tiquetera
        </button>
      </div>

      {/* Packages Grid */}
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
                  pkg.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {pkg.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPackage(pkg);
                    setShowModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPackages(packages.filter(p => p.id !== pkg.id))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Ticket className="w-5 h-5 text-purple-500" />
                <span>{pkg.sessions} sesiones</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Válido por {pkg.validityDays} días</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-white">${pkg.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPackage ? 'Editar' : 'Nueva'} Tiquetera
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nombre del paquete
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="Ej: Paquete Básico"
                  defaultValue={editingPackage?.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Número de sesiones
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="30"
                  defaultValue={editingPackage?.sessions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Días de validez
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="30"
                  defaultValue={editingPackage?.validityDays}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="50.00"
                  defaultValue={editingPackage?.price}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingPackage ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Ticket({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
