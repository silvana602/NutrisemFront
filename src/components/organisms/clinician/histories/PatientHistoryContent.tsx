"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/components/atoms/Heading";
import { SearchBar } from "@/components/molecules/SearchBar";
import { PatientSummary } from "./PatientSummary";
import { PatientsHistoryTable } from "./PatientHistoryTable";

import { seedOnce, db } from "@/mocks/db";
import type { Patient, User } from "@/types";

export const PatientHistoryContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    seedOnce();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();

    const timer = setTimeout(() => {
      if (q.length < 2) {
        setResults([]);
        setSelectedPatient(null);
        return;
      }

      const patients: Patient[] = db.patients ?? [];
      const users: User[] = db.users ?? [];

      const found = patients.filter((p) => {
        const user = users.find((u) => u.userId === p.userId);
        if (!user) return false;

        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const ci = user.identityNumber?.toLowerCase() ?? "";

        return fullName.includes(q) || ci.includes(q);
      });

      setResults(found);
      setSelectedPatient(found.length === 1 ? found[0] : null);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="w-full space-y-6 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-6">
      <Heading>Patient History</Heading>

      {/* Buscador */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Lista de resultados */}
      {results.length > 1 && !selectedPatient && (
        <div className="rounded-xl border border-nutri-light-grey bg-nutri-off-white p-4 shadow-lg sm:p-6">
          <p className="mb-3 text-sm text-nutri-dark-grey">
            Select a patient:
          </p>

          <ul className="divide-y divide-nutri-light-grey">
            {results.map((p) => {
              const user = db.users.find(
                (u: User) => u.userId === p.userId
              );

              return (
                <li
                  key={p.patientId}
                  className="mb-2 cursor-pointer rounded-lg bg-nutri-light-grey px-3 py-2.5 transition hover:bg-nutri-off-white sm:px-4 sm:py-3"
                  onClick={() => setSelectedPatient(p)}
                >
                  <strong className="text-nutri-primary">
                    {user?.firstName} {user?.lastName}
                  </strong>{" "}
                  – CI: {user?.identityNumber ?? "----"}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Summary + Historial */}
      {selectedPatient && (
        <div className="space-y-8">
          <div className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-lg sm:p-6">
            <PatientSummary patient={selectedPatient} />
          </div>

          <div className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-lg sm:p-6">
            <PatientsHistoryTable patientId={selectedPatient.patientId} />
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {search.length >= 2 && results.length === 0 && (
        <p className="mt-4 text-sm text-nutri-dark-grey">
          Pacientes no encontrados
        </p>
      )}
    </div>
  );
};

export default PatientHistoryContent;
