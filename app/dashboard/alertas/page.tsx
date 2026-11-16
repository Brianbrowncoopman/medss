"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CalendarView from "@/components/CalendarView";

export default function AlertasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchUser = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setNombrePaciente(snap.data().nombre || user.email);
        } else {
          setNombrePaciente(user.email || "Paciente");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center text-orange-700 font-medium">
        Cargando calendario y alertas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50/70 to-orange-200/80 pb-12">
      <Navbar nombrePaciente={nombrePaciente} />

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Agenda de Citas y Alertas Clínicas</h1>
            <p className="text-sm text-gray-600">Programa controles y mantén sincronizados tus recordatorios.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2.5 bg-white border border-orange-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition shadow-xs inline-flex items-center cursor-pointer"
          >
            Volver al Panel
          </button>
        </div>

        <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-orange-200">
          <CalendarView />
        </div>
      </main>
    </div>
  );
}