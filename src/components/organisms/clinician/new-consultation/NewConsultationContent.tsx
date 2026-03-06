"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NewConsultationHeader } from "./ConsultationHeader";
import { PatientSelector } from "./patientSelector/PatientSelector";
import { ConsultationTabs } from "./ConsultationTabs/ConsultationTabs";
import { useConsultationStore } from "@/store/useConsultationStore";
import { db } from "@/mocks/db";

type NewConsultationContentProps = {
  initialPatientId?: string | null;
};

export const NewConsultationContent: React.FC<NewConsultationContentProps> = ({
  initialPatientId = null,
}) => {
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");
  const resolvedPatientId = initialPatientId ?? patientIdFromQuery;
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const setSelectedPatientId = useConsultationStore((state) => state.setSelectedPatientId);

  useEffect(() => {
    if (!resolvedPatientId) return;
    if (selectedPatientId === resolvedPatientId) return;

    const patientExists = db.patients.some((patient) => patient.patientId === resolvedPatientId);
    if (!patientExists) return;

    setSelectedPatientId(resolvedPatientId);
  }, [resolvedPatientId, selectedPatientId, setSelectedPatientId]);

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
