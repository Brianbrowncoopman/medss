"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Logo from "@/components/logo";

interface NavbarProps {
  nombrePaciente?: string;
  ubicacion?: string; // Permite pasar la ubicación por defecto o detectada
  indiceBienestar?: number;
}

export default function Navbar({ nombrePaciente,   }: NavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [fechaActual, setFechaActual] = useState("");
  const [indiceBienestar, setIndiceBienestar] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchUltimoIndice = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "sintomasDetallados"),
          orderBy("fechaHora", "desc"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const reg = snap.docs[0].data();
          
          // Cálculo automático del Índice de Bienestar (0 a 100, inverso)
          const sentir = reg.sentirGeneralEstado ?? 5;
          const fatiga = reg.fatigaIntensidad ?? reg.fatigaCronica ?? 0;
          const dolor = reg.dolorGlobalIntensidad ?? reg.cabezaDolorIntensidad ?? 0;
          const animo = reg.psicologicoAnimo ?? 5;

          const puntajeBase = ((sentir + animo) / 2) * 10;
          const penalizacion = ((fatiga + dolor) / 2) * 5;

          let indice = Math.round(puntajeBase - penalizacion);
          if (indice < 0) indice = 0;
          if (indice > 100) indice = 100;

          setIndiceBienestar(indice);
        }
      } catch (error) {
        console.error("Error al calcular índice en navbar:", error);
      }
    };

    fetchUltimoIndice();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Determinar color dinámico según el índice global de bienestar
  const getBadgeColor = (val: number) => {
    if (val >= 75) return "bg-green-100 text-green-800 border-green-300";
    if (val >= 40) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
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

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Indicador de Bienestar en el Navbar */}
        {indiceBienestar !== null && (
          <div 
            onClick={() => router.push("/dashboard/evolucion")}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer shadow-2xs transition hover:scale-105 ${getBadgeColor(indiceBienestar)}`}
            title="Haz clic para ver la evolución temporal detallada"
          >
            <span>📈 Bienestar:</span>
            <span className="text-sm font-black">{indiceBienestar}/100</span>
          </div>
        )}

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