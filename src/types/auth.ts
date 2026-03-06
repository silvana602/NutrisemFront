import type { Clinician } from "./clinician";
import type { User } from "./user";

export type AuthSessionResponse = {
  user: User;
  clinician?: Clinician | null;
};

// Mantiene compatibilidad con codigo legacy que aun usa accessToken.
export type AuthResponse = AuthSessionResponse & {
  accessToken?: string | null;
};

export type LoginDto = {
  identityCard: string;
  password: string;
};

export type RegisterClinicianDto = {
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
};
