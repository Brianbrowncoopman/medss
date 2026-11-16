"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface RegistroDetalladoEM {
  id?: string;
  fechaHora: string;
  
  // 1. Cabeza y Sentidos
  cabezaDolorIntensidad: number;
  cabezaDolorTipo: string;
  visionDoble: boolean;
  visionBorrosa: boolean;
  visionPerdidaFoco: boolean;
  mareosVertigo: number;

  // 2. Extremidades Superiores
  brazoDerechoDebilidad: number;
  brazoDerechoSensacion: string;
  brazoIzquierdoDebilidad: number;
  brazoIzquierdoSensacion: string;

  // 3. Tronco y Columna
  signoLhermitte: boolean;
  dolorEspaldaEspasticidad: number;

  // 4. Extremidades Inferiores y Movilidad (Separadas)
  piernaDerechaDebilidad: number;
  piernaDerechaEspasticidad: number;
  piernaIzquierdaDebilidad: number;
  piernaIzquierdaEspasticidad: number;
  problemasEquilibrioAtaxia: number;

  // 5. Generales y Autonómicos
  fatigaCronica: number;
  controlEsfinteres: number;
  cognicionNieblaMental: number;
  
  notasGenerales: string;
}

export default function ComoEstoyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [historialRegistros, setHistorialRegistros] = useState<RegistroDetalladoEM[]>([]);
  const [modoHistorial, setModoHistorial] = useState(false);

  const [formData, setFormData] = useState<RegistroDetalladoEM>({
    fechaHora: new Date().toISOString().slice(0, 16),
    cabezaDolorIntensidad: 0,
    cabezaDolorTipo: "Ninguno",
    visionDoble: false,
    visionBorrosa: false,
    visionPerdidaFoco: false,
    mareosVertigo: 0,
    brazoDerechoDebilidad: 0,
    brazoDerechoSensacion: "Normal",
    brazoIzquierdoDebilidad: 0,
    brazoIzquierdoSensacion: "Normal",
    signoLhermitte: false,
    dolorEspaldaEspasticidad: 0,
    piernaDerechaDebilidad: 0,
    piernaDerechaEspasticidad: 0,
    piernaIzquierdaDebilidad: 0,
    piernaIzquierdaEspasticidad: 0,
    problemasEquilibrioAtaxia: 0,
    fatigaCronica: 0,
    controlEsfinteres: 0,
    cognicionNieblaMental: 0,
    notasGenerales: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchUserDataAndHistory();
  }, [user, router]);

  const fetchUserDataAndHistory = async () => {
    try {
      // Cargar datos del usuario para el Navbar de forma independiente
      const userSnap = await getDoc(doc(db, "users", user!.uid));
      if (userSnap.exists()) {
        setNombrePaciente(userSnap.data().nombre || user!.email || "Paciente");
      } else {
        setNombrePaciente(user!.email || "Paciente");
      }

      // Cargar historial de síntomas detallados
      const q = query(collection(db, "users", user!.uid, "sintomasDetallados"), orderBy("fechaHora", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as RegistroDetalladoEM));
      setHistorialRegistros(list);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setGuardando(true);

    try {
      await addDoc(collection(db, "users", user.uid, "sintomasDetallados"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      alert("¡Registro clínico detallado guardado con éxito!");
      setModoHistorial(true);
      fetchUserDataAndHistory();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al registrar los datos.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-orange-700 font-medium">Cargando bitácora clínica...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50/70 to-orange-200/80 pb-12">
      {/* Navbar con el nombre del paciente sincronizado */}
      <Navbar nombrePaciente={nombrePaciente} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Bitácora de Síntomas y Afecciones - EM</h1>
            <p className="text-sm text-gray-600">Registro anatómico detallado para control médico y evaluación de brotes.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModoHistorial(!modoHistorial)}
              className="px-4 py-2.5 bg-white border border-orange-300 text-orange-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition shadow-xs cursor-pointer"
            >
              {modoHistorial ? "✍️ Nuevo Registro" : "📊 Ver Historial"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2.5 bg-white border border-orange-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition shadow-xs cursor-pointer"
            >
              Volver
            </button>
          </div>
        </div>

        {!modoHistorial ? (
          <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-orange-200">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Fecha y Hora */}
              <div className="p-4 bg-orange-100/60 rounded-xl border border-orange-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Fecha y Hora del Registro</h3>
                  <p className="text-xs text-gray-600">Ajusta si estás registrando un episodio pasado.</p>
                </div>
                <input
                  type="datetime-local"
                  required
                  value={formData.fechaHora}
                  onChange={(e) => setFormData({ ...formData, fechaHora: e.target.value })}
                  className="px-3.5 py-2 border border-orange-300 rounded-xl bg-white text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* SECCIÓN 1: Cabeza, Rostro y Visión */}
              <div className="space-y-4 p-5 bg-white/80 rounded-2xl border border-orange-200 shadow-2xs">
                <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                  1. Cabeza, Rostro y Visión (Neuritis Óptica / Trigémino)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Intensidad de Dolor de Cabeza / Facial (0-10)</label>
                    <input
                      type="number" min="0" max="10"
                      value={formData.cabezaDolorIntensidad}
                      onChange={(e) => setFormData({ ...formData, cabezaDolorIntensidad: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Dolor</label>
                    <select
                      value={formData.cabezaDolorTipo}
                      onChange={(e) => setFormData({ ...formData, cabezaDolorTipo: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm bg-white"
                    >
                      <option value="Ninguno">Ninguno</option>
                      <option value="Punzante">Punzante</option>
                      <option value="Sordo / Opresivo">Sordo / Opresivo</option>
                      <option value="Neuralgia del Trigémino (Corriente)">Neuralgia del Trigémino</option>
                      <option value="Migraña">Migraña</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                    <input
                      type="checkbox"
                      checked={formData.visionDoble}
                      onChange={(e) => setFormData({ ...formData, visionDoble: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span>👁️ Visión Doble (Diplopía)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                    <input
                      type="checkbox"
                      checked={formData.visionBorrosa}
                      onChange={(e) => setFormData({ ...formData, visionBorrosa: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span>🌫️ Visión Borrosa</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                    <input
                      type="checkbox"
                      checked={formData.visionPerdidaFoco}
                      onChange={(e) => setFormData({ ...formData, visionPerdidaFoco: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span>🎯 Pérdida de Foco / Nubarrones</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mareos / Vértigo (0-10): <b>{formData.mareosVertigo}</b></label>
                  <input
                    type="range" min="0" max="10" value={formData.mareosVertigo}
                    onChange={(e) => setFormData({ ...formData, mareosVertigo: Number(e.target.value) })}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECCIÓN 2: Extremidades Superiores */}
              <div className="space-y-4 p-5 bg-white/80 rounded-2xl border border-orange-200 shadow-2xs">
                <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                  2. Extremidades Superiores (Brazos, Manos, Dedos)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Brazo Derecho */}
                  <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900">Brazo Derecho</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Debilidad (0-10): <b>{formData.brazoDerechoDebilidad}</b></label>
                      <input
                        type="range" min="0" max="10" value={formData.brazoDerechoDebilidad}
                        onChange={(e) => setFormData({ ...formData, brazoDerechoDebilidad: Number(e.target.value) })}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Sensación / Parestesia</label>
                      <select
                        value={formData.brazoDerechoSensacion}
                        onChange={(e) => setFormData({ ...formData, brazoDerechoSensacion: e.target.value })}
                        className="w-full px-3 py-1.5 border border-orange-200 rounded-lg text-xs bg-white"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Hormigueo">Hormigueo (Punzadas)</option>
                        <option value="Adormecimiento">Adormecimiento (Entumecimiento)</option>
                        <option value="Ardor / Quemazón">Ardor / Quemazón</option>
                        <option value="Temblor al agarrar objetos">Temblor de acción</option>
                      </select>
                    </div>
                  </div>

                  {/* Brazo Izquierdo */}
                  <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900">Brazo Izquierdo</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Debilidad (0-10): <b>{formData.brazoIzquierdoDebilidad}</b></label>
                      <input
                        type="range" min="0" max="10" value={formData.brazoIzquierdoDebilidad}
                        onChange={(e) => setFormData({ ...formData, brazoIzquierdoDebilidad: Number(e.target.value) })}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Sensación / Parestesia</label>
                      <select
                        value={formData.brazoIzquierdoSensacion}
                        onChange={(e) => setFormData({ ...formData, brazoIzquierdoSensacion: e.target.value })}
                        className="w-full px-3 py-1.5 border border-orange-200 rounded-lg text-xs bg-white"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Hormigueo">Hormigueo (Punzadas)</option>
                        <option value="Adormecimiento">Adormecimiento (Entumecimiento)</option>
                        <option value="Ardor / Quemazón">Ardor / Quemazón</option>
                        <option value="Temblor al agarrar objetos">Temblor de acción</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: Tronco y Columna */}
              <div className="space-y-4 p-5 bg-white/80 rounded-2xl border border-orange-200 shadow-2xs">
                <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                  3. Tronco, Columna y Espalda
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <label className="flex items-center gap-3 text-xs font-medium text-gray-800 cursor-pointer bg-orange-50/50 p-3 rounded-xl border border-orange-100 flex-1 w-full">
                    <input
                      type="checkbox"
                      checked={formData.signoLhermitte}
                      onChange={(e) => setFormData({ ...formData, signoLhermitte: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span>⚡ Signo de Lhermitte (Sensación de corriente eléctrica al doblar el cuello hacia adelante)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dolor de Espalda / Espasticidad en Tronco (0-10): <b>{formData.dolorEspaldaEspasticidad}</b></label>
                  <input
                    type="range" min="0" max="10" value={formData.dolorEspaldaEspasticidad}
                    onChange={(e) => setFormData({ ...formData, dolorEspaldaEspasticidad: Number(e.target.value) })}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECCIÓN 4: Extremidades Inferiores (Derecha e Izquierda separadas) */}
              <div className="space-y-4 p-5 bg-white/80 rounded-2xl border border-orange-200 shadow-2xs">
                <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                  4. Extremidades Inferiores (Piernas, Marcha y Equilibrio)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Pierna Derecha */}
                  <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900">Pierna Derecha</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Debilidad (0-10): <b>{formData.piernaDerechaDebilidad}</b></label>
                      <input
                        type="range" min="0" max="10" value={formData.piernaDerechaDebilidad}
                        onChange={(e) => setFormData({ ...formData, piernaDerechaDebilidad: Number(e.target.value) })}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Espasticidad / Rigidez (0-10): <b>{formData.piernaDerechaEspasticidad}</b></label>
                      <input
                        type="range" min="0" max="10" value={formData.piernaDerechaEspasticidad}
                        onChange={(e) => setFormData({ ...formData, piernaDerechaEspasticidad: Number(e.target.value) })}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Pierna Izquierda */}
                  <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900">Pierna Izquierda</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Debilidad (0-10): <b>{formData.piernaIzquierdaDebilidad}</b></label>
                      <input
                        type="range" min="0" max="10" value={formData.piernaIzquierdaDebilidad}
                        onChange={(e) => setFormData({ ...formData, piernaIzquierdaDebilidad: Number(e.target.value) })}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Espasticidad / Rigidez (0-10): <b>{formData.piernaIzquierdaEspasticidad}</b></label>
                      <input
                        type="range" min="0" max="10" value={formData.piernaIzquierdaEspasticidad}
                        onChange={(e) => setFormData({ ...formData, piernaIzquierdaEspasticidad: Number(e.target.value) })}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">⚖️ Ataxia / Falta de Equilibrio General (0-10): <b>{formData.problemasEquilibrioAtaxia}</b></label>
                  <input
                    type="range" min="0" max="10" value={formData.problemasEquilibrioAtaxia}
                    onChange={(e) => setFormData({ ...formData, problemasEquilibrioAtaxia: Number(e.target.value) })}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECCIÓN 5: Generales (Fatiga, Esfínteres, Cognición) */}
              <div className="space-y-4 p-5 bg-white/80 rounded-2xl border border-orange-200 shadow-2xs">
                <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                  5. Síntomas Sistémicos y Cognitivos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">⚡ Fatiga Crónica (0-10)</label>
                    <input
                      type="number" min="0" max="10"
                      value={formData.fatigaCronica}
                      onChange={(e) => setFormData({ ...formData, fatigaCronica: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">🚻 Urgencia Esfínteres (0-10)</label>
                    <input
                      type="number" min="0" max="10"
                      value={formData.controlEsfinteres}
                      onChange={(e) => setFormData({ ...formData, controlEsfinteres: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">🧠 Niebla Mental / Cognición (0-10)</label>
                    <input
                      type="number" min="0" max="10"
                      value={formData.cognicionNieblaMental}
                      onChange={(e) => setFormData({ ...formData, cognicionNieblaMental: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones / Factores desencadenantes (Ej. Calor, estrés, post-ejercicio)</label>
                  <textarea
                    rows={3}
                    value={formData.notasGenerales}
                    onChange={(e) => setFormData({ ...formData, notasGenerales: e.target.value })}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Detalles adicionales del día..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-700 transition cursor-pointer"
              >
                {guardando ? "Guardando registro clínico..." : "Guardar Bitácora Detallada"}
              </button>
            </form>
          </div>
        ) : (
          /* Historial Detallado */
          <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-orange-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-orange-200">Historial de Registros Anatómicos</h2>
            
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {historialRegistros.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-6">No hay registros detallados guardados.</p>
              ) : (
                historialRegistros.map((r) => (
                  <div key={r.id} className="p-4 border border-orange-200 rounded-xl bg-white shadow-2xs space-y-2">
                    <span className="text-xs font-extrabold text-orange-800 bg-orange-100 px-3 py-1 rounded-full inline-block">
                      📅 {r.fechaHora.replace("T", " - Hora: ")}
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                      <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100 space-y-1">
                        <p className="font-bold text-orange-900">Cabeza y Ojos:</p>
                        <p>🤕 Dolor: <b>{r.cabezaDolorIntensidad}/10</b> ({r.cabezaDolorTipo})</p>
                        <p>👁️ Visión: {[r.visionDoble && "Doble", r.visionBorrosa && "Borrosa", r.visionPerdidaFoco && "Foco"].filter(Boolean).join(", ") || "Normal"}</p>
                        <p>🌀 Vértigo: <b>{r.mareosVertigo}/10</b></p>
                      </div>

                      <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100 space-y-1">
                        <p className="font-bold text-orange-900">Extremidades Superiores:</p>
                        <p>🦾 Der: Debilidad <b>{r.brazoDerechoDebilidad}/10</b> ({r.brazoDerechoSensacion})</p>
                        <p>🦾 Izq: Debilidad <b>{r.brazoIzquierdoDebilidad}/10</b> ({r.brazoIzquierdoSensacion})</p>
                      </div>

                      <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100 space-y-1">
                        <p className="font-bold text-orange-900">Tronco y Extremidades Inferiores:</p>
                        <p>⚡ Signo Lhermitte: <b>{r.signoLhermitte ? "Sí" : "No"}</b></p>
                        <p>🦵 Pierna Der: Debilidad <b>{r.piernaDerechaDebilidad}/10</b> | Rigidez <b>{r.piernaDerechaEspasticidad}/10</b></p>
                        <p>🦵 Pierna Izq: Debilidad <b>{r.piernaIzquierdaDebilidad}/10</b> | Rigidez <b>{r.piernaIzquierdaEspasticidad}/10</b></p>
                        <p>⚖️ Equilibrio/Ataxia: <b>{r.problemasEquilibrioAtaxia}/10</b></p>
                      </div>

                      <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100 space-y-1">
                        <p className="font-bold text-orange-900">Sistémicos y Cognitivos:</p>
                        <p>⚡ Fatiga: <b>{r.fatigaCronica}/10</b></p>
                        <p>🚻 Esfínteres: <b>{r.controlEsfinteres}/10</b></p>
                        <p>🧠 Cognición: <b>{r.cognicionNieblaMental}/10</b></p>
                      </div>
                    </div>

                    {r.notasGenerales && (
                      <p className="text-xs text-gray-600 italic mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        💬 <b>Notas:</b> {r.notasGenerales}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}