"use client";

import React, { useMemo, useState } from "react";
import { SearchBar } from "@/components/molecules/SearchBar";
import { db, seedOnce } from "@/mocks/db";
import type { Patient } from "@/types";

// Inicializa mock DB (idempotente)
seedOnce();

// Normaliza texto (acentos, mayúsculas)
const normalize = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export const PatientSelector: React.FC = () => {
    const [query, setQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const patients = db.patients;

    const filteredPatients = useMemo(() => {
        if (query.trim().length < 3) return [];

        const q = normalize(query);

        return patients.filter((patient) => {
            const fullName = normalize(
                `${patient.firstName} ${patient.lastName}`
            );
            const ci = normalize(patient.identityNumber);

            return fullName.includes(q) || ci.includes(q);
        });
    }, [query, patients]);

    const handleSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        setQuery("");
        setHighlightedIndex(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!filteredPatients.length) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((i) =>
                    i < filteredPatients.length - 1 ? i + 1 : 0
                );
                break;

            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((i) =>
                    i > 0 ? i - 1 : filteredPatients.length - 1
                );
                break;

            case "Enter":
                e.preventDefault();
                handleSelect(filteredPatients[highlightedIndex]);
                break;

            case "Escape":
                setQuery("");
                setHighlightedIndex(0);
                break;
        }
    };

    return (
        <section className="relative w-full max-w-xl">
            <h3 className="text-sm font-medium text-[var(--color-nutri-black)]">
                Buscar Paciente registrado
            </h3>

            <div onKeyDown={handleKeyDown}>
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Buscar por nombre o cédula de identidad"
                />
            </div>

            {/* Dropdown */}
            {query.length >= 3 && filteredPatients.length > 0 && (
                <ul
                    role="listbox"
                    className="
            absolute z-10 mt-1 w-full
            rounded-lg border
            bg-[var(--color-nutri-white)]
            border-[var(--color-nutri-light-grey)]
            shadow-md
            overflow-hidden"                >
                    {filteredPatients.map((patient, index) => (
                        <li
                            key={patient.patientId}
                            role="option"
                            aria-selected={index === highlightedIndex}
                            onClick={() => handleSelect(patient)}
                            className={`
                px-4 py-2 cursor-pointer transition-colors
                ${index === highlightedIndex
                                    ? "bg-[var(--color-nutri-light-grey)]"
                                    : "hover:bg-[var(--color-nutri-off-white)]"
                                }`}
                        >
                            <p className="text-sm font-medium text-[var(--color-nutri-black)]">
                                {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-xs text-[var(--color-nutri-dark-grey)]">
                                CI: {patient.identityNumber}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            {/* Selected patient */}
            {selectedPatient && (
                <div
                    className="
            mt-4 rounded-lg
            bg-[var(--color-nutri-off-white)]
            border border-[var(--color-nutri-light-grey)]
            px-4 py-3          "
                >
                    <p className="text-sm text-[var(--color-nutri-dark-grey)]">
                        Consulta al paciente:
                    </p>
                    <p className="text-base font-semibold text-[var(--color-nutri-primary)]">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                </div>
            )}
        </section>
    );
};
