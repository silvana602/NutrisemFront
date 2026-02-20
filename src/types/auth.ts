import type { Clinician } from "./clinician";
import type { User } from "./user";

export interface AuthSessionResponse {
  user: User;
  clinician?: Clinician | null;
}

// Mantiene compatibilidad con codigo legacy que aun usa accessToken.
export interface AuthResponse extends AuthSessionResponse {
  accessToken?: string | null;
}

export interface LoginDto {
  identityCard: string;
  password: string;
}

export interface RegisterClinicianDto {
  password: string;
  roleId: string;
  firstName: string;
  lastName: string;
  identityCard: string;
  phone: string;
  address: string;
  professionalId: string;
  profession: string;
  specialty: string;
  residence: string;
  institution: string;
  confirmPassword: string;
}
