"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Esquema de validación completo con Zod
const fichaSchema = z.object({
  // Identificación
  identificadorInterno: z.string().optional(),
  nombre: z.string().min(3, "El nombre completo es obligatorio (mínimo 3 caracteres)"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),

  // Diagnóstico e Historia Clínica
  fechaDiagnostico: z.string().optional(),
  tipoEM: z.string().min(1, "Selecciona el tipo de Esclerosis Múltiple"),
  edadInicio: z.string().optional(),
  fechaPrimerosSintomas: z.string().optional(),
  descripcionPrimerosSintomas: z.string().optional(),
  movilidad: z.string().min(1, "Selecciona el estado de movilidad"),
  otraMovilidad: z.string().optional(),

  // Equipo Médico
  neurologoTratante: z.string().min(2, "Indica el nombre del neurólogo tratante"),
  centroMedico: z.string().min(2, "Indica el centro médico u hospital"),

  // Antecedentes y Alergias
  antecedentesRelevantes: z.string().optional(),
  alergias: z.string().optional(),

  // Tratamiento Actual (Lista dinámica)
  tratamientosActuales: z.array(
    z.object({
      medicamento: z.string().min(2, "El nombre del medicamento es requerido"),
      dosis: z.string().min(1, "La dosis es requerida"),
      frecuencia: z.string().min(2, "La frecuencia es requerida"),
    })
  ),

  // Cobertura Médica y Beneficios
  coberturaMedica: z.string().min(1, "Selecciona una cobertura médica"),
  otraIsapre: z.string().optional(),
  ges: z.boolean(),
  ricarteSoto: z.boolean(),
  estudioClinico: z.boolean(),
  estudiosLista: z.array(
    z.object({
      nombre: z.string().min(2, "El nombre del estudio es requerido"),
      fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
    })
  ),

  // Contacto de Emergencia
  contactoEmergenciaNombre: z.string().min(2, "El nombre del contacto de emergencia es obligatorio"),
  contactoEmergenciaTelefono: z.string().min(6, "Ingresa un teléfono válido de emergencia"),
});

type FichaFormValues = z.infer<typeof fichaSchema>;

