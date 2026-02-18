"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { StepDots } from "../new-consultation/forms/shared/StepDots";
import { db, seedOnce } from "@/mocks/db";
import {
  calculateAgeInMonths,
  formatPediatricAge,
  isTargetPediatricAge,
  PEDIATRIC_MAX_AGE_MONTHS,
  PEDIATRIC_MIN_AGE_MONTHS,
} from "@/lib/pediatricAge";
import {
  useConsultationStore,
  type HistoricalFoodGroupId,
  type HistoricalMealSlotId,
} from "@/store/useConsultationStore";

seedOnce();

type DiagnosisTabId = "summary" | "results";
type AgeFilterId = "all" | "6-11m" | "12-23m" | "24-35m" | "36-47m" | "48-60m";

type DiagnosisResult = {
  id: string;
  source: "last_consultation" | "history";
  patientId: string;
  patientName: string;
  identityNumber: string;
  ageMonths: number;
  nutritionalStatus: string;
  dateValue: number;
  dateLabel: string;
  diagnosisDetails?: string;
  bmi?: number;
  zScore?: number;
};

const DIAGNOSIS_TABS: readonly TabItem<DiagnosisTabId>[] = [
  { id: "summary", label: "Resumen de la ultima consulta" },
  { id: "results", label: "Resultados" },
];

const RESULTS_STEPS = [
  { id: "final", title: "Diagnostico Final" },
  { id: "records", title: "Resultados filtrados" },
] as const;

const BASE_STATUS_OPTIONS = [
  "all",
  "Estado normal",
  "Riesgo de desnutricion",
  "Desnutricion aguda",
  "Desnutricion aguda moderada",
  "Desnutricion aguda severa",
  "Sobrepeso",
  "Obesidad",
  "Sin clasificar",
] as const;

const FOOD_GROUP_LABELS: Record<HistoricalFoodGroupId, string> = {
  cerealsTubers: "Cereales / tuberculos",
  fruits: "Frutas",
  vegetables: "Verduras",
  dairy: "Lacteos",
  meatsProteins: "Carnes / proteinas",
  legumes: "Legumbres",
  ultraProcessed: "Alimentos ultraprocesados / snacks",
  eggs: "Huevos",
  fishSeafood: "Pescados y mariscos",
  water: "Agua simple",
  sugaryDrinks: "Bebidas azucaradas",
  fastFoodFried: "Comida rapida / frituras",
};

const MEAL_SLOT_LABELS: Record<HistoricalMealSlotId, string> = {
  breakfast: "Desayuno",
  midMorningSnack: "Media manana",
  lunch: "Almuerzo",
  afternoonSnack: "Merienda",
  dinner: "Cena",
  nightSnack: "Colacion nocturna",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "Sin dato";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Sin dato";
  return String(value);
}

function formatDateTime(isoDate?: string): string {
  if (!isoDate) return "Sin dato";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Sin dato";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function deriveStatusFromMetrics(bmi?: number, zScore?: number): string {
  if (typeof zScore === "number") {
    if (zScore <= -3) return "Desnutricion aguda severa";
    if (zScore <= -2) return "Desnutricion aguda moderada";
    if (zScore < -1) return "Riesgo de desnutricion";
    if (zScore <= 1) return "Estado normal";
    if (zScore <= 2) return "Sobrepeso";
    return "Obesidad";
  }

  if (typeof bmi === "number") {
    if (bmi < 14) return "Desnutricion aguda";
    if (bmi < 18) return "Estado normal";
    if (bmi < 20) return "Sobrepeso";
    return "Obesidad";
  }

  return "Sin clasificar";
}

