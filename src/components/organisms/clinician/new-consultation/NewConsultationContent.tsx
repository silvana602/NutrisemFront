"use client";

import React from "react";
import { NewConsultationHeader } from "./ConsultationHeader";
import { PatientSelector } from "./PatientSelector/PatientSelector";

export const NewConsultationContent: React.FC = () => {
    return (
        <div
            className="
        w-full min-h-screen
        px-6 py-6
        space-y-8
        flex flex-col
        bg-[var(--color-nutri-off-white)]"
        >
            {/* Header */}
            <NewConsultationHeader />

            {/* Patient search & selection */}
            <PatientSelector />
        </div>
    );
};
