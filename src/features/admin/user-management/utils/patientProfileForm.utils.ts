import type { Guardian, Patient, User } from "@/types";
import { UserRole } from "@/types";
import type { Gender } from "@/types/patient";
import type { PatientProfileFormData, PatientProfileFormErrors } from "../types";

type ValidatePatientProfileFormInput = {
  form: PatientProfileFormData;
  users: User[];
  guardians: Guardian[];
  currentUserId?: string | null;
  currentGuardianId?: string | null;
};

type BuildPatientUserInput = {
  form: PatientProfileFormData;
  userId: string;
  password: string;
};

type BuildPatientEntityInput = {
  form: PatientProfileFormData;
  patientId: string;
  userId: string;
  birthDate: Date;
  gender: Gender;
};

type BuildGuardianEntityInput = {
  form: PatientProfileFormData;
  guardianId: string;
  patientId: string;
  password: string;
};

const EMPTY_PATIENT_PROFILE_FORM: PatientProfileFormData = {
  nombres: "",
  apellidos: "",
  ci: "",
  fechaNacimiento: "",
  sexoBiologico: "",
  telefono: "",
  direccion: "",
  tutorNombres: "",
  tutorApellidos: "",
  tutorCi: "",
  tutorParentesco: "Madre",
  tutorTelefono: "",
  tutorDireccion: "",
};

export function createEmptyPatientProfileFormData(): PatientProfileFormData {
  return { ...EMPTY_PATIENT_PROFILE_FORM };
}

