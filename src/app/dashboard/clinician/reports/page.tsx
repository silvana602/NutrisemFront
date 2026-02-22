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
    <div className="w-full px-4 py-4 sm:px-6">
      <Heading
        containerClassName="mb-6"
        eyebrow="Modulo clinician"
        description="Consulta historiales clinicos y genera reportes desde un solo lugar."
      >
        Historial y reportes
      </Heading>

      <Tabs tabs={REPORTS_TABS} activeTab={tab} onTabChange={setTab} className="mb-6" />

      <div className="w-full">
        {tab === "historiales" && <PatientHistoryContent />}
        {tab === "reportes" && <ReportsContent />}
      </div>
    </div>
  );
}
