import { db } from "@/mocks/db";
import { uid } from "@/mocks/utils";
import type { AuthResponse, LoginDto, RegisterClinicianDto } from "@/types/auth";
import { UserRole, type User } from "@/types/user";
import type { Clinician } from "@/types/clinician";

export const AuthService = {
  /**
   * Login de usuario (CI + contrasena)
   */
  login: (dto: LoginDto): AuthResponse | null => {
    const user = db.users.find((u) => u.identityNumber === dto.identityCard);
    if (!user) return null;

    if (user.password !== dto.password) return null;

    const clinician =
      user.role === UserRole.clinician
        ? db.clinicians.find((c) => c.userId === user.userId) ?? undefined
        : undefined;

    const accessToken = uid("token");

    return {
      accessToken,
      user,
      clinician,
    };
  },

  /**
   * Obtener el usuario actual a partir del token (mock basico)
   */
  me: (token: string | null): AuthResponse | null => {
    if (!token) return null;

    const user = db.users[0];
    if (!user) return null;

    const clinician =
      user.role === UserRole.clinician
        ? db.clinicians.find((c) => c.userId === user.userId) ?? undefined
        : undefined;

    return {
      accessToken: token,
      user,
      clinician,
    };
  },

  /**
   * Logout (solo limpia token en frontend)
   */
  logout: (): void => {
    console.log("Usuario desconectado");
  },

  /**
   * Registro de clinician
   */
  registerClinician: (dto: RegisterClinicianDto): AuthResponse | null => {
    if (dto.password !== dto.confirmPassword) {
      throw new Error("Las contrasenas no coinciden");
    }

    if (db.users.find((u) => u.identityNumber === dto.identityCard)) {
      throw new Error("El CI ya existe en el sistema");
    }

    const userId = uid("usr");
    const user: User = {
      userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      identityNumber: dto.identityCard,
      phone: dto.phone,
      address: dto.address,
      role: UserRole.clinician,
      password: dto.password,
    };
    db.users.push(user);

    const clinician: Clinician = {
      clinicianId: uid("cli"),
      userId,
      professionalLicense: dto.professionalId,
      profession: dto.profession,
      specialty: dto.specialty,
      residence: dto.residence,
      institution: dto.institution,
    };
    db.clinicians.push(clinician);

    const accessToken = uid("token");
    return { accessToken, user, clinician };
  },

  /**
   * Cambiar contrasena
   */
  changePassword: (userId: string, newPassword: string): boolean => {
    const user = db.users.find((u) => u.userId === userId);
    if (!user) return false;
    user.password = newPassword;
    return true;
  },
};
