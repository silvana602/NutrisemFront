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
    <div className="nutri-clinician-page w-full min-h-0 px-1 py-1 sm:px-2">
      <section className="nutri-clinician-page-header p-4 sm:p-5">
        <NewConsultationHeader />
      </section>
      <section className="nutri-clinician-surface p-4 sm:p-5">
        <PatientSelector />
      </section>
      <section className="nutri-clinician-surface p-4 sm:p-5">
        <ConsultationTabs />
      </section>
    </div>
  );
};
