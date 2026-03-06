export type DiagnosisTabId = "summary" | "results";

export type BuildClinicianDiagnosisPathOptions = {
  patientId?: string | null;
  resultId?: string | null;
  tab?: DiagnosisTabId;
  step?: number | null;
};

const CLINICIAN_CONSULTATION_BASE_PATH = "/dashboard/clinician/consultation";
const CLINICIAN_DIAGNOSIS_BASE_PATH = "/dashboard/clinician/diagnosis";

function normalizeSegment(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return encodeURIComponent(trimmed);
}

function normalizeStep(step: number | null | undefined): number | null {
  if (typeof step !== "number" || !Number.isInteger(step) || step < 0) {
    return null;
  }

  return step;
}

export function buildClinicianConsultationPath(patientId?: string | null): string {
  const encodedPatientId = normalizeSegment(patientId);
  if (!encodedPatientId) return CLINICIAN_CONSULTATION_BASE_PATH;

  return `${CLINICIAN_CONSULTATION_BASE_PATH}/${encodedPatientId}`;
}

export function buildClinicianDiagnosisPath(
  options: BuildClinicianDiagnosisPathOptions = {}
): string {
  const encodedPatientId = normalizeSegment(options.patientId);
  const encodedResultId = normalizeSegment(options.resultId);

  let path = CLINICIAN_DIAGNOSIS_BASE_PATH;

  if (encodedPatientId) {
    path = `${path}/${encodedPatientId}`;
    if (encodedResultId) {
      path = `${path}/${encodedResultId}`;
    }
  }

  const queryParams = new URLSearchParams();
  if (options.tab) {
    queryParams.set("tab", options.tab);
  }

  const normalizedStep = normalizeStep(options.step);
  if (normalizedStep !== null) {
    queryParams.set("step", String(normalizedStep));
  }

  const queryString = queryParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}
