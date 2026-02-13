"use client";

import React, { useState } from "react";
import { PatientHistoryContent } from "@/components/organisms/clinician/histories/PatientHistoryContent";
import { ReportsContent } from "@/components/organisms/clinician/reports/ReportsContent";
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
      <h1 className="mb-6 text-3xl font-semibold text-nutri-dark-grey">Historial y Reportes</h1>

      <Tabs tabs={REPORTS_TABS} activeTab={tab} onTabChange={setTab} className="mb-6" />

      <div className="w-full">
        {tab === "historiales" && <PatientHistoryContent />}
        {tab === "reportes" && <ReportsContent />}
      </div>
    </div>
  );
}
