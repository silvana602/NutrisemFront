// Tipo de Paciente
import { PatientTutor } from "./patientRelations";

export type Gender = "male" | "female" | "other";

export type Patient = {
    patientId: string;
    userId: string;          
    birthDate: string;
    gender: Gender;
    tutors: PatientTutor[];
};
