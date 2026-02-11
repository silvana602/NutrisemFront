"use client";

import React, { useState } from "react";
import { PatientHistoryContent } from "@/components/organisms/clinician/histories/PatientHistoryContent";
import { ReportsContent } from "@/components/organisms/clinician/reports/ReportsContent";

export default function HistorialesReportesPage() {
  const [tab, setTab] = useState<"historiales" | "reportes">("historiales");

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <h1 className="mb-6 text-3xl font-semibold text-nutri-dark-grey">Historial y Reportes</h1>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-nutri-light-grey">
        <button
          className={`px-4 py-2 ${tab === "historiales" ? "border-b-2 border-nutri-primary font-semibold text-nutri-primary" : "text-nutri-dark-grey"}`}
          onClick={() => setTab("historiales")}
        >
          Historiales
        </button>
        <button
          className={`px-4 py-2 ${tab === "reportes" ? "border-b-2 border-nutri-primary font-semibold text-nutri-primary" : "text-nutri-dark-grey"}`}
          onClick={() => setTab("reportes")}
        >
          Reportes
        </button>
      </div>

      {/* Contenido */}
      <div className="w-full">
        {tab === "historiales" && <PatientHistoryContent />}
        {tab === "reportes" && <ReportsContent />}
      </div>
    </div>
  );
}
