"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface RegistroHistorico {
  id: string;
  fechaHora: string;
  sentirGeneralEstado?: number;
  fatigaCronica?: number;
  fatigaIntensidad?: number;
  dolorGlobalIntensidad?: number;
  cabezaDolorIntensidad?: number;
  psicologicoAnimo?: number;
  psicologicoHumorMalGenio?: number;
  suenoCalidad?: number;
  cognicionLagunas?: number;
  notasGenerales?: string;
}

export default function EvolucionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [loading, setLoading] = useState(true);
  const [historialRegistros, setHistorialRegistros] = useState<RegistroHistorico[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchEvolucionData();
  }, [user, router]);

  const fetchEvolucionData = async () => {
    try {
      const userSnap = await getDoc(doc(db, "users", user!.uid));
      if (userSnap.exists()) {
        setNombrePaciente(userSnap.data().nombre || user!.email || "Paciente");
      } else {
        setNombrePaciente(user!.email || "Paciente");
      }

      const q = query(
        collection(db, "users", user!.uid, "sintomasDetallados"),
        orderBy("fechaHora", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as RegistroHistorico[];
      setHistorialRegistros(list);
    } catch (error) {
      console.error("Error al cargar datos de evolución:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular el Índice Global de Bienestar (0 a 100, inverso a los síntomas)
  const calcularIndiceBienestar = (reg: RegistroHistorico) => {
    const sentir = reg.sentirGeneralEstado ?? 5; // 0-10
    const fatiga = reg.fatigaIntensidad ?? reg.fatigaCronica ?? 0; // 0-10
    const dolor = reg.dolorGlobalIntensidad ?? reg.cabezaDolorIntensidad ?? 0; // 0-10
    const animo = reg.psicologicoAnimo ?? 5; // 0-10

    const puntajeBase = ((sentir + animo) / 2) * 10; // Escala 0-100
    const penalizacion = ((fatiga + dolor) / 2) * 5; // Penaliza las afecciones

    let indice = Math.round(puntajeBase - penalizacion);
    if (indice < 0) indice = 0;
    if (indice > 100) indice = 100;
    return indice;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-700 font-medium bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200">
        Cargando evolución temporal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50/70 to-orange-200/80 pb-12">
      <Navbar nombrePaciente={nombrePaciente} />

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Cabecera del Módulo */}
        <div className="flex justify-between items-center bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-orange-200">
          <div>
            <span className="text-xs font-bold text-orange-800 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Módulo Clínico
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              📈 Evolución Temporal y Bienestar
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Seguimiento histórico de tus registros. El <b>Índice Global (0-100)</b> aumenta a mayor bienestar y disminuye ante la presencia de síntomas o afecciones.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2.5 bg-white border border-orange-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition shadow-xs cursor-pointer"
          >
            Volver
          </button>
        </div>

        {/* Listado de Evolución y Tarjetas Temporales */}
        <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-orange-200 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-orange-200">
            Historial Cronológico de Registros ({historialRegistros.length})
          </h2>

          {historialRegistros.length === 0 ? (
            <div className="text-center py-12 bg-white/60 rounded-2xl border border-orange-100 space-y-3">
              <p className="text-sm text-gray-500 italic">No hay registros en la bitácora todavía para generar la evolución.</p>
              <button
                onClick={() => router.push("/dashboard/como-estoy")}
                className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition"
              >
                Crear mi primer registro de síntomas
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
              {historialRegistros.map((reg) => {
                const bienestar = calcularIndiceBienestar(reg);
                const colorBanda =
                  bienestar >= 75
                    ? "border-green-300 bg-green-50/60 text-green-900"
                    : bienestar >= 40
                    ? "border-amber-300 bg-amber-50/60 text-amber-900"
                    : "border-red-300 bg-red-50/60 text-red-900";

                return (
                  <div
                    key={reg.id}
                    className={`p-5 rounded-2xl border-2 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white ${colorBanda}`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold bg-orange-100 text-orange-900 px-3 py-1 rounded-full inline-block">
                        📅 {reg.fechaHora.replace("T", " - Hora: ")}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 text-gray-700 font-medium">
                        <p>🌟 Sentir General: <b>{reg.sentirGeneralEstado ?? 5}/10</b></p>
                        <p>⚡ Fatiga: <b>{reg.fatigaIntensidad ?? reg.fatigaCronica ?? 0}/10</b></p>
                        <p>🩹 Dolor: <b>{reg.dolorGlobalIntensidad ?? reg.cabezaDolorIntensidad ?? 0}/10</b></p>
                        <p>😊 Ánimo: <b>{reg.psicologicoAnimo ?? 5}/10</b></p>
                      </div>
                      {reg.notasGenerales && (
                        <p className="text-xs text-gray-600 italic pt-1">
                          💬 <b>Notas:</b> {reg.notasGenerales}
                        </p>
                      )}
                    </div>

                    <div className="text-center bg-white px-5 py-3 rounded-2xl border border-orange-200 shadow-2xs min-w-[140px]">
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Índice Bienestar</p>
                      <p className="text-2xl font-black text-gray-900">{bienestar}<span className="text-xs font-normal">/100</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}