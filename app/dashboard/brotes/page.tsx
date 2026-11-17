"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface RegistroBrote {
  id?: string;
  fechaInicio: string;
  duracionDias: number; // NUEVO: Cuántos días persistieron
  severidad: number; // 1-10
  sintomasPrincipales: string; // Manifestaciones nuevas o agravadas
  consultoProfesional: boolean; // NUEVO: Si consultó a un profesional
  lugarAtencion: string;
  tratamientoRecibido: string; // NUEVO: Corticoides u otra intervención
  factorDesencadenante: string;
  gradoRecuperacion: string; // Completa, parcial o pendiente
  fechaRecuperacion?: string; // NUEVO: Cuando corresponda
  notasMedicas: string;
}

export default function BrotesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [brotesList, setBrotesList] = useState<RegistroBrote[]>([]);
  const [modoHistorial, setModoHistorial] = useState(false);

  const [formData, setFormData] = useState<RegistroBrote>({
    fechaInicio: new Date().toISOString().split("T")[0],
    duracionDias: 1,
    severidad: 5,
    sintomasPrincipales: "",
    consultoProfesional: true,
    lugarAtencion: "",
    tratamientoRecibido: "Pulsos de Corticoides IV",
    factorDesencadenante: "Desconocido / Espontáneo",
    gradoRecuperacion: "Pendiente",
    fechaRecuperacion: "",
    notasMedicas: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const q = query(collection(db, "users", user!.uid, "brotes"), orderBy("fechaInicio", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as RegistroBrote));
      setBrotesList(list);
    } catch (error) {
      console.error("Error al cargar brotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setGuardando(true);

    try {
      await addDoc(collection(db, "users", user.uid, "brotes"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      alert("¡Registro de brote guardado con éxito!");
      setFormData({
        fechaInicio: new Date().toISOString().split("T")[0],
        duracionDias: 1,
        severidad: 5,
        sintomasPrincipales: "",
        consultoProfesional: true,
        lugarAtencion: "",
        tratamientoRecibido: "Pulsos de Corticoides IV",
        factorDesencadenante: "Desconocido / Espontáneo",
        gradoRecuperacion: "Pendiente",
        fechaRecuperacion: "",
        notasMedicas: "",
      });
      setModoHistorial(true);
      fetchData();
    } catch (error) {
      console.error("Error al guardar brote:", error);
      alert("Error al guardar el registro.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarBrote = async (id: string) => {
    if (!user || !confirm("¿Estás seguro de eliminar este registro de brote?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "brotes", id));
      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-orange-700 font-medium">Cargando registro de brotes...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50/70 to-orange-200/80 pb-12">
      <Navbar nombrePaciente={nombrePaciente} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Registro y Control de Brotes (Recaídas)</h1>
            <p className="text-sm text-gray-600">Historial clínico de episodios agudos, tratamientos de rescate y evolución.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModoHistorial(!modoHistorial)}
              className="px-4 py-2.5 bg-white border border-orange-300 text-orange-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition shadow-xs cursor-pointer"
            >
              {modoHistorial ? "✍️ Nuevo Brote" : `📊 Ver Historial (${brotesList.length})`}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Fechas y Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Inicio del Brote *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duración (Días que persistieron)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.duracionDias}
                    onChange={(e) => setFormData({ ...formData, duracionDias: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                    placeholder="Ej. 7 días"
                  />
                </div>
              </div>

              {/* Intensidad / Severidad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Intensidad / Severidad (Escala de 0 a 10): <span className="text-orange-600 font-bold">{formData.severidad}</span>
                </label>
                <input
                  type="range" min="0" max="10"
                  value={formData.severidad}
                  onChange={(e) => setFormData({ ...formData, severidad: Number(e.target.value) })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              {/* Síntomas (Manifestaciones nuevas o agravadas) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Síntomas (Manifestaciones nuevas o agravadas) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.sintomasPrincipales}
                  onChange={(e) => setFormData({ ...formData, sintomasPrincipales: e.target.value })}
                  className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                  placeholder="Ej. Neuritis óptica en ojo izquierdo, pérdida de fuerza aguda..."
                />
              </div>

              {/* Atención Médica y Lugar */}
              <div className="p-4 bg-white/70 rounded-xl border border-orange-200 space-y-4">
                <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider">Atención Médica Profesional</h3>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="consulto"
                    checked={formData.consultoProfesional}
                    onChange={(e) => setFormData({ ...formData, consultoProfesional: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <label htmlFor="consulto" className="text-sm font-medium text-gray-800 cursor-pointer">
                    ¿Consultó a un profesional / centro médico por este brote?
                  </label>
                </div>

                {formData.consultoProfesional && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Lugar de Atención / Hospital</label>
                    <input
                      type="text"
                      value={formData.lugarAtencion}
                      onChange={(e) => setFormData({ ...formData, lugarAtencion: e.target.value })}
                      className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                      placeholder="Ej. Urgencias / Hospital Clínico / Neurólogo"
                    />
                  </div>
                )}
              </div>

              {/* Tratamiento de Rescate y Desencadenante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tratamiento (Corticoides u otra intervención)</label>
                  <input
                    type="text"
                    value={formData.tratamientoRecibido}
                    onChange={(e) => setFormData({ ...formData, tratamientoRecibido: e.target.value })}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                    placeholder="Ej. Pulsos de Metilprednisolona IV 1g por 5 días"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Factor Desencadenante</label>
                  <select
                    value={formData.factorDesencadenante}
                    onChange={(e) => setFormData({ ...formData, factorDesencadenante: e.target.value })}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Desconocido / Espontáneo">Desconocido / Espontáneo</option>
                    <option value="Estrés físico o emocional">Estrés físico o emocional</option>
                    <option value="Infección / Fiebre">Infección / Fiebre</option>
                    <option value="Calor / Fenómeno de Uhthoff">Calor / Fenómeno de Uhthoff</option>
                    <option value="Fatiga extrema">Fatiga extrema</option>
                  </select>
                </div>
              </div>

              {/* Recuperación y Fecha de Recuperación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Recuperación</label>
                  <select
                    value={formData.gradoRecuperacion}
                    onChange={(e) => setFormData({ ...formData, gradoRecuperacion: e.target.value })}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Pendiente">Pendiente / En curso</option>
                    <option value="Completa">Completa</option>
                    <option value="Parcial">Parcial (con secuelas)</option>
                    <option value="Sin recuperación">Sin recuperación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Recuperación (Cuando corresponda)</label>
                  <input
                    type="date"
                    value={formData.fechaRecuperacion}
                    onChange={(e) => setFormData({ ...formData, fechaRecuperacion: e.target.value })}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones / Notas Médicas</label>
                <textarea
                  rows={2}
                  value={formData.notasMedicas}
                  onChange={(e) => setFormData({ ...formData, notasMedicas: e.target.value })}
                  className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm bg-white"
                  placeholder="Indicaciones del neurólogo, exámenes asociados..."
                />
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-700 transition cursor-pointer"
              >
                {guardando ? "Guardando registro..." : "Registrar Brote Clínico"}
              </button>
            </form>
          </div>
        ) : (
          /* Historial de Brotes con todos los detalles visuales */
          <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-orange-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-orange-200">Historial de Brotes Registrados</h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {brotesList.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">No hay brotes registrados en el historial.</p>
              ) : (
                brotesList.map((b) => (
                  <div key={b.id} className="p-4 border border-orange-200 rounded-xl bg-white shadow-2xs space-y-2 relative">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                        🚨 Inicio: {b.fechaInicio} ({b.duracionDias || 1} días de duración)
                      </span>
                      <span className="text-xs font-bold text-orange-900 bg-orange-100 px-2.5 py-1 rounded-lg">
                        Intensidad: {b.severidad}/10
                      </span>
                    </div>

                    <div className="pt-1">
                      <h4 className="text-sm font-bold text-gray-900">Síntomas: {b.sintomasPrincipales}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 mt-2 bg-orange-50/60 p-3 rounded-lg border border-orange-100">
                        <p>🏥 <b>Atención Médica:</b> {b.consultoProfesional ? `Sí (${b.lugarAtencion || "Centro médico"})` : "No consultó"}</p>
                        <p>💊 <b>Tratamiento:</b> {b.tratamientoRecibido}</p>
                        <p>⚡ <b>Desencadenante:</b> {b.factorDesencadenante}</p>
                        <p>📈 <b>Recuperación:</b> {b.gradoRecuperacion} {b.fechaRecuperacion ? `(El ${b.fechaRecuperacion})` : ""}</p>
                      </div>
                    </div>

                    {b.notasMedicas && (
                      <p className="text-xs text-gray-600 italic mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        💬 <b>Notas:</b> {b.notasMedicas}
                      </p>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => eliminarBrote(b.id!)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                      >
                        🗑️ Eliminar registro
                      </button>
                    </div>
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