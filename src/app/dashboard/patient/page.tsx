"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { db, seedOnce } from "@/mocks/db";

import {
  PatientAnthropometricCard,
  PatientDashboardHero,
  PatientEducationBanner,
  PatientProgressCard,
  PatientStatusCard,
} from "@/features/patient/dashboard/components";
import {
  buildConsultationSnapshots,
  buildEducationQuickAccess,
  compareZoneProgress,
  getFirstSuggestedFoodName,
  getProgressCopy,
  getZoneCopy,
  inferZoneFromStatus,
} from "@/features/patient/dashboard/utils";

seedOnce();

export default function PatientDashboardPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const patient = db.patients.find((item) => item.userId === user.userId) ?? null;
  const snapshots = patient
    ? buildConsultationSnapshots(
        patient.patientId,
        db.consultations,
        db.diagnoses,
        db.anthropometricData,
        db.recommendations
      )
    : [];

  const latestSnapshot = snapshots[0] ?? null;
  const previousSnapshot = snapshots[1] ?? null;

  const currentZone = inferZoneFromStatus(latestSnapshot?.nutritionalStatus ?? null);
  const previousZone = previousSnapshot
    ? inferZoneFromStatus(previousSnapshot.nutritionalStatus)
    : null;

  const zoneCopy = getZoneCopy(currentZone);
  const progressDirection = compareZoneProgress(currentZone, previousZone);
  const progressCopy = getProgressCopy(progressDirection);

  const suggestedFoodName = getFirstSuggestedFoodName(
    latestSnapshot?.recommendation?.recommendationId ?? null,
    db.recommendationFoods,
    db.foods
  );
  const educationQuickAccess = buildEducationQuickAccess(suggestedFoodName);
  const educationSearchParams = new URLSearchParams({
    tag: educationQuickAccess.suggestedTagId,
    q: educationQuickAccess.suggestedQuery,
    focusSection: educationQuickAccess.targetSectionId,
    focusArticle: educationQuickAccess.targetArticleId,
  }).toString();
  const educationHref = `/dashboard/patient/education?${educationSearchParams}#${educationQuickAccess.targetArticleId}`;

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <PatientDashboardHero firstName={user.firstName} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PatientAnthropometricCard snapshot={latestSnapshot} />
        <PatientProgressCard
          latestSnapshot={latestSnapshot}
          previousSnapshot={previousSnapshot}
          progressDirection={progressDirection}
          progressCopy={progressCopy}
        />
      </section>

      <PatientStatusCard
        zone={currentZone}
        zoneCopy={zoneCopy}
        dateLabel={latestSnapshot?.dateLabel ?? null}
      />

      <PatientEducationBanner
        question={educationQuickAccess.question}
        href={educationHref}
      />
    </div>
  );
}
