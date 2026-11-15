"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Medication, MedicalExam } from "@/types/medical";
import FileUploader from "@/components/FileUpLoader";
import { useRouter } from "next/navigation";

export default function HistorialPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"medicamentos" | "examenes">("medicamentos");
  
  const [medicamentos, setMedicamentos] = useState<Medication[]>([]);
  const [examenes, setExamenes] = useState<MedicalExam[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados form Medicamento
  const [nombreMed, setNombreMed] = useState("");
  const [dosisMed, setDosisMed] = useState("");
  const [viaMed, setViaMed] = useState<any>("Oral");
  const [frecuenciaMed, setFrecuenciaMed] = useState("");
  const [activoMed, setActivoMed] = useState(true);

  // Estados form Examen
  const [tituloEx, setTituloEx] = useState("");
  const [tipoEx, setTipoEx] = useState<any>("Imagenología");
  const [fechaEx, setFechaEx] = useState("");
  const [estadoEx, setEstadoEx] = useState<any>("realizado");
  const [docUrl, setDocUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
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
        frecuencia: frecuenciaMed,
        horarios: [],
        fechaInicio: new Date().toISOString().split("T")[0],
        activo: activoMed,
      });
      setNombreMed("");
      setDosisMed("");
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
    return <div className="min-h-screen flex items-center justify-center">Cargando historial clínico...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Historial Médico y Tratamientos</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
          >
            Volver al Panel
          </button>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab("medicamentos")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === "medicamentos" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Medicamentos y Tratamientos
          </button>
          <button
            onClick={() => setActiveTab("examenes")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === "examenes" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Exámenes e Imágenes
          </button>
        </div>

        {activeTab === "medicamentos" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulario nuevo medicamento */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar Medicamento</h2>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del Fármaco</label>
                  <input
                    type="text"
                    required
                    value={nombreMed}
                    onChange={(e) => setNombreMed(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    placeholder="Ej. Interferón beta, Teriflunomida"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dosis</label>
                    <input
                      type="text"
                      required
                      value={dosisMed}
                      onChange={(e) => setDosisMed(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                      placeholder="Ej. 44 mcg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vía</label>
                    <select
                      value={viaMed}
                      onChange={(e) => setViaMed(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Inyectable Subcutánea">Subcutánea</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Infusión Intravenosa">Intravenosa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frecuencia</label>
                  <input
                    type="text"
                    required
                    value={frecuenciaMed}
                    onChange={(e) => setFrecuenciaMed(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    placeholder="Ej. Cada 48 horas / Diario"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activoMed}
                    onChange={(e) => setActivoMed(e.target.checked)}
                    id="activo"
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="activo" className="text-sm font-medium text-gray-700">Tratamiento Activo actual</label>
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
                  Guardar Medicamento
                </button>
              </form>
            </div>

            {/* Listado de Medicamentos */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tus Medicamentos Registrados</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {medicamentos.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay medicamentos registrados.</p>
                ) : (
                  medicamentos.map((m) => (
                    <div key={m.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{m.nombre}</h3>
                        <p className="text-xs text-gray-600">{m.dosis} - {m.viaAdministracion}</p>
                        <p className="text-xs text-gray-500 mt-1">Frecuencia: {m.frecuencia}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${m.activo ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
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
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar Examen o Imagen</h2>
              <form onSubmit={handleAddExam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título del Examen</label>
                  <input
                    type="text"
                    required
                    value={tituloEx}
                    onChange={(e) => setTituloEx(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    placeholder="Ej. Resonancia Magnética Cerebral con contraste"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      value={tipoEx}
                      onChange={(e) => setTipoEx(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    >
                      <option value="Imagenología">Imagenología</option>
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Potenciales Evocados">Potenciales Evocados</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <input
                      type="date"
                      required
                      value={fechaEx}
                      onChange={(e) => setFechaEx(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar Resultado (PDF o Imagen)</label>
                  <FileUploader folder="examenes" onUploadComplete={(url) => setDocUrl(url)} />
                  {docUrl && <p className="text-xs text-green-600 mt-1">¡Documento adjuntado correctamente!</p>}
                </div>

                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
                  Guardar Examen
                </button>
              </form>
            </div>

            {/* Listado de Exámenes */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Exámenes</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {examenes.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay exámenes registrados.</p>
                ) : (
                  examenes.map((ex) => (
                    <div key={ex.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ex.titulo}</h3>
                        <p className="text-xs text-gray-600">Fecha: {ex.fecha} | Tipo: {ex.tipo}</p>
                        {ex.resultadoUrl && (
                          <a href={ex.resultadoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline mt-1 block">
                            Ver documento adjunto
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
      </div>
    </div>
  );
}