export default function FichaClinicaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nombrePaciente, setNombrePaciente] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FichaFormValues>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      identificadorInterno: "",
      nombre: "",
      fechaNacimiento: "",
      fechaDiagnostico: "",
      tipoEM: "Remitente-Recurrente (EMRR)",
      edadInicio: "",
      fechaPrimerosSintomas: "",
      descripcionPrimerosSintomas: "",
      movilidad: "Independiente",
      otraMovilidad: "",
      neurologoTratante: "",
      centroMedico: "",
      antecedentesRelevantes: "",
      alergias: "",
      tratamientosActuales: [],
      coberturaMedica: "Fonasa",
      otraIsapre: "",
      ges: false,
      ricarteSoto: false,
      estudioClinico: false,
      estudiosLista: [],
      contactoEmergenciaNombre: "",
      contactoEmergenciaTelefono: "",
    },
  });

  // Array dinámico para Estudios Clínicos
  const {
    fields: estudiosFields,
    append: appendEstudio,
    remove: removeEstudio,
  } = useFieldArray({
    control,
    name: "estudiosLista",
  });

  // Array dinámico para Tratamientos Actuales
  const {
    fields: tratamientosFields,
    append: appendTratamiento,
    remove: removeTratamiento,
  } = useFieldArray({
    control,
    name: "tratamientosActuales",
  });

  const watchEstudioClinico = watch("estudioClinico");
  const watchCobertura = watch("coberturaMedica");
  const watchMovilidad = watch("movilidad");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const defaultId = `MED-${user.uid.slice(0, 6).toUpperCase()}`;

        if (docSnap.exists()) {
          const data = docSnap.data();
          reset({
            identificadorInterno: data.identificadorInterno || defaultId,
            nombre: data.nombre || user.displayName || "",
            fechaNacimiento: data.fechaNacimiento || "",
            fechaDiagnostico: data.fechaDiagnostico || "",
            tipoEM: data.tipoEM || "Remitente-Recurrente (EMRR)",
            edadInicio: data.edadInicio || "",
            fechaPrimerosSintomas: data.fechaPrimerosSintomas || "",
            descripcionPrimerosSintomas: data.descripcionPrimerosSintomas || "",
            movilidad: data.movilidad || "Independiente",
            otraMovilidad: data.otraMovilidad || "",
            neurologoTratante: data.neurologoTratante || "",
            centroMedico: data.centroMedico || "",
            antecedentesRelevantes: data.antecedentesRelevantes || "",
            alergias: data.alergias || "",
            tratamientosActuales: data.tratamientosActuales || [],
            coberturaMedica: data.coberturaMedica || "Fonasa",
            otraIsapre: data.otraIsapre || "",
            ges: data.ges || false,
            ricarteSoto: data.ricarteSoto || false,
            estudioClinico: data.estudioClinico || false,
            estudiosLista: data.estudiosLista || [],
            contactoEmergenciaNombre: data.contactoEmergenciaNombre || "",
            contactoEmergenciaTelefono: data.contactoEmergenciaTelefono || "",
          });
          setNombrePaciente(data.nombre || user.email || "Paciente");
        } else {
          reset({
            identificadorInterno: defaultId,
            nombre: user.displayName || "",
            tipoEM: "Remitente-Recurrente (EMRR)",
            movilidad: "Independiente",
            coberturaMedica: "Fonasa",
            ges: false,
            ricarteSoto: false,
            estudioClinico: false,
            tratamientosActuales: [],
            estudiosLista: [],
          });
          setNombrePaciente(user.email || "Paciente");
        }
      } catch (error) {
        console.error("Error al cargar ficha:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router, reset]);

  const onSubmit = async (data: FichaFormValues) => {
    if (!user) return;

    setSaving(true);
    setMensaje("");

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          ...data,
          uid: user.uid,
          email: user.email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setMensaje("¡Ficha médica actualizada con éxito!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("Error al actualizar la información.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center text-orange-700 font-medium">
        Cargando ficha clínica...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50/70 to-orange-200/80 pb-12">
      <Navbar nombrePaciente={nombrePaciente} />

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 border border-orange-200">
          
          <div className="mb-6 border-b border-orange-200 pb-4">
            <h1 className="text-2xl font-extrabold text-gray-900">Ficha Médica de Control - EM</h1>
            <p className="text-sm text-gray-600 mt-1">
              Actualiza tu identificación clínica, historial de diagnóstico, tratamientos y coberturas de salud.
            </p>
          </div>

          {mensaje && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                mensaje.includes("éxito")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. IDENTIFICACIÓN */}
            <div className="p-4 bg-white/70 rounded-xl border border-orange-200/80 space-y-4">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                1. Identificación del Paciente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ID Interno / Ficha</label>
                  <input
                    type="text"
                    {...register("identificadorInterno")}
                    className="w-full px-3.5 py-2.5 border border-orange-200 rounded-xl bg-orange-50/50 text-gray-800 font-mono text-sm focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej: MED-001"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    {...register("nombre")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  />
                  {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    {...register("fechaNacimiento")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  />
                  {errors.fechaNacimiento && <p className="text-xs text-red-600 mt-1">{errors.fechaNacimiento.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estado de Movilidad Actual *</label>
                  <select
                    {...register("movilidad")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  >
                    <option value="Independiente">Independiente (sin apoyo)</option>
                    <option value="Bastón">Bastón / Muleta</option>
                    <option value="Andador">Andador / Burrito</option>
                    <option value="Silla de ruedas">Silla de ruedas</option>
                    <option value="Otro">Otro tipo de asistencia</option>
                  </select>
                </div>
              </div>

              {watchMovilidad === "Otro" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Especificar apoyo de movilidad</label>
                  <input
                    type="text"
                    {...register("otraMovilidad")}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    placeholder="Ej: Órtesis antiequino, bastones canadienses..."
                  />
                </div>
              )}
            </div>

            {/* 2. DIAGNÓSTICO E HISTORIA DE EM */}
            <div className="p-4 bg-white/70 rounded-xl border border-orange-200/80 space-y-4">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                2. Diagnóstico e Inicio de Esclerosis Múltiple
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de EM *</label>
                  <select
                    {...register("tipoEM")}
                    className="w-full px-3 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm"
                  >
                    <option value="Remitente-Recurrente (EMRR)">EMRR (Remitente-Recurrente)</option>
                    <option value="Secundaria Progresiva (EMSP)">EMSP (Secundaria Progresiva)</option>
                    <option value="Primaria Progresiva (EMPP)">EMPP (Primaria Progresiva)</option>
                    <option value="En estudio">En estudio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Diagnóstico</label>
                  <input
                    type="date"
                    {...register("fechaDiagnostico")}
                    className="w-full px-3 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Edad de Inicio (años)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    {...register("edadInicio")}
                    className="w-full px-3 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm"
                    placeholder="Ej: 32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Primeros Síntomas</label>
                  <input
                    type="date"
                    {...register("fechaPrimerosSintomas")}
                    className="w-full px-3 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción de Primeros Síntomas</label>
                  <input
                    type="text"
                    {...register("descripcionPrimerosSintomas")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm"
                    placeholder="Ej: Neuritis óptica derecha, parestesias en extremidades..."
                  />
                </div>
              </div>
            </div>

            {/* 3. EQUIPO MÉDICO */}
            <div className="p-4 bg-white/70 rounded-xl border border-orange-200/80 space-y-4">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                3. Equipo Médico Tratante
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Neurólogo Tratante *</label>
                  <input
                    type="text"
                    {...register("neurologoTratante")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    placeholder="Dr(a)..."
                  />
                  {errors.neurologoTratante && <p className="text-xs text-red-600 mt-1">{errors.neurologoTratante.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Centro Médico / Hospital *</label>
                  <input
                    type="text"
                    {...register("centroMedico")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    placeholder="Ej: Hospital Clínico..."
                  />
                  {errors.centroMedico && <p className="text-xs text-red-600 mt-1">{errors.centroMedico.message}</p>}
                </div>
              </div>
            </div>

            {/* 4. ANTECEDENTES Y ALERGIAS */}
            <div className="p-4 bg-white/70 rounded-xl border border-orange-200/80 space-y-4">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                4. Antecedentes Clínicos y Alergias
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Antecedentes Relevantes / Otras Patologías</label>
                  <textarea
                    rows={3}
                    {...register("antecedentesRelevantes")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm"
                    placeholder="Hipertensión, hipotiroidismo, cirugías previas, antecedentes familiares..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Alergias (Medicamentos / Otras)</label>
                  <textarea
                    rows={3}
                    {...register("alergias")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white text-sm"
                    placeholder="Ej: Penicilina, medios de contraste, látex (o 'Sin alergias conocidas')"
                  />
                </div>
              </div>
            </div>

            {/* 5. TRATAMIENTO ACTUAL (LISTA DINÁMICA) */}
            <div className="p-4 bg-white/70 rounded-xl border border-orange-200/80 space-y-4">
              <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider">5. Tratamiento Farmacológico Actual</h3>
                  <p className="text-xs text-gray-600">Terapias modificadoras de la enfermedad (TME) y medicamentos sintomáticos.</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendTratamiento({ medicamento: "", dosis: "", frecuencia: "" })}
                  className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>+</span> Agregar Fármaco
                </button>
              </div>

              {tratamientosFields.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-3">
                  No hay medicamentos registrados. Haz clic en "+ Agregar Fármaco" para añadir tu esquema actual.
                </p>
              ) : (
                <div className="space-y-3">
                  {tratamientosFields.map((field, index) => (
                    <div key={field.id} className="p-3.5 bg-white rounded-xl border border-orange-200/80 shadow-2xs space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Medicamento #{index + 1} *</label>
                          <input
                            type="text"
                            {...register(`tratamientosActuales.${index}.medicamento` as const)}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                            placeholder="Ej: Ocrelizumab, Fingolimod..."
                          />
                          {errors.tratamientosActuales?.[index]?.medicamento && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.tratamientosActuales[index]?.medicamento?.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Dosis *</label>
                          <input
                            type="text"
                            {...register(`tratamientosActuales.${index}.dosis` as const)}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                            placeholder="Ej: 600 mg / 0.5 mg"
                          />
                          {errors.tratamientosActuales?.[index]?.dosis && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.tratamientosActuales[index]?.dosis?.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Frecuencia *</label>
                          <input
                            type="text"
                            {...register(`tratamientosActuales.${index}.frecuencia` as const)}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                            placeholder="Ej: Cada 6 meses / Diario"
                          />
                          {errors.tratamientosActuales?.[index]?.frecuencia && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.tratamientosActuales[index]?.frecuencia?.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeTratamiento(index)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          🗑️ Eliminar medicamento
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. COBERTURA MÉDICA */}
            <div className="p-4 bg-white/70 rounded-xl border border-orange-200/80 space-y-4">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                6. Cobertura Médica y Beneficios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Fonasa", "Isapre", "Otro"].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-orange-200">
                    <input
                      type="radio"
                      value={item}
                      {...register("coberturaMedica")}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-800">{item}</span>
                  </label>
                ))}
              </div>

              {(watchCobertura === "Isapre" || watchCobertura === "Otro") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Especificar Isapre u otra cobertura</label>
                  <input
                    type="text"
                    {...register("otraIsapre")}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    placeholder="Ej: Isapre Colmena, Consalud, Particular, etc."
                  />
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("ges")}
                    className="w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-800">Protección Financiera GES (Garantías Explícitas en Salud)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("ricarteSoto")}
                    className="w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-800">Ley Ricarte Soto (Tratamientos de Alto Costo)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("estudioClinico")}
                    onChange={(e) => {
                      setValue("estudioClinico", e.target.checked);
                      if (e.target.checked && estudiosFields.length === 0) {
                        appendEstudio({ nombre: "", fechaInicio: "" });
                      }
                    }}
                    className="w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-800">Participación en Estudio Clínico / Protocolo de Investigación</span>
                </label>
              </div>

              {watchEstudioClinico && (
                <div className="mt-4 p-4 bg-orange-50/80 rounded-xl border border-orange-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider">Estudios Clínicos Registrados</h4>
                    <button
                      type="button"
                      onClick={() => appendEstudio({ nombre: "", fechaInicio: "" })}
                      className="px-2.5 py-1 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span className="text-sm">+</span> Agregar Estudio
                    </button>
                  </div>

                  {estudiosFields.map((field, index) => (
                    <div key={field.id} className="p-3 bg-white rounded-xl border border-orange-200/80 shadow-2xs space-y-3 relative">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Nombre del Estudio #{index + 1}</label>
                          <input
                            type="text"
                            {...register(`estudiosLista.${index}.nombre` as const)}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                            placeholder="Ej: Ensayo Fase III..."
                          />
                          {errors.estudiosLista?.[index]?.nombre && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.estudiosLista[index]?.nombre?.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Fecha de Inicio</label>
                          <input
                            type="date"
                            {...register(`estudiosLista.${index}.fechaInicio` as const)}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                          />
                          {errors.estudiosLista?.[index]?.fechaInicio && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.estudiosLista[index]?.fechaInicio?.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeEstudio(index)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          🗑️ Eliminar este estudio
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. CONTACTO DE EMERGENCIA */}
            <div className="p-4 bg-white/70 rounded-xl border border-orange-200/80 space-y-4">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-100 pb-2">
                7. Red de Apoyo y Emergencia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contacto de Emergencia (Nombre) *</label>
                  <input
                    type="text"
                    {...register("contactoEmergenciaNombre")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    placeholder="Familiar o cercano"
                  />
                  {errors.contactoEmergenciaNombre && <p className="text-xs text-red-600 mt-1">{errors.contactoEmergenciaNombre.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contacto de Emergencia (Teléfono) *</label>
                  <input
                    type="tel"
                    {...register("contactoEmergenciaTelefono")}
                    className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    placeholder="+56 9 ..."
                  />
                  {errors.contactoEmergenciaTelefono && <p className="text-xs text-red-600 mt-1">{errors.contactoEmergenciaTelefono.message}</p>}
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-700 transition cursor-pointer disabled:opacity-50"
              >
                {saving ? "Actualizando datos..." : "Guardar y Actualizar Ficha Médica"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 border border-orange-300 text-gray-700 font-semibold rounded-xl hover:bg-orange-50 transition cursor-pointer"
              >
                Volver
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}