"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/components/atoms/Heading";
import { SearchBar } from "@/components/molecules/SearchBar";
import { PatientSummary } from "./PatientSummary";
import { PatientsHistoryTable } from "./PatientHistoryTable";

import { seedOnce, db } from "@/mocks/db";
import type { Patient, User } from "@/types";

export const PatientHistoryContent = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ✅ Cargar DB una sola vez
  useEffect(() => {
    seedOnce();
  }, []);

  // 🔍 Búsqueda con debounce (SIN loops de render)
  useEffect(() => {
    const q = search.trim().toLowerCase();

    const timer = setTimeout(() => {
      // reset limpio
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
        const ci = user.identityCard?.toLowerCase() ?? "";

        return fullName.includes(q) || ci.includes(q);
      });

      setResults(found);
      setSelectedPatient(found.length === 1 ? found[0] : null);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="w-full px-4 py-4 space-y-6">
      <Heading>Historial del Paciente</Heading>

      {/* Buscador */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Lista de resultados */}
      {results.length > 1 && !selectedPatient && (
        <div className="bg-white rounded-md shadow p-4">
          <p className="text-sm text-gray-500 mb-2">
            Selecciona un paciente:
          </p>

          <ul className="divide-y">
            {results.map((p) => {
              const user = db.users.find(
                (u: User) => u.userId === p.userId
              );

              return (
                <li
                  key={p.patientId} // ✅ string OK
                  className="py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                  onClick={() => setSelectedPatient(p)}
                >
                  <strong>
                    {user?.firstName} {user?.lastName}
                  </strong>{" "}
                  – CI: {user?.identityCard ?? "----"}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Summary + Historial */}
      {selectedPatient && (
        <div className="space-y-6">
          <PatientSummary patient={selectedPatient} />
          <PatientsHistoryTable
            patientId={selectedPatient.patientId} // ✅ string
          />
        </div>
      )}

      {/* Sin resultados */}
      {search.length >= 2 && results.length === 0 && (
        <p className="text-sm text-gray-500">
          No se encontraron pacientes.
        </p>
      )}
    </div>
  );
};

export default PatientHistoryContent;
