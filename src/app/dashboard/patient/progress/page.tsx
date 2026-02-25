"use client";

import { useMemo, useState } from "react";

import { db, seedOnce } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import { useConsultationStore } from "@/store/useConsultationStore";
import {
  PatientProgressAchievements,
  PatientProgressChartModal,
  PatientProgressComparisonTable,
  PatientProgressEmptyState,
  PatientProgressGrowthSection,
  PatientProgressHero,
} from "@/features/patient/progress/components";
import { buildPatientProgressViewModel } from "@/features/patient/progress/utils";
import type { PatientProgressIndicatorId } from "@/features/patient/progress/types";

seedOnce();

export default function PatientProgressPage() {
  const user = useAuthStore((state) => state.user);
  const lastSavedConsultation = useConsultationStore((state) => state.lastSavedConsultation);
  const [expandedIndicatorId, setExpandedIndicatorId] = useState<PatientProgressIndicatorId | null>(
    null
  );

  const viewModel = useMemo(() => {
    if (!user) return null;

    const snapshotWaterGlasses =
      typeof lastSavedConsultation?.historical?.waterGlassesPerDay === "number"
        ? lastSavedConsultation.historical.waterGlassesPerDay
        : null;

    return buildPatientProgressViewModel({
      userId: user.userId,
      users: db.users,
      patients: db.patients,
      consultations: db.consultations,
      anthropometricData: db.anthropometricData,
      clinicalData: db.clinicalData,
      diagnoses: db.diagnoses,
      recommendations: db.recommendations,
      hydrationSnapshot: lastSavedConsultation
        ? {
            patientId: lastSavedConsultation.patientId,
            waterGlassesPerDay: snapshotWaterGlasses,
          }
        : null,
    });
  }, [user, lastSavedConsultation]);

  const expandedIndicator = useMemo(() => {
    if (!viewModel || !expandedIndicatorId) return null;
    return viewModel.indicators.find((item) => item.id === expandedIndicatorId) ?? null;
  }, [viewModel, expandedIndicatorId]);

  if (!user) return null;

  const hasAnyProgressData =
    Boolean(viewModel?.comparisonRows.length) ||
    Boolean(viewModel?.indicators.some((indicator) => indicator.points.length > 0));

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <PatientProgressHero firstName={user.firstName} />

      {!viewModel || !hasAnyProgressData ? (
        <PatientProgressEmptyState />
      ) : (
        <>
          <PatientProgressGrowthSection
            indicators={viewModel.indicators}
            latestDateLabel={viewModel.latestDateLabel}
            onExpandChart={setExpandedIndicatorId}
          />

          <PatientProgressComparisonTable rows={viewModel.comparisonRows} />

          <PatientProgressAchievements achievements={viewModel.achievements} />
        </>
      )}

      <PatientProgressChartModal
        indicator={expandedIndicator}
        onClose={() => setExpandedIndicatorId(null)}
      />
    </div>
  );
}
