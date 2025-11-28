// Importamos tus tipos reales
import type { User } from "./user";
import type { Healthcare } from "./healthcare";

// Respuesta estándar de autenticación en Nutrisem
export interface AuthResponse {
    accessToken: string | null;
    user: User;        // Usuario del sistema (admin o Healthcare)
    Healthcare?: Healthcare; // Solo si el rol es Healthcare
}

// DTO para login
export interface LoginDto {
    identityCard: string;     // CI
    password: string;  // contraseña
}

// DTO para registro SOLO DE HealthcareES
export interface RegisterHealthcareDto {
    // Datos de User
    password: string;      // contraseña
    roleId: string;        // rol asignado (Healthcare)

    // Datos de Profile
    firstName: string;     // nombres
    lastName: string;      // apellidos
    identityCard: string;  // CI
    phone: string;         // teléfono
    address: string;       // dirección

    // Datos de Healthcare
    professionalId: string; // matrícula profesional
    profession: string;     // profesión
    specialty: string;      // especialidad
    residence: string;      // residencia
    institution: string;    // institución

    confirmPassword: string;
}