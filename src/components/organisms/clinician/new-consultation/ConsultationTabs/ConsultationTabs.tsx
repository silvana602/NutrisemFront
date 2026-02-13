"use client";

import React, { useState } from "react";
import { CONSULTATION_TABS, ConsultationTabId } from "./tabs.constants";
import { AnthropometricForm } from "../forms/AnthropometricForm";
import { Tabs } from "@/components/ui/Tabs";

export const ConsultationTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConsultationTabId>("anthropometric");

  return (
    <section className="w-full">
      <Tabs tabs={CONSULTATION_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "anthropometric" && <AnthropometricForm />}
        {activeTab === "clinical" && (
          <p className="text-sm text-[var(--color-nutri-dark-grey)]">Pendiente: Datos Clínicos</p>
        )}
        {activeTab === "historical" && (
          <p className="text-sm text-[var(--color-nutri-dark-grey)]">Pendiente: Datos Históricos</p>
        )}
      </div>
    </section>
  );
};
