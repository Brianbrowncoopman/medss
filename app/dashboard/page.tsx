"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [nombrePaciente, setNombrePaciente] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setNombrePaciente(snap.data().nombre || user.email);
      } else {
        setNombrePaciente(user.email || "Paciente");
      }
    };
    fetchUser();
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Superior */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">MediSS - Esclerosis Múltiple</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 hidden sm:inline">Hola, {nombrePaciente}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Panel de Control Clínico</h2>
          <p className="text-sm text-gray-600">Gestiona tu tratamiento, ficha médica y citas de forma centralizada.</p>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => router.push("/dashboard/ficha")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-indigo-600"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">📋 Ficha Médica</h3>
            <p className="text-sm text-gray-500">Actualiza tus datos clínicos, tipo de EM y neurólogo tratante.</p>
          </div>

          <div 
            onClick={() => router.push("/dashboard/historial")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-green-600"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">💊 Historial y Exámenes</h3>
            <p className="text-sm text-gray-500">Registra tus medicamentos actuales, pasados y exámenes con documentos adjuntos.</p>
          </div>

          <div 
            className="bg-white p-6 rounded-xl shadow-md border-l-4 border-amber-500 opacity-90"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">⏰ Alertas y Calendario</h3>
            <p className="text-sm text-gray-500">Programa recordatorios de toma de medicamentos y horas médicas.</p>
          </div>
        </div>

        {/* Sección de Calendario / Recordatorios Próximos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Próximos Eventos y Medicamentos</h3>
          <div className="p-8 text-center border-2 border-dashed rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Aquí visualizaremos tu calendario integrado con alertas de medicamentos y citas médicas.</p>
          </div>
        </div>
      </main>
    </div>
  );
}