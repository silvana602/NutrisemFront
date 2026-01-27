/* // components/organisms/clinician/new-consultation/PatientCard.tsx
"use client";

import React from "react";
import { Patient } from "@/types";
import { colors } from "@/lib/colors";

interface PatientCardProps {
    patient: Patient;
    onSelect?: (patient: Patient) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onSelect }) => {
    return (
        <div
            onClick={() => onSelect?.(patient)}
            className="cursor-pointer rounded-lg p-4 shadow-sm hover:shadow-md transition flex justify-between items-center"
            style={{ backgroundColor: colors.white }}
        >
            <div>
                <p className="font-semibold" style={{ color: colors.primary }}>
                    {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm" style={{ color: colors.darkGrey }}>
                    CI: {patient.identityNumber} | {patient.gender}
                </p>
            </div>
            <div className="text-sm text-gray-500">
                {patient.birthDate.toLocaleDateString()}
            </div>
        </div>
    );
};
 */