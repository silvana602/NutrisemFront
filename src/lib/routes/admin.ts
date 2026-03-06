const ADMIN_DOCTORS_BASE_PATH = "/dashboard/admin/users/medicos";
const ADMIN_PATIENTS_BASE_PATH = "/dashboard/admin/users/pacientes";

function normalizeSegment(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return encodeURIComponent(trimmed);
}

export function buildAdminDoctorProfilePath(clinicianId?: string | null): string {
  const encodedClinicianId = normalizeSegment(clinicianId);
  if (!encodedClinicianId) return ADMIN_DOCTORS_BASE_PATH;
  return `${ADMIN_DOCTORS_BASE_PATH}/${encodedClinicianId}`;
}

export function buildAdminPatientProfilePath(patientId?: string | null): string {
  const encodedPatientId = normalizeSegment(patientId);
  if (!encodedPatientId) return ADMIN_PATIENTS_BASE_PATH;
  return `${ADMIN_PATIENTS_BASE_PATH}/${encodedPatientId}`;
}
