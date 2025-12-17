"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Heading } from "../../atoms/Heading";
import { IconButton } from "../../atoms/IconButton";
import { SearchBar } from "../../molecules/SearchBar";
import { FilterBar } from "../../molecules/FilterBar";
import { PatientsTable } from "../../molecules/PatientsTable";
import { colors } from "@/lib/colors";
import { calculateAge } from "@/lib/utils";

// mocks DB
import { seedOnce, db } from "@/mocks/db";

type RowPatient = {
  id: number;
  name: string;
  tutor: string;
  ci: string;
  age: number;
  sex: "M" | "F" | "-";
  lastConsult: string;
};

export const PatientsListContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [rows, setRows] = useState<RowPatient[]>([]);

  // Cargar pacientes
  useEffect(() => {
    const loadPatients = async () => {
      try {
        seedOnce();
      } catch {}

      const patients = db.patients ?? [];
      const users = db.users ?? [];
      const consultations = db.consultations ?? [];

      const list: RowPatient[] = patients.map((p, idx) => {
        const user = users.find((u: any) => u.userId === p.userId);

        const name = user
          ? `${user.firstName} ${user.lastName}`
          : `Paciente ${idx + 1}`;

        const ci = user?.identityCard ?? "----";
        const tutor = p.tutors?.[0]
          ? `${p.tutors[0].firstName} ${p.tutors[0].lastName}`
          : "-";

        const age = p.birthDate ? calculateAge(p.birthDate) : 0;

        const sex =
          p.gender === "male" ? "M" : p.gender === "female" ? "F" : "-";

        const patientConsults = consultations
          .filter((c: any) => c.patientId === p.patientId)
          .sort((a: any, b: any) => (a.date < b.date ? 1 : -1));

        const lastConsult =
          patientConsults.length > 0 ? patientConsults[0].date : "-";

        return { id: idx + 1, name, tutor, ci, age, sex, lastConsult };
      });

      setRows(list);
    };

    loadPatients();
  }, []);

  // Filtrado
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return rows.filter((r) => {
      // Buscador
      const matchesSearch =
        q === "" ||
        r.name.toLowerCase().includes(q) ||
        r.ci.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Filtro sexo
      if (sexFilter !== "all" && r.sex !== sexFilter) return false;

      // Filtro edad
      if (ageFilter !== "all") {
        const age = r.age;

        const [min, max] =
          ageFilter === "16+"
            ? [16, Infinity]
            : ageFilter.split("-").map(Number);

        if (!(age >= min && age <= (max ?? Infinity))) return false;
      }

      return true;
    });
  }, [rows, search, sexFilter, ageFilter]);

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Heading>Lista de pacientes</Heading>
        <IconButton label="Añadir nuevo paciente" onClick={() => {}} />
      </div>

      {/* Search y Filters */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:gap-6 gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar
          age={ageFilter}
          gender={sexFilter}
          onAgeChange={setAgeFilter}
          onGenderChange={setSexFilter}
        />
      </div>

      {/* Total */}
      <div className="mt-6">
        <p className="text-sm font-semibold" style={{ color: colors.darkGrey }}>
          Total de pacientes: {filtered.length}
        </p>
      </div>

      <PatientsTable data={filtered} />
    </div>
  );
};

export default PatientsListContent;
