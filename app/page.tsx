import Link from "next/link";
import { Dumbbell, CheckCircle, Users, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Gestión de Miembros",
      description: "Administra fácilmente todos tus miembros en un solo lugar"
    },
    {
      icon: CheckCircle,
      title: "Control de Asistencias",
      description: "Registro automático de entradas y salidas con código QR"
    },
    {
      icon: Dumbbell,
      title: "Sistema de Tiqueteras",
      description: "Gestiona paquetes de sesiones con renovación automática"
    },
    {
      icon: TrendingUp,
      title: "Análisis y Reportes",
      description: "Estadísticas en tiempo real de tu gimnasio"
    },
    {
      icon: Zap,
      title: "Notificaciones Inteligentes",
      description: "Alertas automáticas para vencimiento de tiqueteras"
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-orange-500/20"></div>

        <nav className="relative border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-8 h-8 text-red-500" />
                <span className="text-2xl font-bold text-white">GymSaaS</span>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/sign-in"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Comenzar Gratis
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Gestiona tu Gimnasio
            <br />
            <span className="text-red-500">de Forma Inteligente</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            La plataforma completa para administrar miembros, tiqueteras, asistencias
            y más. Todo en un solo lugar.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Prueba Gratuita 30 Días
            </Link>
            <Link
              href="/sign-in"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-gray-700"
            >
              Ver Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Todo lo que necesitas para tu gimnasio
            </h2>
            <p className="text-xl text-gray-400">
              Funcionalidades diseñadas específicamente para gimnasios modernos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all"
              >
                <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-red-500/10 to-orange-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para transformar tu gimnasio?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a cientos de gimnasios que ya confían en GymSaaS
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            Comenzar Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-red-500" />
              <span className="text-gray-400">GymSaaS 2024</span>
            </div>
            <p className="text-gray-500 text-sm">
              Gestión inteligente para gimnasios modernos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
