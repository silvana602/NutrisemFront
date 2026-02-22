"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  MessageCircle,
  Target,
} from "lucide-react";

import { Heading } from "@/components/atoms/Heading";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/useAuthStore";
import { db, seedOnce } from "@/mocks/db";
import type { Recommendation } from "@/types/recomendation";

seedOnce();

type ZoneLevel = "green" | "yellow" | "red";
type ProgressDirection = "improved" | "declined" | "stable" | "no-data";

type ConsultationSnapshot = {
  dateLabel: string;
  weightKg: number | null;
  heightM: number | null;
  muacCm: number | null;
  headCircumferenceCm: number | null;
  bmi: number | null;
  nutritionalStatus: string | null;
  recommendation: Recommendation | null;
};

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
});

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toSafeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function formatDate(value: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "Sin fecha";
  return dateFormatter.format(value);
}

function calculateBmi(weightKg: number | null, heightM: number | null): number | null {
  if (weightKg === null || heightM === null || heightM <= 0) return null;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

function formatMetric(value: number | null, unit: string, decimals = 2): string {
  if (value === null) return "Sin dato";
  return `${value.toFixed(decimals)} ${unit}`.trimEnd();
}

function getDelta(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  return Number((current - previous).toFixed(2));
}

function formatDelta(current: number | null, previous: number | null, unit: string, decimals = 2): string {
  const delta = getDelta(current, previous);
  if (delta === null) return "Sin datos comparables";
  if (Math.abs(delta) < 0.01) return `0 ${unit}`.trimEnd();
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(decimals)} ${unit}`.trimEnd();
}

function inferZoneFromStatus(status: string | null): ZoneLevel {
  if (!status) return "yellow";

  const normalized = normalizeText(status);

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

function getZoneCopy(zone: ZoneLevel): { label: string; message: string } {
  if (zone === "green") {
    return {
      label: "Zona verde",
      message: "Vas por buen camino!",
    };
  }

  if (zone === "yellow") {
    return {
      label: "Zona amarilla",
      message: "Tu meta esta cerca",
    };
  }

  return {
    label: "Zona roja",
    message: "Atencion necesaria",
  };
}

function zoneToScore(zone: ZoneLevel): number {
  if (zone === "green") return 2;
  if (zone === "yellow") return 1;
  return 0;
}

function compareZoneProgress(current: ZoneLevel, previous: ZoneLevel | null): ProgressDirection {
  if (!previous) return "no-data";

  const currentScore = zoneToScore(current);
  const previousScore = zoneToScore(previous);

  if (currentScore > previousScore) return "improved";
  if (currentScore < previousScore) return "declined";
  return "stable";
}

function getProgressCopy(direction: ProgressDirection): {
  title: string;
  subtitle: string;
  badgeClassName: string;
} {
  if (direction === "improved") {
    return {
      title: "Mostraste progreso frente a tu consulta anterior.",
      subtitle: "Tu estado actual esta mejor que el control previo.",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (direction === "declined") {
    return {
      title: "Hubo retroceso frente al control anterior.",
      subtitle: "No pasa nada, puedes retomar tu plan desde hoy.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (direction === "stable") {
    return {
      title: "Te mantienes en el mismo nivel del control anterior.",
      subtitle: "Con constancia puedes avanzar al siguiente objetivo.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    title: "Aun no hay una consulta previa para comparar.",
    subtitle: "Cuando tengas un nuevo control, veras tu tendencia aqui.",
    badgeClassName: "border-nutri-light-grey bg-nutri-off-white text-nutri-dark-grey",
  };
}

function getProgressIcon(direction: ProgressDirection) {
  if (direction === "improved") {
    return <ArrowUp size={18} className="text-emerald-700" aria-hidden />;
  }

  if (direction === "declined") {
    return <ArrowDown size={18} className="text-rose-700" aria-hidden />;
  }

  return <Activity size={18} className="text-nutri-dark-grey" aria-hidden />;
}

function truncateMissionText(value: string): string {
  const firstSentence = value.split(".").find((item) => item.trim().length > 0)?.trim() ?? value.trim();

  if (firstSentence.length <= 95) return firstSentence;
  return `${firstSentence.slice(0, 92).trimEnd()}...`;
}

function pickDailyMission(recommendation: Recommendation | null): string {
  if (recommendation?.dietaryRecommendation) {
    return `Recuerda hoy: ${truncateMissionText(recommendation.dietaryRecommendation)}`;
  }

  if (recommendation?.medicalRecommendation) {
    return `Hoy toca: ${truncateMissionText(recommendation.medicalRecommendation)}`;
  }

  return "Hoy toca 20 min de juego activo y beber agua durante el dia.";
}

function getFirstSuggestedFoodName(recommendationId: string | null): string | null {
  if (!recommendationId) return null;

  const foodReference =
    db.recommendationFoods.find((item) => item.recommendationId === recommendationId) ?? null;
  if (!foodReference) return null;

  const food = db.foods.find((item) => item.foodId === foodReference.foodId) ?? null;
  return food?.foodName ?? null;
}

function buildEducationQuestion(foodName: string | null): string {
  if (foodName) {
    return `Sabias por que es importante comer ${foodName.toLowerCase()}? Descubrelo aqui.`;
  }

  return "Sabias por que es importante comer espinaca? Descubrelo aqui.";
}

function buildConsultationSnapshots(patientId: string): ConsultationSnapshot[] {
  const diagnosisByConsultationId = new Map(
    db.diagnoses.map((item) => [item.consultationId, item] as const)
  );
  const anthropometricByConsultationId = new Map(
    db.anthropometricData.map((item) => [item.consultationId, item] as const)
  );
  const recommendationByDiagnosisId = new Map(
    db.recommendations.map((item) => [item.diagnosisId, item] as const)
  );

  return db.consultations
    .filter((item) => item.patientId === patientId)
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .map((consultation) => {
      const diagnosis = diagnosisByConsultationId.get(consultation.consultationId) ?? null;
      const anthropometric = anthropometricByConsultationId.get(consultation.consultationId) ?? null;
      const recommendation = diagnosis
        ? recommendationByDiagnosisId.get(diagnosis.diagnosisId) ?? null
        : null;

      const weightKg = toSafeNumber(anthropometric?.weightKg);
      const heightM = toSafeNumber(anthropometric?.heightM);
      const calculatedBmi = calculateBmi(weightKg, heightM);

      return {
        dateLabel: formatDate(consultation.date),
        weightKg,
        heightM,
        muacCm: toSafeNumber(anthropometric?.muacCm),
        headCircumferenceCm: toSafeNumber(anthropometric?.headCircumferenceCm),
        bmi: toSafeNumber(diagnosis?.bmi) ?? calculatedBmi,
        nutritionalStatus: diagnosis?.nutritionalDiagnosis ?? null,
        recommendation,
      };
    });
}

function getZoneArrowPosition(zone: ZoneLevel): string {
  if (zone === "green") return "14%";
  if (zone === "yellow") return "50%";
  return "86%";
}

export default function PatientDashboardPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const patient = db.patients.find((item) => item.userId === user.userId) ?? null;
  const snapshots = patient ? buildConsultationSnapshots(patient.patientId) : [];

  const latestSnapshot = snapshots[0] ?? null;
  const previousSnapshot = snapshots[1] ?? null;

  const currentZone = inferZoneFromStatus(latestSnapshot?.nutritionalStatus ?? null);
  const previousZone = previousSnapshot
    ? inferZoneFromStatus(previousSnapshot.nutritionalStatus)
    : null;

  const zoneCopy = getZoneCopy(currentZone);
  const progressDirection = compareZoneProgress(currentZone, previousZone);
  const progressCopy = getProgressCopy(progressDirection);

  const missionText = pickDailyMission(latestSnapshot?.recommendation ?? null);
  const suggestedFoodName = getFirstSuggestedFoodName(
    latestSnapshot?.recommendation?.recommendationId ?? null
  );
  const educationQuestion = buildEducationQuestion(suggestedFoodName);

  const hasConsultationData = Boolean(latestSnapshot);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Heading
        variant="panel"
        eyebrow="Inicio del paciente"
        description="Aqui tienes un resumen rapido de tu ultima consulta, tu evolucion y la accion mas importante para hoy."
      >
        Bienvenid@, {user.firstName}
      </Heading>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                Ultima consulta
              </p>
              <h2 className="text-lg font-semibold text-nutri-primary">
                Datos antropometricos
              </h2>
            </div>
            <span className="rounded-full border border-nutri-primary/20 bg-nutri-off-white px-3 py-1 text-xs font-semibold text-nutri-primary">
              {latestSnapshot?.dateLabel ?? "Sin registro"}
            </span>
          </header>

          {!hasConsultationData ? (
            <p className="text-sm text-nutri-dark-grey">
              Aun no hay consulta registrada. Cuando exista un control, veras tus datos aqui.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-2">
              <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
                <span className="font-semibold">Peso:</span>{" "}
                {formatMetric(latestSnapshot.weightKg, "kg")}
              </p>
              <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
                <span className="font-semibold">Talla:</span>{" "}
                {formatMetric(latestSnapshot.heightM, "m")}
              </p>
              <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
                <span className="font-semibold">IMC:</span>{" "}
                {formatMetric(latestSnapshot.bmi, "", 1)}
              </p>
              <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
                <span className="font-semibold">MUAC:</span>{" "}
                {formatMetric(latestSnapshot.muacCm, "cm", 1)}
              </p>
              <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2 sm:col-span-2">
                <span className="font-semibold">Perimetro cefalico:</span>{" "}
                {formatMetric(latestSnapshot.headCircumferenceCm, "cm", 1)}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                Tendencia
              </p>
              <h2 className="text-lg font-semibold text-nutri-primary">
                Progreso vs consulta anterior
              </h2>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${progressCopy.badgeClassName}`}>
              {getProgressIcon(progressDirection)}
              {progressDirection === "improved" && "Progreso"}
              {progressDirection === "declined" && "Retroceso"}
              {progressDirection === "stable" && "Sin cambios"}
              {progressDirection === "no-data" && "Pendiente"}
            </span>
          </header>

          <p className="text-sm font-semibold text-nutri-dark-grey">{progressCopy.title}</p>
          <p className="mt-1 text-sm text-nutri-dark-grey/80">{progressCopy.subtitle}</p>

          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-3">
            <div className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                Peso
              </p>
              <p className="mt-1 font-semibold">
                {formatDelta(latestSnapshot?.weightKg ?? null, previousSnapshot?.weightKg ?? null, "kg")}
              </p>
            </div>
            <div className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                Talla
              </p>
              <p className="mt-1 font-semibold">
                {formatDelta(latestSnapshot?.heightM ?? null, previousSnapshot?.heightM ?? null, "m")}
              </p>
            </div>
            <div className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                IMC
              </p>
              <p className="mt-1 font-semibold">
                {formatDelta(latestSnapshot?.bmi ?? null, previousSnapshot?.bmi ?? null, "", 1)}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <header className="mb-3 flex items-center gap-2">
            <Target size={18} className="text-nutri-primary" aria-hidden />
            <h2 className="text-lg font-semibold text-nutri-primary">Semaforo del estado actual</h2>
          </header>

          <p className="text-sm text-nutri-dark-grey">
            <span className="font-semibold">{zoneCopy.label}:</span> {zoneCopy.message}
          </p>

          <div className="relative mt-8">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
            <div
              className="absolute -top-5 flex -translate-x-1/2 items-center"
              style={{ left: getZoneArrowPosition(currentZone) }}
            >
              <ArrowDown size={18} className="text-nutri-primary" aria-hidden />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-nutri-dark-grey/70">
            <span>Bien</span>
            <span>Cuidado</span>
            <span>Atencion</span>
          </div>

          <p className="mt-3 text-xs text-nutri-dark-grey/70">
            Basado en tu evaluacion mas reciente ({latestSnapshot?.dateLabel ?? "sin fecha"}).
          </p>
        </Card>

        <Card className="p-5">
          <header className="mb-3 flex items-center gap-2">
            <MessageCircle size={18} className="text-nutri-primary" aria-hidden />
            <h2 className="text-lg font-semibold text-nutri-primary">Mision del dia</h2>
          </header>

          <div className="relative rounded-2xl border border-nutri-secondary/25 bg-nutri-off-white p-4 pl-5 shadow-sm">
            <span className="absolute -left-1 top-5 h-3.5 w-3.5 rotate-45 border-b border-l border-nutri-secondary/25 bg-nutri-off-white" />
            <p className="text-sm text-nutri-dark-grey">{missionText}</p>
          </div>
        </Card>
      </section>

      <section>
        <Link
          href="/dashboard/patient/education"
          className="group flex flex-col justify-between gap-3 rounded-2xl border border-nutri-primary/10 bg-gradient-to-r from-nutri-primary to-nutri-secondary p-5 text-nutri-white shadow-sm transition-all hover:brightness-105 sm:flex-row sm:items-center"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nutri-off-white/85">
              Acceso rapido a educacion
            </p>
            <p className="mt-1 text-sm font-medium sm:text-base">{educationQuestion}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-nutri-white/35 px-3 py-1 text-sm font-semibold">
            Ir ahora
            <ArrowRight size={16} aria-hidden />
          </span>
        </Link>
      </section>
    </div>
  );
}
