// Importamos tus tipos reales
import type { User } from "./user";
import type { Clinician } from "./clinician";

// Respuesta estándar de autenticación en Nutrisem
export interface AuthResponse {
    accessToken: string | null;
    user: User;        // Usuario del sistema (admin o clinician)
    clinician?: Clinician; // Solo si el rol es clinician
}

// DTO para login
export interface LoginDto {
    identityCard: string;     // CI
    password: string;  // contraseña
}

// DTO para registro SOLO DE CLINICIANS
export interface RegisterClinicianDto {
    // Datos de User
    password: string;      // contraseña
    roleId: string;        // rol asignado (clinician)

    // Datos de Profile
    firstName: string;     // nombres
    lastName: string;      // apellidos
    identityCard: string;  // CI
    phone: string;         // teléfono
    address: string;       // dirección

    // Datos de clinician
    professionalId: string; // matrícula profesional
    profession: string;     // profesión
    specialty: string;      // especialidad
    residence: string;      // residencia
    institution: string;    // institución

    confirmPassword: string;
}