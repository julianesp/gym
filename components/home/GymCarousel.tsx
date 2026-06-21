"use client";

import { useEffect, useRef } from "react";
import { Dumbbell } from "lucide-react";

interface Gym {
  name: string;
  city: string;
  initials: string;
  color: string;
}

// Lista estática de gimnasios de demostración.
// En producción, estos datos vendrán de la tabla `gyms` en D1.
const DEMO_GYMS: Gym[] = [
  { name: "FitZone Premium", city: "Bogotá", initials: "FZ", color: "bg-red-500" },
  { name: "Iron House Gym", city: "Medellín", initials: "IH", color: "bg-orange-500" },
  { name: "Power Gym", city: "Cali", initials: "PG", color: "bg-yellow-500" },
  { name: "Elite Fitness", city: "Barranquilla", initials: "EF", color: "bg-green-500" },
  { name: "CrossFit Norte", city: "Bucaramanga", initials: "CN", color: "bg-blue-500" },
  { name: "Muscle Factory", city: "Cartagena", initials: "MF", color: "bg-purple-500" },
  { name: "Pro Gym Center", city: "Pereira", initials: "PC", color: "bg-pink-500" },
  { name: "Olimpo Fitness", city: "Manizales", initials: "OF", color: "bg-teal-500" },
];

export default function GymCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Animación CSS pura — sin dependencias externas
  return (
    <section className="py-20 bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <p className="text-sm text-red-400 font-semibold uppercase tracking-widest mb-3">
          Gimnasios que confían en nosotros
        </p>
        <h2 className="text-3xl font-bold text-white">
          Parte de una comunidad en crecimiento
        </h2>
      </div>

      {/* Carrusel infinito con CSS animation */}
      <div className="relative">
        {/* Fade izquierda */}
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        {/* Fade derecha */}
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        <div className="flex" style={{ maskImage: "none" }}>
          <div
            ref={trackRef}
            className="flex gap-6 animate-marquee"
            style={{ willChange: "transform" }}
          >
            {/* Duplicamos la lista para el efecto infinito */}
            {[...DEMO_GYMS, ...DEMO_GYMS].map((gym, i) => (
              <GymCard key={i} gym={gym} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function GymCard({ gym }: { gym: Gym }) {
  return (
    <div className="flex-shrink-0 w-56 bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-red-500/40 transition-colors">
      <div className={`${gym.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white font-bold text-lg`}>
        {gym.initials}
      </div>
      <p className="text-white font-semibold text-sm leading-tight">{gym.name}</p>
      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
        <Dumbbell className="w-3 h-3" />
        {gym.city}
      </p>
    </div>
  );
}
