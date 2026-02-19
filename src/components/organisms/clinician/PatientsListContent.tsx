"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heading } from "../../atoms/Heading";
import { IconButton } from "../../atoms/IconButton";
import { SearchBar } from "../../molecules/SearchBar";
import { FilterBar } from "../../molecules/FilterBar";
import { PatientsTable } from "../../molecules/PatientsTable";
import { Pagination } from "../../atoms/Pagination";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";

import { seedOnce, db } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import type { Guardian, History } from "@/types";

export type PatientRow = {
  patientId: string;
  name: string;
  guardian: string;
  ci: string;
  ageLabel: string;
  ageMonths: number;
  sex: "M" | "F";
  lastConsult: string;
  lastConsultTimestamp: number | null;
  nutritionalStatus: string;
  latestDiagnosisId: string | null;
  isTargetPediatric: boolean;
};

const PAGE_SIZE = 8;
const TARGET_MIN_MONTHS = 6;
const TARGET_MAX_MONTHS = 60;
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

seedOnce();

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isNutritionalRisk(status: string): boolean {
  const normalized = normalizeText(status);
  return normalized.includes("desnutricion") || normalized.includes("riesgo");
}

export const PatientsListContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [nowReferenceMs] = useState(() => Date.now());
  const [dataVersion, setDataVersion] = useState(0);

  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [page, setPage] = useState(1);

  const highlightedPatientId = searchParams.get("newPatientId");

  const clinician = useMemo(
    () => (user ? db.clinicians.find((item) => item.userId === user.userId) ?? null : null),
    [user]
  );

  const rows: PatientRow[] = useMemo(() => {
    const refreshToken = dataVersion;
    void refreshToken;

    if (!clinician) return [];

    const assignedPatientIds = new Set(
      db.patientClinicians
        .filter((item) => item.clinicianId === clinician.clinicianId)
        .map((item) => item.patientId)
    );

    const patientRows = db.patients
      .filter((patient) => assignedPatientIds.has(patient.patientId))
      .map((patient) => {
        const guardian = db.guardians.find(
          (item: Guardian) => item.patientId === patient.patientId
        );
        const patientUser = db.users.find((item) => item.userId === patient.userId) ?? null;

        const lastConsultation = db.consultations
          .filter((item) => item.patientId === patient.patientId)
          .sort((first, second) => second.date.getTime() - first.date.getTime())[0] ?? null;

        const lastHistory = db.histories
          .filter((item: History) => item.patientId === patient.patientId)
          .sort((first, second) => second.creationDate.getTime() - first.creationDate.getTime())[0] ?? null;

        const lastDiagnosis = lastConsultation
          ? db.diagnoses.find((item) => item.consultationId === lastConsultation.consultationId) ?? null
          : null;

        const ageMonths = calculateAgeInMonths(patient.birthDate);
        const lastConsultDate = lastConsultation?.date ?? lastHistory?.creationDate ?? null;

        return {
          patientId: patient.patientId,
          name: `${patient.firstName} ${patient.lastName}`,
          guardian: guardian ? `${guardian.firstName} ${guardian.lastName}` : "Sin tutor",
          ci: patientUser?.identityNumber ?? patient.identityNumber,
          ageLabel: formatPediatricAge(ageMonths),
          ageMonths,
          sex: patient.gender === "male" ? "M" : "F",
          lastConsult: lastConsultDate ? lastConsultDate.toLocaleDateString("es-BO") : "Sin consultas",
          lastConsultTimestamp: lastConsultDate ? lastConsultDate.getTime() : null,
          nutritionalStatus: lastDiagnosis?.nutritionalDiagnosis ?? "Sin diagnostico",
          latestDiagnosisId: lastDiagnosis?.diagnosisId ?? null,
          isTargetPediatric: ageMonths >= TARGET_MIN_MONTHS && ageMonths <= TARGET_MAX_MONTHS,
        } satisfies PatientRow;
      })
      .sort((first, second) => {
        const secondTimestamp = second.lastConsultTimestamp ?? 0;
        const firstTimestamp = first.lastConsultTimestamp ?? 0;
        if (secondTimestamp !== firstTimestamp) return secondTimestamp - firstTimestamp;
        return first.name.localeCompare(second.name, "es");
      });

    return patientRows;
  }, [clinician, dataVersion]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(search.trim());

    return rows.filter((row) => {
      if (
        normalizedQuery &&
        !normalizeText(row.name).includes(normalizedQuery) &&
        !normalizeText(row.ci).includes(normalizedQuery) &&
        !normalizeText(row.guardian).includes(normalizedQuery)
      ) {
        return false;
      }

      if (sexFilter !== "all" && row.sex !== sexFilter) return false;

      if (ageFilter !== "all") {
        const [rawMin, rawMax] = ageFilter.replace("m", "").split("-");
        const min = Number(rawMin);
        const max = Number(rawMax);
        if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
        if (row.ageMonths < min || row.ageMonths > max) return false;
      }

      return true;
    });
  }, [rows, search, sexFilter, ageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayedPage = Math.min(page, totalPages);
  const pageStart = (displayedPage - 1) * PAGE_SIZE;
  const paginatedPatients = useMemo(() => {
    return filtered.slice(pageStart, pageStart + PAGE_SIZE);
  }, [filtered, pageStart]);

  const clearFiltersAndRefresh = () => {
    setSearch("");
    setAgeFilter("all");
    setSexFilter("all");
    setPage(1);
    setDataVersion((value) => value + 1);
  };

  const riskCount = filtered.filter((row) => isNutritionalRisk(row.nutritionalStatus)).length;
  const pediatricCount = filtered.filter((row) => row.isTargetPediatric).length;
  const recentConsultCount = filtered.filter((row) => {
    if (!row.lastConsultTimestamp) return false;
    return nowReferenceMs - row.lastConsultTimestamp <= THIRTY_DAYS_MS;
  }).length;

  const handleOpenDiagnosis = (patient: PatientRow) => {
    const params = new URLSearchParams({
      patientId: patient.patientId,
      tab: "summary",
      step: "0",
    });

    if (patient.latestDiagnosisId) {
      params.set("resultId", patient.latestDiagnosisId);
    }

    router.push(`/dashboard/clinician/diagnosis?${params.toString()}`);
  };

  const handleStartConsultation = (patient: PatientRow) => {
    router.push(`/dashboard/clinician/consultation?patientId=${encodeURIComponent(patient.patientId)}`);
  };

  return (
    <div className="w-full space-y-6 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading>Mis pacientes</Heading>
        <IconButton
          label="Nuevo paciente"
          className="w-full justify-center sm:w-auto"
          onClick={() => router.push("/dashboard/clinician/patients/new")}
        />
      </div>

      {highlightedPatientId && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Paciente registrado correctamente y asignado a tu lista.
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-nutri-light-grey bg-nutri-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Pacientes listados
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">{filtered.length}</p>
        </article>

        <article className="rounded-xl border border-nutri-light-grey bg-nutri-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Rango pediatrico 6-60m
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">{pediatricCount}</p>
        </article>

        <article className="rounded-xl border border-nutri-light-grey bg-nutri-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Riesgo nutricional
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">{riskCount}</p>
        </article>

        <article className="rounded-xl border border-nutri-light-grey bg-nutri-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Consulta ult. 30 dias
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">{recentConsultCount}</p>
        </article>
      </section>

      <section className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
        <div className="space-y-3">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Buscar por paciente, CI o tutor"
            containerClassName="mt-0 max-w-none"
          />

          <FilterBar
            age={ageFilter}
            gender={sexFilter}
            onAgeChange={(value) => {
              setAgeFilter(value);
              setPage(1);
            }}
            onGenderChange={(value) => {
              setSexFilter(value);
              setPage(1);
            }}
            onClearFilters={clearFiltersAndRefresh}
            clearButtonLabel="Limpiar filtros y actualizar"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-nutri-dark-grey">
            Mostrando {paginatedPatients.length} de {filtered.length} pacientes
          </p>
          <p className="text-xs text-nutri-dark-grey/80">
            El listado se ordena por la ultima consulta disponible.
          </p>
        </div>

        <PatientsTable
          data={paginatedPatients}
          rowStart={pageStart}
          highlightedPatientId={highlightedPatientId}
          onOpenDiagnosis={handleOpenDiagnosis}
          onStartConsultation={handleStartConsultation}
        />
      </section>

      {filtered.length > 0 && totalPages > 1 && (
        <Pagination page={displayedPage} totalPages={totalPages} onChange={setPage} />
      )}

      {rows.length === 0 && (
        <section className="rounded-xl border border-nutri-light-grey bg-nutri-white p-5 text-sm text-nutri-dark-grey shadow-sm">
          No tienes pacientes asignados por el momento.
        </section>
      )}
    </div>
  );
};

export default PatientsListContent;
