"use client";

import React, { useState } from "react";
import { PatientHistoryContent } from "@/components/organisms/clinician/histories/PatientHistoryContent";
import { ReportsContent } from "@/components/organisms/clinician/reports/ReportsContent";
import { Heading } from "@/components/atoms/Heading";
import { TabItem, Tabs } from "@/components/ui/Tabs";

type ReportsTabId = "historiales" | "reportes";

const REPORTS_TABS: readonly TabItem<ReportsTabId>[] = [
  { id: "historiales", label: "Historiales" },
  { id: "reportes", label: "Reportes" },
] as const;

export default function HistorialesReportesPage() {
  const [tab, setTab] = useState<ReportsTabId>("historiales");

  return (
    <div className="nutri-clinician-page w-full px-1 py-1 sm:px-2">
      <Heading
        containerClassName="nutri-clinician-page-header mb-1 p-4 sm:p-5"
        eyebrow="Modulo clinician"
        description="Consulta historiales clinicos y genera reportes desde un solo lugar."
      >
        Historial y reportes
      </Heading>

      <Tabs tabs={REPORTS_TABS} activeTab={tab} onTabChange={setTab} />

      <div className="nutri-clinician-surface w-full p-4 sm:p-5">
        {tab === "historiales" && <PatientHistoryContent />}
        {tab === "reportes" && <ReportsContent />}
      </div>
    </div>
  );
}
