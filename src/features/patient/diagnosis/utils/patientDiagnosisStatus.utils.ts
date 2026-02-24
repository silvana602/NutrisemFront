import type { PatientDiagnosisStatusTone } from "../types";
import { normalizeText } from "./patientDiagnosisFormatting.utils";

export function inferDiagnosisStatusTone(status: string): PatientDiagnosisStatusTone {
  const normalized = normalizeText(status || "");

  if (normalized.includes("normal") || normalized.includes("eutro")) {
    return "green";
  }

  if (normalized.includes("riesgo") || normalized.includes("sobrepeso")) {
    return "yellow";
  }

  if (
    normalized.includes("desnutricion") ||
    normalized.includes("obesidad") ||
    normalized.includes("bajo peso")
  ) {
    return "red";
  }

  return "yellow";
}

export function getStatusDotClassName(tone: PatientDiagnosisStatusTone): string {
  if (tone === "green") return "bg-emerald-500";
  if (tone === "yellow") return "bg-amber-500";
  return "bg-rose-500";
}

export function getStatusTagClassName(tone: PatientDiagnosisStatusTone): string {
  if (tone === "green") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "yellow") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}
