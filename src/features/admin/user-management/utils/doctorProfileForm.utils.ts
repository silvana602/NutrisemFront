import type { Clinician, User } from "@/types";
import { UserRole } from "@/types";
import type {
  DoctorProfileFormData,
  DoctorProfileFormErrors,
} from "../types";

type ValidateDoctorProfileFormInput = {
  form: DoctorProfileFormData;
  users: User[];
  clinicians: Clinician[];
  currentUserId?: string | null;
  currentClinicianId?: string | null;
};

type BuildDoctorUserInput = {
  form: DoctorProfileFormData;
  userId: string;
  password: string;
};

type BuildDoctorClinicianInput = {
  form: DoctorProfileFormData;
  clinicianId: string;
  userId: string;
};

const EMPTY_DOCTOR_PROFILE_FORM: DoctorProfileFormData = {
  nombres: "",
  apellidos: "",
  ci: "",
  telefono: "",
  direccion: "",
  profesion: "",
  especialidad: "",
  numeroColegiatura: "",
  residencia: "",
  institucion: "",
};

export function createEmptyDoctorProfileFormData(): DoctorProfileFormData {
  return { ...EMPTY_DOCTOR_PROFILE_FORM };
}

export function sanitizeDoctorText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function sanitizeDoctorIdentityInput(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export function sanitizeDoctorPhoneInput(value: string): string {
  return value.trim().replace(/[^\d+]/g, "");
}

export function sanitizeDoctorLicenseInput(value: string): string {
  return sanitizeDoctorText(value).toUpperCase();
}

export function normalizeDoctorIdentity(value: string): string {
  return sanitizeDoctorIdentityInput(value).toLowerCase();
}

export function normalizeLicense(value: string): string {
  return sanitizeDoctorLicenseInput(value).toLowerCase();
}

export function buildDoctorTemporaryPassword(identityNumber: string): string {
  const digits = identityNumber.replace(/\D/g, "");
  const suffix = digits.slice(-4).padStart(4, "0");
  return `doc${suffix}`;
}

export function mapDoctorEntitiesToFormData(
  clinician: Clinician,
  user: User | null
): DoctorProfileFormData {
  return {
    nombres: sanitizeDoctorText(user?.firstName ?? ""),
    apellidos: sanitizeDoctorText(user?.lastName ?? ""),
    ci: sanitizeDoctorIdentityInput(user?.identityNumber ?? ""),
    telefono: sanitizeDoctorPhoneInput(user?.phone ?? ""),
    direccion: sanitizeDoctorText(user?.address ?? ""),
    profesion: sanitizeDoctorText(clinician.profession ?? ""),
    especialidad: sanitizeDoctorText(clinician.specialty ?? ""),
    numeroColegiatura: sanitizeDoctorLicenseInput(clinician.professionalLicense ?? ""),
    residencia: sanitizeDoctorText(clinician.residence ?? ""),
    institucion: sanitizeDoctorText(clinician.institution ?? ""),
  };
}

export function validateDoctorProfileForm({
  form,
  users,
  clinicians,
  currentUserId = null,
  currentClinicianId = null,
}: ValidateDoctorProfileFormInput): DoctorProfileFormErrors {
  const errors: DoctorProfileFormErrors = {};

  const nombres = sanitizeDoctorText(form.nombres);
  const apellidos = sanitizeDoctorText(form.apellidos);
  const ci = sanitizeDoctorIdentityInput(form.ci);
  const telefono = sanitizeDoctorPhoneInput(form.telefono);
  const direccion = sanitizeDoctorText(form.direccion);
  const profesion = sanitizeDoctorText(form.profesion);
  const especialidad = sanitizeDoctorText(form.especialidad);
  const numeroColegiatura = sanitizeDoctorLicenseInput(form.numeroColegiatura);
  const residencia = sanitizeDoctorText(form.residencia);
  const institucion = sanitizeDoctorText(form.institucion);

  if (!nombres) errors.nombres = "Ingresa los nombres del médico.";
  if (!apellidos) errors.apellidos = "Ingresa los apellidos del médico.";
  if (!ci) errors.ci = "Ingresa el CI del médico.";
  if (ci && ci.length < 5) {
    errors.ci = "Ingresa un CI válido (mínimo 5 caracteres).";
  }
  if (!telefono) errors.telefono = "Ingresa un teléfono de contacto.";
  if (telefono && telefono.replace(/\D/g, "").length < 7) {
    errors.telefono = "Ingresa un teléfono válido (mínimo 7 dígitos).";
  }
  if (!direccion) errors.direccion = "Ingresa la dirección del médico.";
  if (!profesion) errors.profesion = "Ingresa la profesión.";
  if (!especialidad) errors.especialidad = "Ingresa la especialidad.";
  if (!numeroColegiatura) {
    errors.numeroColegiatura = "Ingresa el número de colegiatura.";
  }
  if (numeroColegiatura && numeroColegiatura.length < 4) {
    errors.numeroColegiatura =
      "Ingresa un número de colegiatura válido (mínimo 4 caracteres).";
  }
  if (!residencia) errors.residencia = "Ingresa la residencia.";
  if (!institucion) errors.institucion = "Ingresa la institución.";

  const duplicateUser = users.some((user) => {
    if (currentUserId && user.userId === currentUserId) return false;
    return (
      normalizeDoctorIdentity(user.identityNumber) ===
      normalizeDoctorIdentity(ci)
    );
  });

  if (duplicateUser) {
    errors.ci = "Ya existe un usuario registrado con ese CI.";
  }

  const duplicateLicense = clinicians.some((clinician) => {
    if (currentClinicianId && clinician.clinicianId === currentClinicianId) {
      return false;
    }
    return (
      normalizeLicense(clinician.professionalLicense) ===
      normalizeLicense(numeroColegiatura)
    );
  });

  if (duplicateLicense) {
    errors.numeroColegiatura = "Ya existe un médico con ese número de colegiatura.";
  }

  return errors;
}

export function buildDoctorUserFromForm({
  form,
  userId,
  password,
}: BuildDoctorUserInput): User {
  return {
    userId,
    role: UserRole.clinician,
    firstName: sanitizeDoctorText(form.nombres),
    lastName: sanitizeDoctorText(form.apellidos),
    identityNumber: sanitizeDoctorIdentityInput(form.ci),
    phone: sanitizeDoctorPhoneInput(form.telefono),
    address: sanitizeDoctorText(form.direccion),
    password,
  };
}

export function buildDoctorClinicianFromForm({
  form,
  clinicianId,
  userId,
}: BuildDoctorClinicianInput): Clinician {
  return {
    clinicianId,
    userId,
    professionalLicense: sanitizeDoctorLicenseInput(form.numeroColegiatura),
    profession: sanitizeDoctorText(form.profesion),
    specialty: sanitizeDoctorText(form.especialidad),
    residence: sanitizeDoctorText(form.residencia),
    institution: sanitizeDoctorText(form.institucion),
  };
}