function ageMatchesRange(ageMonths: number, range: AgeFilterId) {
  if (range === "all") return true;

  const [rawMin, rawMax] = range.replace("m", "").split("-");
  const min = Number(rawMin);
  const max = Number(rawMax);

  return ageMonths >= min && ageMonths <= max;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-nutri-light-grey py-2 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">{label}</p>
      <p className="text-sm text-nutri-dark-grey">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-xl border border-nutri-light-grey bg-nutri-white p-4 sm:p-5">
      <h3 className="text-base font-semibold text-nutri-primary">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

export const DiagnosisDocumentContent: React.FC = () => {
  const searchParams = useSearchParams();
  const highlightedPatientId = searchParams.get("patientId");

  const snapshot = useConsultationStore((s) => s.lastSavedConsultation);

  const [activeTab, setActiveTab] = useState<DiagnosisTabId>("summary");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilterId>("all");
  const [resultsStep, setResultsStep] = useState(0);

  const patient = useMemo(
    () =>
      snapshot ? db.patients.find((item) => item.patientId === snapshot.patientId) ?? null : null,
    [snapshot]
  );

  const patientUser = useMemo(
    () => (patient ? db.users.find((item) => item.userId === patient.userId) ?? null : null),
    [patient]
  );

  const guardian = useMemo(
    () => (patient ? db.guardians.find((item) => item.patientId === patient.patientId) ?? null : null),
    [patient]
  );

  const diagnosisResults = useMemo(() => {
    const historicalRecords: DiagnosisResult[] = [];

    for (const diagnosis of db.diagnoses) {
      const consultation = db.consultations.find(
        (item) => item.consultationId === diagnosis.consultationId
      );
      if (!consultation) continue;

      const resultPatient = db.patients.find((item) => item.patientId === consultation.patientId);
      if (!resultPatient) continue;

      const user = db.users.find((item) => item.userId === resultPatient.userId);
      if (!user) continue;

      const ageMonths = calculateAgeInMonths(resultPatient.birthDate, consultation.date);
      if (!isTargetPediatricAge(ageMonths)) continue;

      historicalRecords.push({
        id: diagnosis.diagnosisId,
        source: "history",
        patientId: resultPatient.patientId,
        patientName: `${user.firstName} ${user.lastName}`,
        identityNumber: user.identityNumber,
        ageMonths,
        nutritionalStatus: diagnosis.nutritionalDiagnosis || "Sin clasificar",
        dateValue: consultation.date.getTime(),
        dateLabel: consultation.date.toLocaleDateString("es-BO"),
        diagnosisDetails: diagnosis.diagnosisDetails,
        bmi: diagnosis.bmi,
        zScore: diagnosis.zScorePercentile,
      });
    }

    if (!snapshot) return historicalRecords;

    const snapshotPatient = db.patients.find((item) => item.patientId === snapshot.patientId);
    const snapshotUser = snapshotPatient
      ? db.users.find((item) => item.userId === snapshotPatient.userId)
      : null;

    const snapshotRecord: DiagnosisResult = {
      id: `snapshot-${snapshot.savedAt}`,
      source: "last_consultation",
      patientId: snapshot.patientId,
      patientName: snapshotUser
        ? `${snapshotUser.firstName} ${snapshotUser.lastName}`
        : `${snapshotPatient?.firstName ?? ""} ${snapshotPatient?.lastName ?? ""}`.trim() ||
          "Paciente",
      identityNumber: snapshotUser?.identityNumber ?? snapshotPatient?.identityNumber ?? "Sin dato",
      ageMonths: snapshotPatient ? calculateAgeInMonths(snapshotPatient.birthDate, snapshot.savedAt) : 0,
      nutritionalStatus: deriveStatusFromMetrics(
        snapshot.anthropometric.bmi,
        snapshot.anthropometric.zScore
      ),
      dateValue: new Date(snapshot.savedAt).getTime(),
      dateLabel: formatDateTime(snapshot.savedAt),
      diagnosisDetails:
        "Registro generado desde la nueva consulta, pendiente de analisis final.",
      bmi: snapshot.anthropometric.bmi,
      zScore: snapshot.anthropometric.zScore,
    };

    return [snapshotRecord, ...historicalRecords].sort((a, b) => b.dateValue - a.dateValue);
  }, [snapshot]);

  const statusOptions = useMemo(() => {
    const dynamicStatuses = diagnosisResults
      .map((item) => item.nutritionalStatus)
      .filter((item) => Boolean(item.trim()));

    return Array.from(new Set([...BASE_STATUS_OPTIONS, ...dynamicStatuses]));
  }, [diagnosisResults]);

  const filteredResults = useMemo(() => {
    const query = normalizeText(search.trim());

    return diagnosisResults.filter((item) => {
      const queryMatch =
        query.length === 0 ||
        normalizeText(item.patientName).includes(query) ||
        normalizeText(item.identityNumber).includes(query);

      const statusMatch =
        statusFilter === "all" ||
        normalizeText(item.nutritionalStatus) === normalizeText(statusFilter);

      const ageMatch = ageMatchesRange(item.ageMonths, ageFilter);

      return queryMatch && statusMatch && ageMatch;
    });
  }, [diagnosisResults, search, statusFilter, ageFilter]);

  const latestConsultationResult = useMemo(() => diagnosisResults[0] ?? null, [diagnosisResults]);

  const latestConsultationDetail = useMemo(() => {
    if (!latestConsultationResult) return "No hay informacion disponible para la ultima consulta.";

    if (latestConsultationResult.source === "last_consultation" && snapshot) {
      const findings = [
        `Paciente ${latestConsultationResult.patientName}.`,
        `IMC ${formatValue(snapshot.anthropometric.bmi)} y Z-Score ${formatValue(
          snapshot.anthropometric.zScore
        )}.`,
        `Sintomas digestivos: diarrea ${formatValue(snapshot.clinical.diarrhea)}, vomitos ${formatValue(
          snapshot.clinical.vomiting
        )}, deshidratacion ${formatValue(snapshot.clinical.dehydration)}.`,
        `Sueno: ${formatValue(snapshot.historical.sleepQuality)} (${formatValue(
          snapshot.historical.sleepAverageHours
        )} hrs).`,
      ];

      return findings.join(" ");
    }

    return (
      latestConsultationResult.diagnosisDetails ||
      "No se registro un diagnostico detallado para esta consulta."
    );
  }, [latestConsultationResult, snapshot]);

  const highlightedResult = useMemo(() => {
    if (!highlightedPatientId) return null;
    return filteredResults.find((item) => item.patientId === highlightedPatientId) ?? null;
  }, [filteredResults, highlightedPatientId]);

  const foodMatrixEntries = Object.entries(snapshot?.historical.foodFrequencyByGroup ?? {}) as Array<
    [HistoricalFoodGroupId, string]
  >;

  const mealScheduleEntries = Object.entries(snapshot?.historical.mealSchedule ?? {}) as Array<
    [HistoricalMealSlotId, string]
  >;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Heading>Diagnostico del paciente</Heading>

      <section>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre del paciente o CI"
        />

        <div className="mt-2 flex w-full flex-col gap-4 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex w-full flex-col sm:w-auto">
            <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">Estado nutricional</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="nutri-input w-full sm:min-w-[220px]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "Todos" : status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full flex-col sm:w-auto">
            <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">Edad</label>
            <select
              value={ageFilter}
              onChange={(event) => setAgeFilter(event.target.value as AgeFilterId)}
              className="nutri-input w-full sm:min-w-[180px]"
            >
              <option value="all">
                {PEDIATRIC_MIN_AGE_MONTHS} a {PEDIATRIC_MAX_AGE_MONTHS} meses
              </option>
              <option value="6-11m">6 - 11 meses</option>
              <option value="12-23m">12 - 23 meses</option>
              <option value="24-35m">24 - 35 meses</option>
              <option value="36-47m">36 - 47 meses</option>
              <option value="48-60m">48 - 60 meses</option>
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs text-nutri-dark-grey/80">
          La busqueda y filtros del tab Resultados estan orientados a 6 meses - 5 anios.
        </p>
      </section>

      <Tabs tabs={DIAGNOSIS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "summary" && (
        <>
          {!snapshot ? (
            <div className="rounded-xl border border-nutri-light-grey bg-nutri-white p-5 shadow-sm">
              <p className="text-sm text-nutri-dark-grey">
                No hay una consulta guardada para generar el resumen de la ultima consulta.
              </p>
              <Link
                href="/dashboard/clinician/consultation"
                className="mt-4 inline-flex rounded-xl border border-transparent bg-nutri-primary px-5 py-2.5 text-sm font-semibold text-nutri-white transition-all hover:bg-nutri-secondary"
              >
                Ir a nueva consulta
              </Link>
            </div>
          ) : (
            <article className="space-y-5 rounded-xl border border-nutri-light-grey bg-nutri-off-white p-4 shadow-sm sm:p-6">
              <header className="space-y-2 rounded-lg border border-nutri-primary/20 bg-nutri-white px-4 py-3">
                <p className="text-sm font-semibold text-nutri-primary">Resumen de la ultima consulta</p>
                <p className="text-xs text-nutri-dark-grey">
                  Fecha de registro: {formatDateTime(snapshot.savedAt)}
                </p>
              </header>

              <Section title="Paciente y responsable">
                <FieldRow
                  label="Paciente"
                  value={
                    patientUser
                      ? `${patientUser.firstName} ${patientUser.lastName}`
                      : `${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`.trim() ||
                        "Sin dato"
                  }
                />
                <FieldRow
                  label="Cedula de identidad"
                  value={formatValue(patientUser?.identityNumber ?? patient?.identityNumber)}
                />
                <FieldRow
                  label="Tutor / responsable"
                  value={guardian ? `${guardian.firstName} ${guardian.lastName}` : "Sin dato"}
                />
                <FieldRow
                  label="Estado nutricional estimado"
                  value={deriveStatusFromMetrics(snapshot.anthropometric.bmi, snapshot.anthropometric.zScore)}
                />
                <FieldRow
                  label="Edad (consulta pediatrica)"
                  value={
                    patient
                      ? formatPediatricAge(calculateAgeInMonths(patient.birthDate, snapshot.savedAt))
                      : "Sin dato"
                  }
                />
              </Section>

              <Section title="1. Datos antropometricos">
                <FieldRow label="Peso (kg)" value={formatValue(snapshot.anthropometric.weightKg)} />
                <FieldRow label="Talla (m)" value={formatValue(snapshot.anthropometric.heightM)} />
                <FieldRow label="Perimetro braquial (cm)" value={formatValue(snapshot.anthropometric.muacCm)} />
                <FieldRow
                  label="Perimetro cefalico (cm)"
                  value={formatValue(snapshot.anthropometric.headCircumferenceCm)}
                />
                <FieldRow label="IMC" value={formatValue(snapshot.anthropometric.bmi)} />
                <FieldRow label="Z-Score" value={formatValue(snapshot.anthropometric.zScore)} />
                <FieldRow label="Percentil" value={formatValue(snapshot.anthropometric.percentile)} />
              </Section>

              <Section title="2. Datos clinicos">
                <FieldRow label="Nivel de actividad" value={formatValue(snapshot.clinical.activityLevel)} />
                <FieldRow label="Presencia de desanimo" value={formatValue(snapshot.clinical.apathy)} />
                <FieldRow
                  label="Observaciones generales"
                  value={formatValue(snapshot.clinical.generalObservations)}
                />
                <FieldRow label="Cabello" value={formatValue(snapshot.clinical.hairCondition)} />
                <FieldRow label="Piel" value={formatValue(snapshot.clinical.skinCondition)} />
                <FieldRow label="Edema" value={formatValue(snapshot.clinical.edema)} />
                <FieldRow label="Denticion" value={formatValue(snapshot.clinical.dentition)} />
                <FieldRow
                  label="Observaciones fisicas"
                  value={formatValue(snapshot.clinical.physicalObservations)}
                />
                <FieldRow label="Diarrea" value={formatValue(snapshot.clinical.diarrhea)} />
                <FieldRow label="Vomitos" value={formatValue(snapshot.clinical.vomiting)} />
                <FieldRow
                  label="Signos de deshidratacion"
                  value={formatValue(snapshot.clinical.dehydration)}
                />
                <FieldRow
                  label="Observaciones digestivas"
                  value={formatValue(snapshot.clinical.digestiveObservations)}
                />
                <FieldRow
                  label="Temperatura (C)"
                  value={formatValue(snapshot.clinical.temperatureCelsius)}
                />
                <FieldRow
                  label="Observacion de temperatura"
                  value={formatValue(snapshot.clinical.temperatureObservation)}
                />
                <FieldRow
                  label="Frecuencia cardiaca (lpm)"
                  value={formatValue(snapshot.clinical.heartRate)}
                />
                <FieldRow
                  label="Observacion de frecuencia cardiaca"
                  value={formatValue(snapshot.clinical.heartRateObservation)}
                />
                <FieldRow
                  label="Frecuencia respiratoria (rpm)"
                  value={formatValue(snapshot.clinical.respiratoryRate)}
                />
                <FieldRow
                  label="Observacion de frecuencia respiratoria"
                  value={formatValue(snapshot.clinical.respiratoryRateObservation)}
                />
                <FieldRow
                  label="Presion arterial"
                  value={formatValue(snapshot.clinical.bloodPressure)}
                />
                <FieldRow
                  label="Observacion de presion arterial"
                  value={formatValue(snapshot.clinical.bloodPressureObservation)}
                />
              </Section>

              <Section title="3. Datos historicos">
                <FieldRow label="Lactancia materna" value={formatValue(snapshot.historical.breastfeeding)} />
                <FieldRow label="Uso de biberon" value={formatValue(snapshot.historical.bottleFeeding)} />
                <FieldRow
                  label="Frecuencia de biberon"
                  value={formatValue(snapshot.historical.feedingFrequency)}
                />
                <FieldRow
                  label="Inicio de alimentacion complementaria (meses)"
                  value={formatValue(snapshot.historical.complementaryFeedingStartMonths)}
                />
                <FieldRow
                  label="Frecuencia por grupo de alimentos"
                  value={
                    foodMatrixEntries.length
                      ? foodMatrixEntries
                          .map(([groupId, frequency]) => `${FOOD_GROUP_LABELS[groupId]}: ${frequency}`)
                          .join(" | ")
                      : "Sin dato"
                  }
                />
                <FieldRow label="Comidas por dia" value={formatValue(snapshot.historical.mealsPerDay)} />
                <FieldRow
                  label="Horarios habituales"
                  value={
                    mealScheduleEntries.length
                      ? mealScheduleEntries
                          .map(([slotId, hour]) => `${MEAL_SLOT_LABELS[slotId]} ${hour}`)
                          .join(" | ")
                      : "Sin dato"
                  }
                />
                <FieldRow
                  label="Apetito"
                  value={formatValue(snapshot.historical.appetiteLevel)}
                />
                <FieldRow
                  label="Vasos de agua por dia"
                  value={formatValue(snapshot.historical.waterGlassesPerDay)}
                />
                <FieldRow
                  label="Enfermedades recientes"
                  value={formatValue(snapshot.historical.recentIllnesses)}
                />
                <FieldRow
                  label="Otros antecedentes recientes"
                  value={formatValue(snapshot.historical.recentIllnessesOther)}
                />
                <FieldRow
                  label="Estado de vacunacion"
                  value={formatValue(snapshot.historical.vaccinationStatus)}
                />
                <FieldRow
                  label="Horas promedio de sueno"
                  value={formatValue(snapshot.historical.sleepAverageHours)}
                />
                <FieldRow
                  label="Calidad de sueno"
                  value={formatValue(snapshot.historical.sleepQuality)}
                />
                <FieldRow label="Hora de acostarse" value={formatValue(snapshot.historical.bedtime)} />
                <FieldRow
                  label="Hora de levantarse"
                  value={formatValue(snapshot.historical.wakeupTime)}
                />
              </Section>

              <div className="flex justify-end">
                <Link
                  href="/dashboard/clinician/consultation"
                  className="inline-flex rounded-xl border border-transparent bg-nutri-primary px-5 py-2.5 text-sm font-semibold text-nutri-white transition-all hover:bg-nutri-secondary"
                >
                  Nueva consulta
                </Link>
              </div>
            </article>
          )}
        </>
      )}

      {activeTab === "results" && (
        <section className="space-y-4 rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
          <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-nutri-primary">Resultados de diagnostico</h3>
            <p className="text-xs text-nutri-dark-grey/80">
              Registros encontrados: {filteredResults.length}
            </p>
          </header>

          <header className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-nutri-dark-grey">
              {RESULTS_STEPS[resultsStep].title}
            </p>
          </header>

          {resultsStep === 0 && (
            <article className="space-y-4 rounded-lg border border-nutri-light-grey bg-nutri-off-white p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                  Diagnostico final
                </p>
                <p className="text-lg font-semibold text-nutri-primary">
                  {latestConsultationResult?.nutritionalStatus ?? "Sin clasificar"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                  Diagnostico detallado
                </p>
                <p className="text-sm leading-relaxed text-nutri-dark-grey">{latestConsultationDetail}</p>
              </div>

              {latestConsultationResult && (
                <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-2">
                  <p>
                    <span className="font-semibold">Paciente:</span>{" "}
                    {latestConsultationResult.patientName}
                  </p>
                  <p>
                    <span className="font-semibold">Fecha:</span> {latestConsultationResult.dateLabel}
                  </p>
                </div>
              )}
            </article>
          )}

          {resultsStep === 1 && (
            <>
              {filteredResults.length === 0 ? (
                <p className="rounded-lg border border-dashed border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
                  No hay resultados para los filtros actuales.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredResults.map((item) => {
                    const isHighlighted = item.patientId === highlightedResult?.patientId;

                    return (
                      <article
                        key={item.id}
                        className={`rounded-lg border bg-nutri-white p-4 ${
                          isHighlighted
                            ? "border-nutri-primary/50 shadow-[0_0_0_1px_rgba(23,42,58,0.15)]"
                            : "border-nutri-light-grey"
                        }`}
                      >
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <p className="text-sm text-nutri-dark-grey">
                            <span className="font-semibold">Paciente:</span> {item.patientName}
                          </p>
                          <p className="text-sm text-nutri-dark-grey">
                            <span className="font-semibold">CI:</span> {item.identityNumber}
                          </p>
                          <p className="text-sm text-nutri-dark-grey">
                            <span className="font-semibold">Edad:</span>{" "}
                            {formatPediatricAge(item.ageMonths)}
                          </p>
                          <p className="text-sm text-nutri-dark-grey">
                            <span className="font-semibold">Estado nutricional:</span>{" "}
                            {item.nutritionalStatus}
                          </p>
                          <p className="text-sm text-nutri-dark-grey">
                            <span className="font-semibold">Fecha:</span> {item.dateLabel}
                          </p>
                          <p className="text-sm text-nutri-dark-grey">
                            <span className="font-semibold">Fuente:</span>{" "}
                            {item.source === "last_consultation" ? "Ultima consulta" : "Historial"}
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-nutri-dark-grey/90">
                          <span className="font-semibold">Detalle:</span>{" "}
                          {item.diagnosisDetails || "Sin detalle adicional."}
                        </p>

                        {item.source === "last_consultation" && (
                          <div className="mt-3">
                            <Button variant="outline" onClick={() => setActiveTab("summary")}>
                              Ver resumen de la ultima consulta
                            </Button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              {resultsStep > 0 && (
                <Button variant="outline" onClick={() => setResultsStep(resultsStep - 1)}>
                  Punto anterior
                </Button>
              )}
            </div>
            <div>
              {resultsStep < RESULTS_STEPS.length - 1 && (
                <Button variant="outline" onClick={() => setResultsStep(resultsStep + 1)}>
                  Punto siguiente
                </Button>
              )}
            </div>
          </div>

          <StepDots
            steps={RESULTS_STEPS}
            currentStep={resultsStep}
            maxUnlockedStep={RESULTS_STEPS.length - 1}
            onStepChange={setResultsStep}
          />
        </section>
      )}
    </div>
  );
};

export default DiagnosisDocumentContent;
