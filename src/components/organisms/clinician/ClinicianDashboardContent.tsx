"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardCheck, FileClock } from "lucide-react";

import { Heading } from "@/components/atoms/Heading";
import { IconButton } from "@/components/atoms/IconButton";
import {
  LastPatientCard,
  type LastPatientCardData,
  type LastPatientTrendDirection,
} from "@/components/molecules/LastPatientCard";
import { Button } from "@/components/ui/Button";

import { db, seedOnce } from "@/mocks/db";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import { useConsultationStore } from "@/store/useConsultationStore";

import type { User } from "@/types/user";

interface Props {
  user: User;
}

type DashboardConsultationRecord = {
  recordId: string;
  consultationId: string | null;
  patientId: string;
  patientName: string;
  guardianName: string;
  identityNumber: string;
  ageLabel: string;
  genderLabel: string;
  date: Date;
  dateLabel: string;
  weightKg: number | null;
  heightM: number | null;
  nutritionalStatus: string;
  zScore: number | null;
  source: "history" | "snapshot";
};

type HistoricalDashboardConsultationRecord = Omit<
  DashboardConsultationRecord,
  "consultationId" | "source"
> & {
  consultationId: string;
  source: "history";
};

type AlertRecord = {
  item: DashboardConsultationRecord;
  reason: string;
};

type WeightTrend = {
  direction: LastPatientTrendDirection;
  label: string;
};

seedOnce();

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function deriveStatusFromSnapshot(zScore?: number): string {
  if (typeof zScore !== "number") return "Sin diagnostico";
  if (zScore <= -3) return "Desnutricion aguda severa";
  if (zScore <= -2) return "Desnutricion aguda moderada";
  if (zScore < -1) return "Riesgo de desnutricion";
  if (zScore <= 1) return "Eutrofico";
  if (zScore <= 2) return "Sobrepeso";
  return "Obesidad";
}

function formatZScore(zScore: number | null): string {
  if (zScore === null || !Number.isFinite(zScore)) return "Sin dato";
  return zScore.toFixed(2);
}

function formatWeight(weightKg: number | null): string {
  if (weightKg === null || !Number.isFinite(weightKg)) return "Sin dato";
  return `${weightKg.toFixed(2)} kg`;
}

function formatHeight(heightM: number | null): string {
  if (heightM === null || !Number.isFinite(heightM)) return "Sin dato";
  return `${heightM.toFixed(2)} m`;
}

function getWeightTrend(currentWeightKg: number | null, previousWeightKg: number | null): WeightTrend {
  if (currentWeightKg === null || previousWeightKg === null) {
    return {
      direction: "no-data",
      label: "Sin datos comparables",
    };
  }

  const deltaKg = Number((currentWeightKg - previousWeightKg).toFixed(2));
  if (Math.abs(deltaKg) < 0.05) {
    return {
      direction: "stable",
      label: "Peso estable frente al control previo",
    };
  }

  if (deltaKg > 0) {
    return {
      direction: "up",
      label: `Subio ${deltaKg.toFixed(2)} kg frente al control previo`,
    };
  }

  return {
    direction: "down",
    label: `Bajo ${Math.abs(deltaKg).toFixed(2)} kg frente al control previo`,
  };
}

function buildDiagnosisHref(patientId: string, resultId: string | null): string {
  const params = new URLSearchParams({
    patientId,
    tab: "summary",
    step: "0",
  });

  if (resultId) {
    params.set("resultId", resultId);
  }

  return `/dashboard/clinician/diagnosis?${params.toString()}`;
}

function getCriticalAlertReason(item: DashboardConsultationRecord): string | null {
  const status = normalizeText(item.nutritionalStatus);

  if (typeof item.zScore === "number" && item.zScore <= -3) {
    return "Z-score menor o igual a -3.";
  }

  if (typeof item.zScore === "number" && item.zScore <= -2) {
    return "Z-score menor o igual a -2.";
  }

  if (status.includes("desnutricion") && status.includes("aguda")) {
    return "Desnutricion aguda detectada.";
  }

  if (status.includes("desnutricion") && status.includes("severa")) {
    return "Desnutricion severa detectada.";
  }

  if (status.includes("riesgo") && status.includes("desnutricion")) {
    return "Riesgo nutricional relevante.";
  }

  return null;
}

