"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NewConsultationHeader } from "./ConsultationHeader";
import { PatientSelector } from "./patientSelector/PatientSelector";
import { ConsultationTabs } from "./ConsultationTabs/ConsultationTabs";
import { useConsultationStore } from "@/store/useConsultationStore";
import { db } from "@/mocks/db";

export const NewConsultationContent: React.FC = () => {
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const setSelectedPatientId = useConsultationStore((state) => state.setSelectedPatientId);

  useEffect(() => {
    if (!patientIdFromQuery) return;
    if (selectedPatientId === patientIdFromQuery) return;

    const patientExists = db.patients.some((patient) => patient.patientId === patientIdFromQuery);
    if (!patientExists) return;

    setSelectedPatientId(patientIdFromQuery);
  }, [patientIdFromQuery, selectedPatientId, setSelectedPatientId]);

  return (
    <div
      className="
        w-full min-h-0
        px-3 py-4 sm:px-6 sm:py-6
        space-y-8
        flex flex-col
        bg-[var(--color-nutri-off-white)]"
    >
      <NewConsultationHeader />
      <PatientSelector />
      <ConsultationTabs />
    </div>
  );
};

