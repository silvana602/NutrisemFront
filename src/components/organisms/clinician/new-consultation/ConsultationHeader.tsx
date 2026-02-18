"use client";

import React from "react";
import { Heading } from "@/components/atoms/Heading";

export const NewConsultationHeader: React.FC = () => {
    const now = new Date();

    const formattedDate = new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(now);

    const formattedTime = new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(now);

    return (
        <header className="flex flex-col gap-4">
            <div className="sm:flex-row sm:items-center sm:justify-between">
                {/* Title */}
                <Heading>Nueva Consulta</Heading>

                {/* Right section: date/time */}
                <div className="flex flex-col gap-3 sm:items-end">
                    {/* Date & Time */}
                    <div
                        className="text-right text-sm leading-tight text-nutri-dark-grey"
                    >
                        <p>Fecha de consulta: {formattedDate}</p>
                        <p>Hora de consulta: {formattedTime}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
