import { db } from "@/mocks/db";
import { uid } from "@/mocks/utils";
import type { AuthResponse, LoginDto, RegisterHealthcareDto } from "@/types/auth";
import type { User } from "@/types/user";
import type { Healthcare } from "@/types/healthcare";

export const AuthService = {
  /**
   * Login de usuario (CI + contraseña)
   */
  login: (dto: LoginDto): AuthResponse | null => {
    // Buscar usuario por CI
    const user = db.users.find((u) => u.identityCard === dto.identityCard);
    if (!user) return null;

    // Validar contraseña
    if (user.password !== dto.password) return null;

    // Si el usuario es Healthcare, obtener Healthcare asociado
    const Healthcare =
      user.role === "healthcare"
        ? db.Healthcares.find((m) => m.userId === user.userId) ?? undefined
        : undefined;

    // Generar token simulado
    const accessToken = uid("token");

    return {
      accessToken,
      user,
      Healthcare,
    };
  },

  /**
   * Obtener el usuario actual a partir del token (mock básico)
   */
  me: (token: string | null): AuthResponse | null => {
    if (!token) return null;

    const anyUser = db.users[0];
    if (!anyUser) return null;

    const Healthcare =
      anyUser.role === "healthcare"
        ? db.Healthcares.find((m) => m.userId === anyUser.userId) ?? undefined
        : undefined;

    return {
      accessToken: token,
      user: anyUser,
      Healthcare,
    };
  },

  /**
   * Logout (solo limpia token en frontend)
   */
  logout: (): void => {
    console.log("Usuario desconectado");
  },

  /**
   * Registro de Healthcare
   */
  registerHealthcare: (dto: RegisterHealthcareDto): AuthResponse | null => {
    if (dto.password !== dto.confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }

    // Validar CI único
    if (db.users.find((u) => u.identityCard === dto.identityCard)) {
      throw new Error("El CI ya existe en el sistema");
    }

    // Crear usuario
    const userId = uid("usr");
    const user: User = {
      userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      identityCard: dto.identityCard,
      phone: dto.phone,
      address: dto.address,
      role: "healthcare",
      password: dto.password,
    };
    db.users.push(user);

    // Crear Healthcare
    const Healthcare: Healthcare = {
      healthcareId: uid("mon"),
      userId,
      professionalId: dto.professionalId,
      profession: dto.profession,
      specialty: dto.specialty,
      residence: dto.residence,
      institution: dto.institution,
    };
    db.Healthcares.push(Healthcare);

    const accessToken = uid("token");

    return { accessToken, user, Healthcare };
  },

  /**
   * Cambiar contraseña
   */
  changePassword: (userId: string, newPassword: string): boolean => {
    const user = db.users.find((u) => u.userId === userId);
    if (!user) return false;
    user.password = newPassword;
    return true;
  },
};
