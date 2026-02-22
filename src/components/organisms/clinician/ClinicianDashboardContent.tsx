"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { IconButton } from "@/components/atoms/IconButton";
import { type LastPatientCardData } from "@/components/molecules/LastPatientCard";
import { db, seedOnce } from "@/mocks/db";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import { useConsultationStore } from "@/store/useConsultationStore";
import type { User } from "@/types/user";

import {
  ClinicianDashboardHero,
  CriticalAlertsSection,
  LastPatientSection,
  RecentConsultationsSection,
} from "@/features/clinician/dashboard/components";
import {
  buildDiagnosisHref,
  buildSnapshotDateLabel,
  createSnapshotRecordId,
  deriveStatusFromSnapshot,
  formatHeight,
  formatWeight,
  formatZScore,
  getCriticalAlertReason,
  getWeightTrend,
  toNullableNumber,
} from "@/features/clinician/dashboard/utils";
import type {
  AlertRecord,
  DashboardConsultationRecord,
  HistoricalDashboardConsultationRecord,
} from "@/features/clinician/dashboard/types";

interface Props {
  user: User;
}

seedOnce();

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
          recordId: createSnapshotRecordId(snapshot),
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
          dateLabel: buildSnapshotDateLabel(snapshotDate),
          weightKg: toNullableNumber(snapshot.anthropometric.weightKg),
          heightM: toNullableNumber(snapshot.anthropometric.heightM),
          nutritionalStatus: deriveStatusFromSnapshot(snapshot.anthropometric.zScore),
          zScore: toNullableNumber(snapshot.anthropometric.zScore),
          source: "snapshot",
        };
      })()
    : null;

  const allRecentRecords: DashboardConsultationRecord[] = [
    ...historicalRecords,
    ...(snapshotRecord ? [snapshotRecord] : []),
  ].sort((first, second) => second.date.getTime() - first.date.getTime());

  const latestRecord = allRecentRecords[0] ?? null;

  const previousSamePatientRecord =
    latestRecord
      ? allRecentRecords.find(
          (item) =>
            item.patientId === latestRecord.patientId && item.recordId !== latestRecord.recordId
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

  const handleOpenDiagnosis = (patientId: string, recordId: string) => {
    router.push(buildDiagnosisHref(patientId, recordId));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <ClinicianDashboardHero firstName={user.firstName} lastName={user.lastName} />

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

      <CriticalAlertsSection
        alerts={criticalAlerts}
        onViewDiagnosis={handleOpenDiagnosis}
      />

      <RecentConsultationsSection
        snapshotRecord={snapshotRecord}
        recentConsultations={recentConsultations}
        onResumeConsultation={() => router.push("/dashboard/clinician/consultation")}
        onOpenDiagnosis={handleOpenDiagnosis}
      />

      <LastPatientSection patient={lastPatientCardData} />
    </div>
  );
};
