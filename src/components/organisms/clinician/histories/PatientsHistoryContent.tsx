"use client";

import React, { useState, useMemo, useEffect } from "react";
import { db, seedOnce, getUserByCI } from "@/mocks/db";
import { PatientsTable } from "@/components/molecules/PatientsTable";
import { SearchBar } from "@/components/molecules/SearchBar";
import { FilterBar } from "@/components/molecules/FilterBar";
import { Pagination } from "@/components/atoms/Pagination";
import { calculateAge } from "@/lib/utils";
import { PatientSummary } from "./PatientSummary";
import { Button } from "@/components/ui/Button";
import { PatientHistoryTable } from "./PatientHistoryTable"; // Asegúrate de crearlo o importarlo

// --- Tipo de paciente para la tabla ---
type RowPatient = {
  id: number;
  name: string;
  ci: string;
  sex: string;
  tutor: string;
  lastConsult: string;
  age: number;
};

seedOnce();

export const PatientsHistoryContent: React.FC = () => {
  // --- Estados ---
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("Todos");
  const [sexFilter, setSexFilter] = useState("Todos");
  const [patientsPage, setPatientsPage] = useState(1);
  const [selectedCi, setSelectedCi] = useState<string | null>(null);

  const patientsPageSize = 8;
  const historyPageSize = 6;
  const [historyPage, setHistoryPage] = useState(1);

  // --- Lista de pacientes (transformación de db a RowPatient) ---
  const allPatients: RowPatient[] = useMemo(() => {
    return db.patients.map((p, idx) => {
      const user = db.users.find((u) => u.userId === p.userId);
      const name = user ? `${user.firstName} ${user.lastName}` : "Paciente";
      const ci = user?.identityCard ?? "-";
      const tutor =
        p.tutors && p.tutors.length > 0
          ? `${p.tutors[0].firstName} ${p.tutors[0].lastName}`
          : "-";
      const sex = p.gender ?? "-";

      const consultations = db.consultations
        .filter((c) => c.patientId === p.patientId)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      const lastConsult =
        consultations.length > 0
          ? new Date(consultations[0].date).toLocaleDateString()
          : "-";

      const age = p.birthDate ? calculateAge(p.birthDate) : 0;

      return { id: idx + 1, name, ci, tutor, sex, lastConsult, age };
    });
  }, []);

  // --- Filtrado por búsqueda y filtros ---
  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();

    return allPatients.filter((r) => {
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.ci.toLowerCase().includes(q);
      if (!matchSearch) return false;

      if (
        sexFilter !== "Todos" &&
        r.sex.toLowerCase() !== sexFilter.toLowerCase()
      )
        return false;

      if (ageFilter !== "Todos" && typeof r.age === "number") {
        if (ageFilter === "6 meses" || ageFilter === "9 meses") {
          if (!(r.age < 1)) return false;
        } else if (ageFilter === "1 año") {
          if (!(r.age >= 1 && r.age < 2)) return false;
        } else if (ageFilter === "2 años") {
          if (!(r.age >= 2 && r.age < 3)) return false;
        }
      }

      return true;
    });
  }, [allPatients, search, ageFilter, sexFilter]);

  // --- Paginación de pacientes ---
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / patientsPageSize)
  );
  const patientsPaginated = useMemo(() => {
    const start = (patientsPage - 1) * patientsPageSize;
    return filteredPatients.slice(start, start + patientsPageSize);
  }, [filteredPatients, patientsPage]);

  // --- Usuario seleccionado ---
  const selectedUser = useMemo(() => {
    if (!selectedCi) return null;
    return getUserByCI(selectedCi) ?? null;
  }, [selectedCi]);

  // --- Historial del paciente ---
  const patientHistory = useMemo(() => {
    if (!selectedUser) return [];
    const patient = db.patients.find((p) => p.userId === selectedUser.userId);
    if (!patient) return [];

    const consultations = db.consultations
      .filter((c) => c.patientId === patient.patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return consultations.map((c, idx) => {
      const anthropo = db.anthropometricData.find(
        (ad) => ad.consultationId === c.consultationId
      );
      const clinical = db.clinicalData.find(
        (cd) => cd.consultationId === c.consultationId
      );

      return {
        id: idx + 1,
        consultationId: c.consultationId,
        diagnostic: clinical?.activity ?? "—",
        age: calculateAge(patient.birthDate, c.date),
        weight: anthropo?.weight ?? "—",
        height: anthropo?.height ?? "—",
        date: c.date,
        complete: Boolean(clinical),
      };
    });
  }, [selectedUser]);

  const historyTotalPages = Math.max(
    1,
    Math.ceil(patientHistory.length / historyPageSize)
  );
  const historyPaginated = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return patientHistory.slice(start, start + historyPageSize);
  }, [patientHistory, historyPage]);

  // Reset páginas cuando cambian filtros o paciente
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPatientsPage(1); // resetea la página al cambiar búsqueda
  };

  const handleAgeChange = (val: string) => {
    setAgeFilter(val);
    setPatientsPage(1); // resetea la página
  };

  const handleSexChange = (val: string) => {
    setSexFilter(val);
    setPatientsPage(1); // resetea la página
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder="Buscar paciente por nombre o CI"
      />

      {/* Filtros */}
      <FilterBar
        age={ageFilter}
        gender={sexFilter}
        onAgeChange={handleAgeChange}
        onGenderChange={handleSexChange}
      />

      {/* Tabla de pacientes */}
      <PatientsTable
        data={patientsPaginated}
        onRowClick={(row: RowPatient) => setSelectedCi(row.ci)}
      />

      <div className="flex justify-end">
        <Pagination
          page={patientsPage}
          totalPages={totalPages}
          onChange={setPatientsPage}
        />
      </div>

      {/* Resumen y historial */}
      {selectedUser && (
        <div className="space-y-4 mt-6">
          <PatientSummary user={selectedUser} />

          <PatientHistoryTable data={historyPaginated} />

          <div className="flex justify-end">
            <Pagination
              page={historyPage}
              totalPages={historyTotalPages}
              onChange={setHistoryPage}
            />
          </div>

          <div className="flex gap-4">
            <Button>Generar historial (PDF)</Button>
          </div>
        </div>
      )}
    </div>
  );
};
