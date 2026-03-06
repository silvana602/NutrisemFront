import type {
  PasswordFormData,
  PasswordFormErrors,
  ProfileFormData,
  ProfileFormErrors,
  TutorLegalData,
  TutorLegalDataErrors,
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

export function validateTutorLegalData(data: TutorLegalData): TutorLegalDataErrors {
  const errors: TutorLegalDataErrors = {};
  const nombreTutor = normalizeSpaces(data.nombreTutor);
  const cedulaTutor = normalizeSpaces(data.cedulaTutor);
  const parentescoTutor = normalizeSpaces(data.parentescoTutor);
  const telefonoTutor = normalizeSpaces(data.telefonoTutor);
  const direccionTutor = normalizeSpaces(data.direccionTutor);

  if (!nombreTutor) {
    errors.nombreTutor = "Ingresa el nombre completo del tutor.";
  } else if (nombreTutor.split(" ").length < 2) {
    errors.nombreTutor = "Incluye nombre y apellido del tutor.";
  }

  if (!cedulaTutor) {
    errors.cedulaTutor = "Ingresa la cédula de identidad del tutor.";
  } else if (cedulaTutor.length < 5) {
    errors.cedulaTutor = "La cédula del tutor parece incompleta.";
  }

  if (!parentescoTutor) {
    errors.parentescoTutor = "Ingresa el parentesco o vínculo legal.";
  }

  if (!telefonoTutor) {
    errors.telefonoTutor = "Ingresa un teléfono de contacto.";
  } else if (telefonoTutor.replace(/[^\d+]/g, "").length < 7) {
    errors.telefonoTutor = "Ingresa un teléfono válido.";
  }

  if (!direccionTutor) {
    errors.direccionTutor = "Ingresa la dirección del tutor.";
  } else if (direccionTutor.length < 6) {
    errors.direccionTutor = "La dirección parece incompleta.";
  }

  return errors;
}
