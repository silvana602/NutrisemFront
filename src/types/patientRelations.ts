// Relación Paciente-Tutor
export type PatientTutor = {
    patientTutorId: string;
    patientId: string;
    firstName: string;
    lastName: string;
    identityCard: string;
    phone?: string;
    address: string;
    relation: string;    // ejemplo: "madre", "padre", "tía"
};

// Relación Paciente-clinician
export type Patientclinician = {
    patientclinicianId: string;
    patientId: string;
    clinicianId: string;  // id del clinician (no userId)
};