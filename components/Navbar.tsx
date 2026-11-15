"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "@/components/logo";

interface NavbarProps {
  nombrePaciente?: string;
  bicacion?: string; // Permite pasar la ubicación por defecto o detectada
}

export default function Navbar({ nombrePaciente,  }: NavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [fechaActual, setFechaActual] = useState("");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-orange-100 px-6 py-3 flex justify-between items-center">
      <div 
        onClick={() => router.push("/dashboard")} 
        className="flex items-center gap-3 cursor-pointer"
      >
        <Logo className="w-10 h-10" />
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
            Med<span className="text-orange-600">S</span>
          </span>
          <span className="text-[10px] text-orange-700 font-semibold uppercase tracking-wider mt-0.5">
            Esclerosis Múltiple
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {nombrePaciente && (
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            Hola, <span className="text-orange-600 font-semibold">{nombrePaciente}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-100 transition border border-orange-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}