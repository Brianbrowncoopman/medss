"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { PatientProfile } from "@/types/medical";
import { useRouter } from "next/navigation";

export default function FichaClinicaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [formData, setFormData] = useState<PatientProfile>({
    uid: "",
    nombre: "",
    email: "",
    fechaNacimiento: "",
    tipoEM: "Remitente-Recurrente (EMRR)",
    neurologoTratante: "",
    centroMedico: "",
    contactoEmergenciaNombre: "",
    contactoEmergenciaTelefono: "",
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as PatientProfile);
        } else {
          setFormData((prev) => ({
            ...prev,
            uid: user.uid,
            email: user.email || "",
            nombre: user.displayName || "",
          }));
        }
      } catch (error) {
        console.error("Error al cargar ficha:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMensaje("");

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        ...formData,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setMensaje("¡Ficha médica guardada con éxito!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("Error al guardar la información.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando ficha clínica...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ficha Médica de Control - EM</h1>
        <p className="text-sm text-gray-600 mb-6">Actualiza tu información clínica y datos de contacto médico.</p>

        {mensaje && (
          <div className="mb-4 p-3 bg-indigo-50 text-indigo-700 text-sm rounded-lg font-medium">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                value={formData.fechaNacimiento || ""}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Esclerosis Múltiple (EM)</label>
            <select
              value={formData.tipoEM}
              onChange={(e) => setFormData({ ...formData, tipoEM: e.target.value as any })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
            >
              <option value="Remitente-Recurrente (EMRR)">Remitente-Recurrente (EMRR)</option>
              <option value="Secundaria Progresiva (EMSP)">Secundaria Progresiva (EMSP)</option>
              <option value="Primaria Progresiva (EMPP)">Primaria Progresiva (EMPP)</option>
              <option value="En estudio">En estudio</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neurólogo Tratante</label>
              <input
                type="text"
                value={formData.neurologoTratante || ""}
                onChange={(e) => setFormData({ ...formData, neurologoTratante: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                placeholder="Dr(a)..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Centro Médico / Hospital</label>
              <input
                type="text"
                value={formData.centroMedico || ""}
                onChange={(e) => setFormData({ ...formData, centroMedico: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia (Nombre)</label>
              <input
                type="text"
                value={formData.contactoEmergenciaNombre || ""}
                onChange={(e) => setFormData({ ...formData, contactoEmergenciaNombre: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia (Teléfono)</label>
              <input
                type="tel"
                value={formData.contactoEmergenciaTelefono || ""}
                onChange={(e) => setFormData({ ...formData, contactoEmergenciaTelefono: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              {saving ? "Guardando..." : "Guardar Ficha"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}