"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, doc, getDoc } from "firebase/firestore";
import { Medication, MedicalExam } from "@/types/medical";
import FileUploader from "@/components/FileUpLoader";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HistorialPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"medicamentos" | "examenes">("medicamentos");
  
  const [medicamentos, setMedicamentos] = useState<Medication[]>([]);
  const [examenes, setExamenes] = useState<MedicalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombrePaciente, setNombrePaciente] = useState("");

  // Estados form Medicamento (incluyendo el sitio de inoculación o uso)
  const [nombreMed, setNombreMed] = useState("");
  const [dosisMed, setDosisMed] = useState("");
  const [viaMed, setViaMed] = useState<any>("Oral");
  const [lugarUsoInoculacion, setLugarUsoInoculacion] = useState("Vía oral / Sistémica");
  const [frecuenciaMed, setFrecuenciaMed] = useState("");
  const [activoMed, setActivoMed] = useState(true);

  // Estados form Examen
  const [tituloEx, setTituloEx] = useState("");
  const [tipoEx, setTipoEx] = useState<any>("Imagenología");
  const [fechaEx, setFechaEx] = useState("");
  const [estadoEx, setEstadoEx] = useState<any>("realizado");
  const [docUrl, setDocUrl] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Cargar datos del usuario para el Navbar
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        setNombrePaciente(userSnap.data().nombre || user.email || "Paciente");
      } else {
        setNombrePaciente(user.email || "Paciente");
      }

      // Cargar medicamentos
      const medQuery = query(collection(db, "users", user.uid, "medications"));
      const medSnap = await getDocs(medQuery);
      setMedicamentos(medSnap.docs.map(d => ({ id: d.id, ...d.data() } as Medication)));

      // Cargar exámenes
      const exQuery = query(collection(db, "users", user.uid, "exams"));
      const exSnap = await getDocs(exQuery);
      setExamenes(exSnap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalExam)));
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "medications"), {
        nombre: nombreMed,
        dosis: dosisMed,
        viaAdministracion: viaMed,
        lugarUso: lugarUsoInoculacion,
        frecuencia: frecuenciaMed,
        horarios: [],
        fechaInicio: new Date().toISOString().split("T")[0],
        activo: activoMed,
      });
      setNombreMed("");
      setDosisMed("");
      setLugarUsoInoculacion("Vía oral / Sistémica");
      setFrecuenciaMed("");
      fetchData();
      alert("Medicamento registrado con éxito");
    } catch (err) {
      console.error("Error al guardar medicamento:", err);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "exams"), {
        titulo: tituloEx,
        tipo: tipoEx,
        fecha: fechaEx,
        estado: estadoEx,
        resultadoUrl: docUrl,
      });
      setTituloEx("");
      setFechaEx("");
      setDocUrl("");
      fetchData();
      alert("Examen registrado con éxito");
    } catch (err) {
      console.error("Error al guardar examen:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center text-orange-700 font-medium">
        Cargando historial clínico...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50/70 to-orange-200/80 pb-12">
      {/* Navbar fija con fecha, ubicación y datos de sesión */}
      <Navbar nombrePaciente={nombrePaciente} />

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Historial Médico y Tratamientos</h1>
            <p className="text-sm text-gray-600">Lleva el registro detallado de tus fármacos, pautas y exámenes.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2.5 bg-white border border-orange-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition shadow-xs inline-flex items-center cursor-pointer"
          >
            Volver al Panel
          </button>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex border-b border-orange-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("medicamentos")}
            className={`py-2.5 px-4 font-bold text-sm rounded-t-xl transition ${
              activeTab === "medicamentos" 
                ? "bg-white text-orange-600 border-t-2 border-x border-orange-300 shadow-2xs" 
                : "text-gray-600 hover:text-orange-600 bg-orange-50/40"
            }`}
          >
            💊 Medicamentos y Tratamientos
          </button>
          <button
            onClick={() => setActiveTab("examenes")}
            className={`py-2.5 px-4 font-bold text-sm rounded-t-xl transition ${
              activeTab === "examenes" 
                ? "bg-white text-orange-600 border-t-2 border-x border-orange-300 shadow-2xs" 
                : "text-gray-600 hover:text-orange-600 bg-orange-50/40"
            }`}
          >
            📋 Exámenes e Imágenes
          </button>
        </div>

        {activeTab === "medicamentos" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulario nuevo medicamento */}
            <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-orange-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-orange-200">Registrar Medicamento</h2>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Fármaco</label>
                  <input
                    type="text"
                    required
                    value={nombreMed}
                    onChange={(e) => setNombreMed(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej. Interferón beta, Teriflunomida"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dosis</label>
                    <input
                      type="text"
                      required
                      value={dosisMed}
                      onChange={(e) => setDosisMed(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej. 44 mcg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vía</label>
                    <select
                      value={viaMed}
                      onChange={(e) => setViaMed(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Inyectable Subcutánea">Subcutánea</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Infusión Intravenosa">Intravenosa</option>
                    </select>
                  </div>
                </div>

                {/* Nuevo campo: Lugar de uso / Sitio de Inoculación */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Lugar de Uso / Sitio de Inoculación</label>
                  <input
                    type="text"
                    value={lugarUsoInoculacion}
                    onChange={(e) => setLugarUsoInoculacion(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej. Abdomen, Muslo derecho, Brazo, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Frecuencia</label>
                  <input
                    type="text"
                    required
                    value={frecuenciaMed}
                    onChange={(e) => setFrecuenciaMed(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej. Cada 48 horas / Diario"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={activoMed}
                    onChange={(e) => setActivoMed(e.target.checked)}
                    id="activo"
                    className="w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <label htmlFor="activo" className="text-sm font-medium text-gray-700">Tratamiento Activo actual</label>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-700 transition"
                >
                  Guardar Medicamento
                </button>
              </form>
            </div>

            {/* Listado de Medicamentos */}
            <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-orange-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-orange-200">Tus Medicamentos Registrados</h2>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {medicamentos.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No hay medicamentos registrados.</p>
                ) : (
                  medicamentos.map((m: any) => (
                    <div key={m.id} className="p-3.5 border border-orange-200 rounded-xl bg-white/90 shadow-2xs flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{m.nombre}</h3>
                        <p className="text-xs text-gray-700 font-medium mt-0.5">{m.dosis} - {m.viaAdministracion}</p>
                        {m.lugarUso && (
                          <p className="text-xs text-orange-700 mt-1 flex items-center gap-1 font-medium">
                            <span>📍 Sitio:</span> {m.lugarUso}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Frecuencia: {m.frecuencia}</p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${m.activo ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-700 border border-gray-200"}`}>
                        {m.activo ? "Activo" : "Historial"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulario nuevo examen */}
            <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-orange-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-orange-200">Registrar Examen o Imagen</h2>
              <form onSubmit={handleAddExam} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Título del Examen</label>
                  <input
                    type="text"
                    required
                    value={tituloEx}
                    onChange={(e) => setTituloEx(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej. Resonancia Magnética Cerebral con contraste"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                    <select
                      value={tipoEx}
                      onChange={(e) => setTipoEx(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Imagenología">Imagenología</option>
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Potenciales Evocados">Potenciales Evocados</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={fechaEx}
                      onChange={(e) => setFechaEx(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adjuntar Resultado (PDF o Imagen)</label>
                  <FileUploader folder="examenes" onUploadComplete={(url) => setDocUrl(url)} />
                  {docUrl && <p className="text-xs text-green-700 font-medium mt-1">¡Documento adjuntado correctamente!</p>}
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-700 transition"
                >
                  Guardar Examen
                </button>
              </form>
            </div>

            {/* Listado de Exámenes */}
            <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-orange-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-orange-200">Historial de Exámenes</h2>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {examenes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No hay exámenes registrados.</p>
                ) : (
                  examenes.map((ex: any) => (
                    <div key={ex.id} className="p-3.5 border border-orange-200 rounded-xl bg-white/90 shadow-2xs flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{ex.titulo}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">Fecha: {ex.fecha} | Tipo: <span className="font-medium text-orange-700">{ex.tipo}</span></p>
                        {ex.resultadoUrl && (
                          <a href={ex.resultadoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 font-semibold underline mt-1.5 inline-block hover:text-orange-800">
                            📎 Ver documento adjunto
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}