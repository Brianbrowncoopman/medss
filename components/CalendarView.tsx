"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { MedicalAppointment } from "@/types/medical";

// Extendemos o aseguramos que la interfaz contemple la propiedad realizada
interface AppointmentWithStatus extends MedicalAppointment {
  realizada?: boolean;
}

export default function CalendarView() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Estados del formulario para nueva cita médica
  const [especialidad, setEspecialidad] = useState("Neurología");
  const [doctor, setDoctor] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [recordatorioMinutos, setRecordatorioMinutos] = useState(60);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "appointments"));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppointmentWithStatus[];
      
      // Ordenar por fecha y hora
      list.sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());
      setAppointments(list);
    } catch (error) {
      console.error("Error al cargar citas médicas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "users", user.uid, "appointments"), {
        especialidad,
        doctor,
        fecha,
        hora,
        ubicacion,
        recordatorioMinutos: Number(recordatorioMinutos),
        notas,
        realizada: false, // Por defecto nace como pendiente
        createdAt: new Date().toISOString()
      });

      // Limpiar formulario
      setDoctor("");
      setFecha("");
      setHora("");
      setUbicacion("");
      setNotas("");
      
      fetchAppointments();
      alert("¡Cita médica y recordatorio programados con éxito!");
    } catch (error) {
      console.error("Error al guardar la cita:", error);
      alert("Hubo un error al guardar la cita.");
    }
  };

  // Marcar cita como realizada (pasa al histórico)
  const marcarComoRealizada = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "appointments", id);
      await updateDoc(docRef, { realizada: true });
      fetchAppointments();
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      alert("No se pudo actualizar el estado de la cita.");
    }
  };

  // Eliminar cita
  const eliminarCita = async (id: string) => {
    if (!user || !confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "appointments", id));
      fetchAppointments();
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
    }
  };

  // Separar citas pendientes e historial
  const citasPendientes = appointments.filter(a => !a.realizada);
  const citasHistorial = appointments.filter(a => a.realizada);

  if (loading) {
    return <div className="text-center py-4 text-sm text-gray-500">Cargando agenda médica...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botonera de control superior para alternar vistas */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs border">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestión de Citas Médicas</h2>
          <p className="text-xs text-gray-600">Organiza tus controles de Esclerosis Múltiple y consulta tu bitácora pasada.</p>
        </div>
        <button
          onClick={() => setMostrarHistorial(!mostrarHistorial)}
          className="px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 text-sm font-semibold rounded-xl hover:bg-amber-100 transition cursor-pointer"
        >
          {mostrarHistorial ? "📅 Ver Próximas Citas" : `📜 Ver Historial Pasadas (${citasHistorial.length})`}
        </button>
      </div>

      {!mostrarHistorial ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario para agendar */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Programar Nueva Cita o Control</h3>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                <select
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                >
                  <option value="Neurología">Neurología</option>
                  <option value="Kinesiología">Kinesiología</option>
                  <option value="Fonoaudiología">Fonoaudiología</option>
                  <option value="Oftalmología">Oftalmología</option>
                  <option value="Medicina General">Medicina General</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Médico / Terapeuta</label>
                <input
                  type="text"
                  required
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  placeholder="Ej. Dr. Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hora</label>
                  <input
                    type="time"
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación / Centro Médico</label>
                <input
                  type="text"
                  required
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  placeholder="Ej. Hospital Clínico / Consulta Online"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Aviso / Alerta previa</label>
                <select
                  value={recordatorioMinutos}
                  onChange={(e) => setRecordatorioMinutos(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                >
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                  <option value={1440}>1 día antes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notas adicionales</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  placeholder="Indicaciones previas al examen o cita..."
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition cursor-pointer"
              >
                Guardar Cita y Activar Alerta
              </button>
            </form>
          </div>

          {/* Listado de citas próximas con botón de marcar como realizada */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Tus Próximas Citas Médicas</h3>
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {citasPendientes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No hay citas médicas pendientes agendadas.</p>
              ) : (
                citasPendientes.map((app) => (
                  <div key={app.id} className="p-4 border rounded-xl bg-amber-50/40 border-amber-200 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                        {app.especialidad}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        📅 {app.fecha} ⏰ {app.hora}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{app.doctor}</h4>
                      <p className="text-xs text-gray-600">📍 {app.ubicacion}</p>
                      {app.notas && <p className="text-xs text-gray-500 italic mt-1">Nota: {app.notas}</p>}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-amber-200/60 mt-1">
                      <button
                        onClick={() => marcarComoRealizada(app.id!)}
                        className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition cursor-pointer shadow-2xs"
                      >
                        ✔️ Marcar como Hecha
                      </button>
                      <button
                        onClick={() => eliminarCita(app.id!)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Historial de Citas Realizadas */
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b">📜 Historial de Citas y Controles Pasados</h3>
          <p className="text-xs text-gray-600">Consultas médicas que ya se cumplieron y fueron archivadas en tu bitácora.</p>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {citasHistorial.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No hay citas en el historial todavía.</p>
            ) : (
              citasHistorial.map((app) => (
                <div key={app.id} className="p-4 border rounded-xl bg-gray-50 border-gray-200 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                      ✔️ Realizada - {app.especialidad}
                    </span>
                    <h4 className="font-bold text-gray-800 text-base mt-1">{app.doctor}</h4>
                    <p className="text-xs text-gray-500">📅 {app.fecha} a las {app.hora} | 📍 {app.ubicacion}</p>
                    {app.notas && <p className="text-xs text-gray-500 italic">Nota: {app.notas}</p>}
                  </div>

                  <button
                    onClick={() => eliminarCita(app.id!)}
                    className="px-3 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-xl hover:bg-red-200 transition cursor-pointer"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}