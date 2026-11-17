"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query } from "firebase/firestore";
import Navbar from "@/components/Navbar";

interface Appointment {
  id: string;
  especialidad: string;
  doctor: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  notas?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Cargar datos del usuario
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setNombrePaciente(snap.data().nombre || user.email);
        } else {
          setNombrePaciente(user.email || "Paciente");
        }

        // Cargar las citas médicas para mostrarlas en el resumen
        const q = query(collection(db, "users", user.uid, "appointments"));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Appointment[];

        // Ordenar por fecha y hora
        list.sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());
        setAppointments(list);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoadingCitas(false);
      }
    };

    fetchDashboardData();
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200/80 pb-12">
      {/* Navbar superior */}
      <Navbar nombrePaciente={nombrePaciente} />

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner de cabecera */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-4 sm:p-8 shadow-lg text-white border border-orange-400/40">
          <h2 className="text-2xl sm:text-2xl font-extrabold tracking-tight">
            Panel de Control Clínico
          </h2>
          <p className="text-orange-100 text-sm sm:text-base mt-1">
            Gestiona tu tratamiento, ficha médica y citas de forma centralizada.
          </p>
        </div>

        {/* Tarjetas de acceso rápido (Las 5 tarjetas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/*ficha*/}
          <div 
            onClick={() => router.push("/dashboard/ficha")}
            className="bg-gradient-to-br from-white/90 to-orange-50/90 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border border-orange-200 border-l-4 border-l-orange-500"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-3">
              📋
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Ficha Médica</h3>
            <p className="text-sm text-gray-600">
              Actualiza tus datos clínicos, tipo de EM y neurólogo tratante.
            </p>
          </div>
          {/*historial*/}
          <div 
            onClick={() => router.push("/dashboard/historial")}
            className="bg-gradient-to-br from-white/90 to-orange-50/90 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border border-orange-200 border-l-4 border-l-orange-600"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-3">
              💊
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Historial y Exámenes</h3>
            <p className="text-sm text-gray-600">
              Registra tus medicamentos actuales, pasados y exámenes con documentos adjuntos.
            </p>
          </div>
          {/*como estoy*/}
          <div 
            onClick={() => router.push("/dashboard/comoestoy")}
            className="bg-gradient-to-br from-white/90 to-orange-50/90 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border border-orange-200 border-l-4 border-l-orange-500"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-3">
              ❤️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">¿Cómo estoy?</h3>
            <p className="text-sm text-gray-600">
              Registra tu estado diario por zonas corporales y síntomas de la EM.
            </p>
          </div>
          {/* calendario */}
          <div 
            onClick={() => router.push("/dashboard/alertas")}
            className="bg-gradient-to-br from-white/90 to-amber-50/90 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border border-orange-200 border-l-4 border-l-amber-500"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl mb-3">
              ⏰
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Alertas y Calendario</h3>
            <p className="text-sm text-gray-600">
              Programa recordatorios de toma de medicamentos y horas médicas.
            </p>
          </div>
           {/*brotes*/}
          <div 
            onClick={() => router.push("/dashboard/brotes")}
            className="bg-gradient-to-br from-white/90 to-orange-50/90 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border border-orange-200 border-l-4 border-l-orange-600"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-3">
              🚑
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Brotes</h3>
            <p className="text-sm text-gray-600">
              Registro y seguimiento de  tus Brotes.
            </p>
          </div>
          {/*evolucion*/}
          <div 
            onClick={() => router.push("/dashboard/evolucion")}
            className="bg-gradient-to-br from-white/90 to-orange-50/90 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border border-orange-200 border-l-4 border-l-orange-600"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-3">
              📈
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Evolucion</h3>
            <p className="text-sm text-gray-600">
              Tu evolucion en el tiempo.
            </p>
          </div>





        </div>


        

        {/* Sección exclusiva de Próximas Citas Médicas abajo de las tarjetas */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 sm:p-8 border border-orange-200/80">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-100 text-amber-700 rounded-lg text-lg">📅</span>
              <h3 className="text-xl font-bold text-gray-900">Tus Próximas Citas Médicas</h3>
            </div>
            <button
              onClick={() => router.push("/dashboard/alertas")}
              className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition shadow-xs"
            >
              + Programar Nueva Cita
            </button>
          </div>

          {loadingCitas ? (
            <div className="text-center py-6 text-sm text-gray-500">Cargando citas...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 bg-orange-50/40 rounded-xl border border-dashed border-orange-200">
              No tienes citas médicas agendadas. Haz clic en <span className="font-semibold text-orange-700">"Programar Nueva Cita"</span> para registrar una.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((app) => (
                <div key={app.id} className="p-4 border rounded-xl bg-amber-50/40 border-amber-200 flex flex-col gap-1 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                      {app.especialidad}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      📅 {app.fecha} ⏰ {app.hora}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mt-1">{app.doctor}</h4>
                  <p className="text-xs text-gray-600">📍 {app.ubicacion}</p>
                  {app.notas && <p className="text-xs text-gray-500 italic mt-1">Nota: {app.notas}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}