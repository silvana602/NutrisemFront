import type {
  PasswordFormData,
  PasswordFormErrors,
  ProfileFormData,
  ProfileFormErrors,
} from "../types/settings.types";

export function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const normalized = normalizeSpaces(fullName);
  const parts = normalized.split(" ").filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? "",
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function validateProfileForm(data: ProfileFormData): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  const nombre = normalizeSpaces(data.nombreCompleto);

  if (!nombre) {
    errors.nombreCompleto = "Ingresa tu nombre completo.";
  } else if (nombre.split(" ").length < 2) {
    errors.nombreCompleto = "Ingresa nombre y apellido.";
  }

  return errors;
}

export function validatePasswordForm(
  data: PasswordFormData,
  currentPassword: string
): PasswordFormErrors {
  const errors: PasswordFormErrors = {};

  if (!data.contrasenaActual) {
    errors.contrasenaActual = "Ingresa tu contraseña actual.";
  } else if (data.contrasenaActual !== currentPassword) {
    errors.contrasenaActual = "La contraseña actual no coincide.";
  }

  if (!data.nuevaContrasena) {
    errors.nuevaContrasena = "Ingresa una nueva contraseña.";
  } else if (data.nuevaContrasena.length < 6) {
    errors.nuevaContrasena = "La nueva contraseña debe tener al menos 6 caracteres.";
  } else if (data.nuevaContrasena === data.contrasenaActual) {
    errors.nuevaContrasena = "La nueva contraseña debe ser diferente a la actual.";
  }

  if (!data.confirmarNuevaContrasena) {
    errors.confirmarNuevaContrasena = "Confirma la nueva contraseña.";
  } else if (data.nuevaContrasena !== data.confirmarNuevaContrasena) {
    errors.confirmarNuevaContrasena = "La confirmación no coincide.";
  }

  return errors;
}