export function sanitizePatientText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function sanitizePatientIdentityInput(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export function sanitizePatientPhoneInput(value: string): string {
  return value.trim().replace(/[^\d+]/g, "");
}

export function normalizePatientIdentity(value: string): string {
  return sanitizePatientIdentityInput(value).toLowerCase();
}

export function parsePatientBirthDate(value: string): Date | null {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatPatientBirthDateInput(value: Date | null | undefined): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildPatientTemporaryPassword(identityNumber: string): string {
  const digits = identityNumber.replace(/\D/g, "");
  const suffix = digits.slice(-4).padStart(4, "0");
  return `nutri${suffix}`;
}

export function mapPatientEntitiesToFormData(
  patient: Patient,
  user: User | null,
  guardian: Guardian | null
): PatientProfileFormData {
  return {
    nombres: sanitizePatientText(patient.firstName || user?.firstName || ""),
    apellidos: sanitizePatientText(patient.lastName || user?.lastName || ""),
    ci: sanitizePatientIdentityInput(patient.identityNumber || user?.identityNumber || ""),
    fechaNacimiento: formatPatientBirthDateInput(patient.birthDate),
    sexoBiologico: patient.gender ?? "",
    telefono: sanitizePatientPhoneInput(user?.phone ?? guardian?.phone ?? ""),
    direccion: sanitizePatientText(patient.address || user?.address || ""),
    tutorNombres: sanitizePatientText(guardian?.firstName ?? ""),
    tutorApellidos: sanitizePatientText(guardian?.lastName ?? ""),
    tutorCi: sanitizePatientIdentityInput(guardian?.identityNumber ?? ""),
    tutorParentesco: sanitizePatientText(guardian?.relationship ?? "Madre") || "Madre",
    tutorTelefono: sanitizePatientPhoneInput(guardian?.phone ?? user?.phone ?? ""),
    tutorDireccion: sanitizePatientText(guardian?.address ?? ""),
  };
}

export function validatePatientProfileForm({
  form,
  users,
  guardians,
  currentUserId = null,
  currentGuardianId = null,
}: ValidatePatientProfileFormInput): PatientProfileFormErrors {
  const errors: PatientProfileFormErrors = {};

  const nombres = sanitizePatientText(form.nombres);
  const apellidos = sanitizePatientText(form.apellidos);
  const ci = sanitizePatientIdentityInput(form.ci);
  const fechaNacimiento = parsePatientBirthDate(form.fechaNacimiento);
  const sexoBiologico = form.sexoBiologico;
  const telefono = sanitizePatientPhoneInput(form.telefono);
  const direccion = sanitizePatientText(form.direccion);

  const tutorNombres = sanitizePatientText(form.tutorNombres);
  const tutorApellidos = sanitizePatientText(form.tutorApellidos);
  const tutorCi = sanitizePatientIdentityInput(form.tutorCi);
  const tutorParentesco = sanitizePatientText(form.tutorParentesco);
  const tutorTelefono = sanitizePatientPhoneInput(form.tutorTelefono);
  const tutorDireccion = sanitizePatientText(form.tutorDireccion);

  if (!nombres) errors.nombres = "Ingresa los nombres del paciente.";
  if (!apellidos) errors.apellidos = "Ingresa los apellidos del paciente.";
  if (!ci) {
    errors.ci = "Ingresa el CI del paciente.";
  } else if (ci.length < 5) {
    errors.ci = "Ingresa un CI válido (mínimo 5 caracteres).";
  }

  if (!fechaNacimiento) {
    errors.fechaNacimiento = "Ingresa una fecha de nacimiento válida.";
  } else if (fechaNacimiento.getTime() > Date.now()) {
    errors.fechaNacimiento = "La fecha de nacimiento no puede ser futura.";
  }

  if (sexoBiologico !== "female" && sexoBiologico !== "male") {
    errors.sexoBiologico = "Selecciona el sexo biológico del paciente.";
  }

  if (!telefono) {
    errors.telefono = "Ingresa un teléfono de contacto.";
  } else if (telefono.replace(/\D/g, "").length < 7) {
    errors.telefono = "Ingresa un teléfono válido (mínimo 7 dígitos).";
  }

  if (!direccion) errors.direccion = "Ingresa la dirección del paciente.";

  if (!tutorNombres) errors.tutorNombres = "Ingresa los nombres del tutor.";
  if (!tutorApellidos) errors.tutorApellidos = "Ingresa los apellidos del tutor.";
  if (!tutorCi) {
    errors.tutorCi = "Ingresa el CI del tutor.";
  } else if (tutorCi.length < 5) {
    errors.tutorCi = "Ingresa un CI de tutor válido (mínimo 5 caracteres).";
  }
  if (!tutorParentesco) errors.tutorParentesco = "Ingresa el parentesco del tutor.";

  if (!tutorTelefono) {
    errors.tutorTelefono = "Ingresa el teléfono del tutor.";
  } else if (tutorTelefono.replace(/\D/g, "").length < 7) {
    errors.tutorTelefono = "Ingresa un teléfono válido (mínimo 7 dígitos).";
  }

  if (!tutorDireccion) errors.tutorDireccion = "Ingresa la dirección del tutor.";

  const duplicateUser = users.some((user) => {
    if (currentUserId && user.userId === currentUserId) return false;
    return normalizePatientIdentity(user.identityNumber) === normalizePatientIdentity(ci);
  });

  if (duplicateUser) {
    errors.ci = "Ya existe un usuario registrado con ese CI.";
  }

  const duplicateGuardian = guardians.some((guardian) => {
    if (currentGuardianId && guardian.guardianId === currentGuardianId) return false;
    return (
      normalizePatientIdentity(guardian.identityNumber) ===
      normalizePatientIdentity(tutorCi)
    );
  });

  if (duplicateGuardian) {
    errors.tutorCi = "Ya existe un tutor registrado con ese CI.";
  }

  return errors;
}

export function buildPatientUserFromForm({
  form,
  userId,
  password,
}: BuildPatientUserInput): User {
  return {
    userId,
    role: UserRole.patient,
    firstName: sanitizePatientText(form.nombres),
    lastName: sanitizePatientText(form.apellidos),
    identityNumber: sanitizePatientIdentityInput(form.ci),
    phone: sanitizePatientPhoneInput(form.telefono),
    address: sanitizePatientText(form.direccion),
    password,
  };
}

export function buildPatientEntityFromForm({
  form,
  patientId,
  userId,
  birthDate,
  gender,
}: BuildPatientEntityInput): Patient {
  return {
    patientId,
    userId,
    firstName: sanitizePatientText(form.nombres),
    lastName: sanitizePatientText(form.apellidos),
    identityNumber: sanitizePatientIdentityInput(form.ci),
    birthDate,
    gender,
    address: sanitizePatientText(form.direccion),
  };
}

export function buildGuardianEntityFromForm({
  form,
  guardianId,
  patientId,
  password,
}: BuildGuardianEntityInput): Guardian {
  return {
    guardianId,
    patientId,
    firstName: sanitizePatientText(form.tutorNombres),
    lastName: sanitizePatientText(form.tutorApellidos),
    identityNumber: sanitizePatientIdentityInput(form.tutorCi),
    phone: sanitizePatientPhoneInput(form.tutorTelefono),
    address: sanitizePatientText(form.tutorDireccion),
    relationship: sanitizePatientText(form.tutorParentesco),
    password,
  };
}
