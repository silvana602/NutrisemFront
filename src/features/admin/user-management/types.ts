import type {
  Consultation,
  Gender,
  Guardian,
  History,
  Patient,
  PatientClinician,
  PatientProgress,
  User,
} from "@/types";

export type DoctorAccessStatus = "activo" | "inactivo";

export type DoctorManagementRow = {
  clinicianId: string;
  nombreCompleto: string;
  especialidad: string;
  numeroColegiatura: string;
  estadoAcceso: DoctorAccessStatus;
  consultasRealizadas: number;
  promedioMinutosPorPaciente: number | null;
  pacientesAtendidos: number;
};

export type DoctorPerformanceSummary = {
  totalMedicos: number;
  medicosActivos: number;
  medicosInactivos: number;
  totalConsultas: number;
  promedioGlobalMinutos: number | null;
};

export type PatientAgeRangeFilter =
  | "all"
  | "0-5"
  | "6-12"
  | "13-17"
  | "18-plus";

export type PatientSearchFilters = {
  ci: string;
  nombre: string;
  rangoEdad: PatientAgeRangeFilter;
};

export type PatientDirectoryRow = {
  patientId: string;
  nombreCompleto: string;
  ci: string;
  edadAnios: number;
  edadEtiqueta: string;
  rangoEdad: PatientAgeRangeFilter;
  rangoEdadEtiqueta: string;
  cantidadConsultas: number;
  ultimaConsultaEtiqueta: string;
  fechaNacimiento: Date;
};

export type DuplicatePatientGroup = {
  groupId: string;
  motivo: string;
  principalId: string;
  miembros: PatientDirectoryRow[];
};

export type AdminPatientsDataset = {
  users: User[];
  patients: Patient[];
  consultations: Consultation[];
  guardians: Guardian[];
  histories: History[];
  patientClinicians: PatientClinician[];
  patientProgress: PatientProgress[];
};

export type MergeDuplicateResult = {
  dataset: AdminPatientsDataset;
  principalId: string;
  mergedPatientIds: string[];
};

export type DoctorProfileFormData = {
  nombres: string;
  apellidos: string;
  ci: string;
  telefono: string;
  direccion: string;
  profesion: string;
  especialidad: string;
  numeroColegiatura: string;
  residencia: string;
  institucion: string;
};

export type DoctorProfileFormErrors = Partial<Record<keyof DoctorProfileFormData, string>> & {
  submit?: string;
};

export type PatientProfileFormData = {
  nombres: string;
  apellidos: string;
  ci: string;
  fechaNacimiento: string;
  sexoBiologico: "" | Gender;
  telefono: string;
  direccion: string;
  tutorNombres: string;
  tutorApellidos: string;
  tutorCi: string;
  tutorParentesco: string;
  tutorTelefono: string;
  tutorDireccion: string;
};

export type PatientProfileFormErrors = Partial<Record<keyof PatientProfileFormData, string>> & {
  submit?: string;
};
