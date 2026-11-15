export interface PatientProfile {
  uid: string;
  nombre: string;
  email: string;
  fechaNacimiento?: string;
  tipoEM?: "Remitente-Recurrente (EMRR)" | "Secundaria Progresiva (EMSP)" | "Primaria Progresiva (EMPP)" | "En estudio";
  neurologoTratante?: string;
  centroMedico?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  updatedAt?: string;
}

export interface Medication {
  id?: string;
  nombre: string;
  dosis: string;
  viaAdministracion: "Oral" | "Inyectable Subcutánea" | "Intramuscular" | "Infusión Intravenosa";
  frecuencia: string;
  horarios: string[]; // Ej: ["08:00", "20:00"]
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean; // true = tratamiento actual | false = historial pasado
  notas?: string;
}

export interface MedicalExam {
  id?: string;
  titulo: string; // Ej: Resonancia Magnética Cerebral, Perfil Bioquímico
  tipo: "Imagenología" | "Laboratorio" | "Potenciales Evocados" | "Otro";
  fecha: string; // YYYY-MM-DD
  estado: "pendiente" | "realizado";
  ordenUrl?: string;
  resultadoUrl?: string;
  observaciones?: string;
}

export interface MedicalAppointment {
  id?: string;
  especialidad: string; // Ej: Neurología, Kinesiología, Fonoaudiología, Oftalmología
  doctor: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  ubicacion: string;
  ordenMedicaUrl?: string;
  recordatorioMinutos: number; // Ej: 60 (1 hora antes), 1440 (1 día antes)
  notas?: string;
}