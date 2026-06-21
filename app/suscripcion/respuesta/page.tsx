"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Dumbbell } from "lucide-react";

function RespuestaContent() {
  const params = useSearchParams();
  const estado = params.get("x_transaction_state") ?? params.get("estado");
  const referencia = params.get("x_id_invoice") ?? params.get("ref_payco");

  const esAprobado = estado === "Aceptada";
  const esPendiente = estado === "Pendiente";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-900 p-4 rounded-full">
            <Dumbbell className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {esAprobado ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">¡Pago exitoso!</h1>
            <p className="text-gray-400 mb-6">
              Tu suscripción a GymSaaS está activa. Bienvenido a bordo.
            </p>
            <Link href="/dashboard"
              className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Ir al Dashboard
            </Link>
          </>
        ) : esPendiente ? (
          <>
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Pago pendiente</h1>
            <p className="text-gray-400 mb-6">
              Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.
            </p>
            <Link href="/dashboard"
              className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Volver al Dashboard
            </Link>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Pago no completado</h1>
            <p className="text-gray-400 mb-6">
              Hubo un problema con tu pago. Puedes intentarlo nuevamente.
            </p>
            <Link href="/suscripcion"
              className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Intentar de nuevo
            </Link>
          </>
        )}

        {referencia && (
          <p className="text-gray-600 text-xs mt-6">Referencia: {referencia}</p>
        )}
      </div>
    </div>
  );
}

export default function RespuestaPage() {
  return (
    <Suspense>
      <RespuestaContent />
    </Suspense>
  );
}
