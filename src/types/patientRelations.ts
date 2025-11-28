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

// Relación Paciente-Healthcare
export type PatientHealthcare = {
    patientHealthcareId: string;
    patientId: string;
    healthcareId: string;  // id del healthcare (no userId)
};