export const ClinicianDashboardContent: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const snapshot = useConsultationStore((state) => state.lastSavedConsultation);

  const clinician = db.clinicians.find((item) => item.userId === user.userId) ?? null;
  if (!clinician) return null;

  const assignedPatientIds = db.patientClinicians
    .filter((item) => item.clinicianId === clinician.clinicianId)
    .map((item) => item.patientId);

  const assignedPatientIdSet = new Set(assignedPatientIds);

  const patientsById = new Map(
    db.patients
      .filter((patient) => assignedPatientIdSet.has(patient.patientId))
      .map((patient) => [patient.patientId, patient] as const)
  );

  const usersById = new Map(db.users.map((item) => [item.userId, item] as const));
  const guardiansByPatientId = new Map(db.guardians.map((item) => [item.patientId, item] as const));

  const historicalRecords: HistoricalDashboardConsultationRecord[] = db.consultations
    .filter((consultation) => assignedPatientIdSet.has(consultation.patientId))
    .map((consultation) => {
      const patient = patientsById.get(consultation.patientId);
      if (!patient) return null;

      const patientUser = usersById.get(patient.userId);
      if (!patientUser) return null;

      const guardian = guardiansByPatientId.get(patient.patientId) ?? null;
      const diagnosis = db.diagnoses.find((item) => item.consultationId === consultation.consultationId) ?? null;
      const anthropometric =
        db.anthropometricData.find((item) => item.consultationId === consultation.consultationId) ?? null;

      return {
        recordId: diagnosis?.diagnosisId ?? consultation.consultationId,
        consultationId: consultation.consultationId,
        patientId: patient.patientId,
        patientName: `${patientUser.firstName} ${patientUser.lastName}`,
        guardianName: guardian
          ? `${guardian.firstName} ${guardian.lastName}`
          : "Sin tutor registrado",
        identityNumber: patientUser.identityNumber ?? patient.identityNumber,
        ageLabel: formatPediatricAge(calculateAgeInMonths(patient.birthDate, consultation.date)),
        genderLabel: patient.gender === "female" ? "Femenino" : "Masculino",
        date: consultation.date,
        dateLabel: consultation.date.toLocaleDateString("es-BO"),
        weightKg: anthropometric?.weightKg ?? null,
        heightM: anthropometric?.heightM ?? null,
        nutritionalStatus: diagnosis?.nutritionalDiagnosis ?? "Sin diagnostico",
        zScore: diagnosis?.zScorePercentile ?? null,
        source: "history" as const,
      };
    })
    .filter((item): item is HistoricalDashboardConsultationRecord => item !== null)
    .sort((first, second) => second.date.getTime() - first.date.getTime());

  const snapshotRecord: DashboardConsultationRecord | null = snapshot
    ? (() => {
        if (!assignedPatientIdSet.has(snapshot.patientId)) return null;

        const patient = patientsById.get(snapshot.patientId);
        if (!patient) return null;

        const patientUser = usersById.get(patient.userId);
        if (!patientUser) return null;

        const guardian = guardiansByPatientId.get(patient.patientId) ?? null;
        const snapshotDate = new Date(snapshot.savedAt);
        if (Number.isNaN(snapshotDate.getTime())) return null;

        return {
          recordId: `snapshot-${snapshot.savedAt}`,
          consultationId: null,
          patientId: patient.patientId,
          patientName: `${patientUser.firstName} ${patientUser.lastName}`,
          guardianName: guardian
            ? `${guardian.firstName} ${guardian.lastName}`
            : "Sin tutor registrado",
          identityNumber: patientUser.identityNumber ?? patient.identityNumber,
          ageLabel: formatPediatricAge(calculateAgeInMonths(patient.birthDate, snapshotDate)),
          genderLabel: patient.gender === "female" ? "Femenino" : "Masculino",
          date: snapshotDate,
          dateLabel: new Intl.DateTimeFormat("es-BO", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(snapshotDate),
          weightKg:
            typeof snapshot.anthropometric.weightKg === "number"
              ? snapshot.anthropometric.weightKg
              : null,
          heightM:
            typeof snapshot.anthropometric.heightM === "number"
              ? snapshot.anthropometric.heightM
              : null,
          nutritionalStatus: deriveStatusFromSnapshot(snapshot.anthropometric.zScore),
          zScore:
            typeof snapshot.anthropometric.zScore === "number"
              ? snapshot.anthropometric.zScore
              : null,
          source: "snapshot",
        };
      })()
    : null;

  const allRecentRecords: DashboardConsultationRecord[] = [...historicalRecords, ...(snapshotRecord ? [snapshotRecord] : [])]
    .sort((first, second) => second.date.getTime() - first.date.getTime());

  const latestRecord = allRecentRecords[0] ?? null;

  const previousSamePatientRecord =
    latestRecord
      ? allRecentRecords.find(
          (item) =>
            item.patientId === latestRecord.patientId &&
            item.recordId !== latestRecord.recordId
        ) ?? null
      : null;

  const latestTrend = getWeightTrend(
    latestRecord?.weightKg ?? null,
    previousSamePatientRecord?.weightKg ?? null
  );

  const lastPatientCardData: LastPatientCardData | null = latestRecord
    ? {
        name: latestRecord.patientName,
        parentName: latestRecord.guardianName,
        idCard: latestRecord.identityNumber,
        age: latestRecord.ageLabel,
        weight: formatWeight(latestRecord.weightKg),
        gender: latestRecord.genderLabel,
        height: formatHeight(latestRecord.heightM),
        status: latestRecord.nutritionalStatus,
        zScore: formatZScore(latestRecord.zScore),
        trendDirection: latestTrend.direction,
        trendLabel: latestTrend.label,
        consultationDate: latestRecord.dateLabel,
        diagnosisHref: buildDiagnosisHref(latestRecord.patientId, latestRecord.recordId),
      }
    : null;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const criticalAlerts: AlertRecord[] = allRecentRecords
    .filter((item) => item.date.getTime() >= weekAgo.getTime())
    .map((item) => {
      const reason = getCriticalAlertReason(item);
      if (!reason) return null;
      return { item, reason };
    })
    .filter((item): item is AlertRecord => item !== null)
    .slice(0, 5);

  const recentConsultations = historicalRecords.slice(0, 5);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Heading
        variant="panel"
        eyebrow="Inicio del profesional"
        description="Aqui tienes un resumen rapido de alertas, consultas recientes y el ultimo paciente atendido."
      >
        Bienvenid@, Dr(a) {user.firstName} {user.lastName}
      </Heading>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <IconButton
          label="Nueva consulta"
          className="w-full justify-center sm:w-auto"
          onClick={() => router.push("/dashboard/clinician/consultation")}
        />
        <IconButton
          label="Nuevo paciente"
          className="w-full justify-center sm:w-auto"
          onClick={() => router.push("/dashboard/clinician/patients/new")}
        />
      </div>

      <section className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm sm:p-5">
        <header className="mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-700" />
          <h2 className="text-base font-semibold text-rose-700">Alertas criticas de la semana</h2>
        </header>

        {criticalAlerts.length === 0 ? (
          <p className="text-sm text-nutri-dark-grey">
            No hay alertas criticas registradas en los ultimos 7 dias.
          </p>
        ) : (
          <div className="space-y-2">
            {criticalAlerts.map(({ item, reason }) => (
              <article
                key={`alert-${item.recordId}`}
                className="rounded-lg border border-rose-200 bg-nutri-white p-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-nutri-primary">{item.patientName}</p>
                    <p className="text-xs text-nutri-dark-grey">
                      {item.dateLabel} | {item.nutritionalStatus}
                    </p>
                    <p className="text-xs text-rose-700">{reason}</p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-fit text-xs"
                    onClick={() => router.push(buildDiagnosisHref(item.patientId, item.recordId))}
                  >
                    Ver diagnostico
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <header>
          <h2 className="text-lg font-semibold text-nutri-dark-grey">Consultas recientes</h2>
        </header>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
            <header className="mb-2 flex items-center gap-2">
              <FileClock size={16} className="text-nutri-primary" />
              <h3 className="text-sm font-semibold text-nutri-primary">Ficha en curso</h3>
            </header>

            {!snapshotRecord ? (
              <p className="text-sm text-nutri-dark-grey">No hay fichas pendientes para retomar.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-nutri-dark-grey">
                  {snapshotRecord.patientName} | {snapshotRecord.dateLabel}
                </p>
                <p className="text-xs text-nutri-dark-grey/80">
                  Peso: {formatWeight(snapshotRecord.weightKg)} | Z-score:{" "}
                  {formatZScore(snapshotRecord.zScore)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs"
                  onClick={() => router.push("/dashboard/clinician/consultation")}
                >
                  Retomar consulta
                </Button>
              </div>
            )}
          </article>

          <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
            <header className="mb-2 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-nutri-primary" />
              <h3 className="text-sm font-semibold text-nutri-primary">Pacientes recien atendidos</h3>
            </header>

            {recentConsultations.length === 0 ? (
              <p className="text-sm text-nutri-dark-grey">No hay consultas registradas.</p>
            ) : (
              <div className="space-y-2">
                {recentConsultations.map((item) => (
                  <div
                    key={`recent-${item.recordId}`}
                    className="flex flex-col gap-2 rounded-lg border border-nutri-light-grey bg-nutri-off-white/60 p-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-nutri-dark-grey">{item.patientName}</p>
                      <p className="text-xs text-nutri-dark-grey/80">
                        {item.dateLabel} | {item.nutritionalStatus}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-fit text-xs"
                      onClick={() => router.push(buildDiagnosisHref(item.patientId, item.recordId))}
                    >
                      Abrir diagnostico
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="space-y-3">
        <header>
          <h2 className="text-lg font-semibold text-nutri-dark-grey">Ultimo paciente</h2>
        </header>

        {lastPatientCardData ? (
          <LastPatientCard patient={lastPatientCardData} />
        ) : (
          <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
            <p className="text-sm text-nutri-dark-grey">
              No hay consultas registradas para los pacientes asignados.
            </p>
          </article>
        )}
      </section>
    </div>
  );
};
