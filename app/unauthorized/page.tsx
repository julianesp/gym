import Link from "next/link";
import { ShieldX, Home, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-500/10 p-6 rounded-full">
              <ShieldX className="w-16 h-16 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Acceso Restringido
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-8">
            Lo sentimos, no tienes permisos para acceder a esta área del sistema.
            Si eres dueño de un gimnasio, primero debes completar el registro de tu gimnasio.
          </p>

          {/* User Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-400 mb-3">Sesión actual:</p>
            <div className="flex items-center justify-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>

            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-gray-700"
            >
              <LogOut className="w-5 h-5" />
              Cambiar de Cuenta
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
