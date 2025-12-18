"use client";
import { colors } from "@/lib/colors";

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
    <div className="w-full px-6 py-6 space-y-8">
      <Heading>Patient History</Heading>

      {/* Buscador */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Lista de resultados */}
      {results.length > 1 && !selectedPatient && (
        <div className={`${colors.secondary} rounded-xl shadow-lg p-6 border ${colors.lightGrey}`}>
          <p className={`text-sm ${colors.darkGrey} mb-3`}>
            Select a patient:
          </p>

          <ul className="divide-y divide-gray-200">
            {results.map((p) => {
              const user = db.users.find(
                (u: User) => u.userId === p.userId
              );

              return (
                <li
                  key={p.patientId}
                  className={`py-3 px-4 mb-2 cursor-pointer rounded-lg transition ${colors.lightGrey}`}
                  onClick={() => setSelectedPatient(p)}
                >
                  <strong className={`${colors.primary}`}>
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
          <div className="rounded-xl shadow-lg p-6 bg-white border border-gray-100">
            <PatientSummary patient={selectedPatient} />
          </div>

          <div className="rounded-xl shadow-lg p-6 bg-white border border-gray-100">
            <PatientsHistoryTable patientId={selectedPatient.patientId} />
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {search.length >= 2 && results.length === 0 && (
        <p className={`text-sm ${colors.darkGrey} mt-4`}>
          Pacientes no encontrados
        </p>
      )}
    </div>
  );
};

export default PatientHistoryContent;
