import { describe, expect, it } from "vitest";
import {
  buildClinicianConsultationPath,
  buildClinicianDiagnosisPath,
} from "@/lib/routes/clinician";

describe("clinician routes", () => {
  it("construye ruta base de consulta cuando no hay paciente", () => {
    expect(buildClinicianConsultationPath()).toBe("/dashboard/clinician/consultation");
  });

  it("construye ruta dinamica de consulta con patientId", () => {
    expect(buildClinicianConsultationPath("pat_123")).toBe(
      "/dashboard/clinician/consultation/pat_123"
    );
  });

  it("construye ruta dinamica de diagnostico para paciente y resultado", () => {
    expect(
      buildClinicianDiagnosisPath({
        patientId: "pat_123",
        resultId: "dia_456",
        tab: "results",
        step: 2,
      })
    ).toBe("/dashboard/clinician/diagnosis/pat_123/dia_456?tab=results&step=2");
  });

  it("omite segmentos vacios y query step invalido", () => {
    expect(
      buildClinicianDiagnosisPath({
        patientId: "   ",
        resultId: "dia_456",
        step: -1,
      })
    ).toBe("/dashboard/clinician/diagnosis");
  });
});
