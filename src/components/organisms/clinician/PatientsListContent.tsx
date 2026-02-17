"use client";

import React, { useMemo, useState } from "react";
import { Heading } from "../../atoms/Heading";
import { IconButton } from "../../atoms/IconButton";
import { SearchBar } from "../../molecules/SearchBar";
import { FilterBar } from "../../molecules/FilterBar";
import { PatientsTable } from "../../molecules/PatientsTable";
import { Pagination } from "../../atoms/Pagination";
import { calculateAge } from "@/lib/utils";

import { seedOnce, db } from "@/mocks/db";
import type { Guardian, History } from "@/types";

export type PatientRow = {
  patientId: string;
  name: string;
  guardian: string;
  ci: string;
  age: number;
  sex: "M" | "F";
  lastConsult: string;
};

const PAGE_SIZE = 8;

seedOnce();

export const PatientsListContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleAgeFilterChange = (value: string) => {
    setAgeFilter(value);
    setPage(1);
  };

  const handleSexFilterChange = (value: string) => {
    setSexFilter(value);
    setPage(1);
  };

  const rows: PatientRow[] = useMemo(() => {
    return db.patients.map((p) => {
      const guardian = db.guardians.find(
        (g: Guardian) => g.patientId === p.patientId
      );

      const lastHistory = db.histories
        .filter((h: History) => h.patientId === p.patientId)
        .sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime())[0];

      return {
        patientId: p.patientId,
        name: `${p.firstName} ${p.lastName}`,
        guardian: guardian ? `${guardian.firstName} ${guardian.lastName}` : "-",
        ci: p.identityNumber,
        age: calculateAge(p.birthDate),
        sex: p.gender === "male" ? "M" : "F",
        lastConsult: lastHistory
          ? lastHistory.creationDate.toLocaleDateString()
          : "-",
      };
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.ci.includes(q)) return false;
      if (sexFilter !== "all" && r.sex !== sexFilter) return false;
      if (ageFilter !== "all") {
        const [min, max] =
          ageFilter === "16+" ? [16, Infinity] : ageFilter.split("-").map(Number);
        if (r.age < min || r.age > max) return false;
      }
      return true;
    });
  }, [rows, search, sexFilter, ageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="w-full space-y-6 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading >Lista de pacientes</Heading>
        <IconButton
          label="Add New Patient"
          className="w-full justify-center sm:w-auto"
          onClick={() => {}}
        />
      </div>

      {/* Search y Filters */}
      <div className="mt-2 flex flex-col gap-4 sm:mt-4 sm:flex-row sm:items-end sm:gap-6">
        <SearchBar value={search} onChange={handleSearchChange} />
        <FilterBar
          age={ageFilter}
          gender={sexFilter}
          onAgeChange={handleAgeFilterChange}
          onGenderChange={handleSexFilterChange}
        />
      </div>

      {/* Total */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-nutri-dark-grey">
          Total patients: {filtered.length}
        </p>
      </div>

      {/* Tabla */}
      <div className="rounded-xl bg-nutri-white shadow-lg">
        <PatientsTable data={paginatedPatients} />
      </div>

      {/* Paginación */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default PatientsListContent;
