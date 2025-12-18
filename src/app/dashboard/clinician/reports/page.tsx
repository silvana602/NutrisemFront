"use client";

import React, { useState } from "react";
import { PatientHistoryContent } from "@/components/organisms/clinician/histories/PatientHistoryContent";
import { ReportsContent } from "@/components/organisms/clinician/reports/ReportsContent";

export default function HistorialesReportesPage() {
  const [tab, setTab] = useState<"historiales" | "reportes">("historiales");

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <h1 className="text-3xl font-semibold mb-6">Historial y Reportes</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${tab === "historiales" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`}
          onClick={() => setTab("historiales")}
        >
          Historiales
        </button>
        <button
          className={`px-4 py-2 ${tab === "reportes" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`}
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
