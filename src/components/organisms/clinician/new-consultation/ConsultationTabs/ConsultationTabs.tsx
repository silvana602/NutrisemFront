"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CONSULTATION_TABS, ConsultationTabId } from "./tabs.constants";
import { AnthropometricForm } from "../forms/AnthropometricForm";
import { ClinicalForm } from "../forms/ClinicalForm";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useConsultationStore } from "@/store/useConsultationStore";

export const ConsultationTabs: React.FC = () => {
  const selectedPatientId = useConsultationStore((s) => s.selectedPatientId);
  const isAnthropometricValid = useConsultationStore((s) => s.isAnthropometricValid);
  const isClinicalValid = useConsultationStore((s) => s.isClinicalValid);

  const [activeTab, setActiveTab] = useState<ConsultationTabId>("anthropometric");
  const [unlocked, setUnlocked] = useState({
    clinical: false,
    historical: false,
  });

  useEffect(() => {
    if (!selectedPatientId) {
      setUnlocked({ clinical: false, historical: false });
      setActiveTab("anthropometric");
      return;
    }

    if (!isAnthropometricValid) {
      setUnlocked({ clinical: false, historical: false });
      setActiveTab("anthropometric");
      return;
    }

    if (!isClinicalValid) {
      setUnlocked((prev) => ({ ...prev, historical: false }));
      if (activeTab === "historical") {
        setActiveTab("clinical");
      }
    }
  }, [selectedPatientId, isAnthropometricValid, isClinicalValid, activeTab]);

  const canAccessTab = (tabId: ConsultationTabId) => {
    if (tabId === "anthropometric") return true;
    if (tabId === "clinical") return unlocked.clinical;
    return unlocked.historical;
  };

  const tabs = useMemo(
    () =>
      CONSULTATION_TABS.map((tab) => ({
        ...tab,
        disabled: !canAccessTab(tab.id),
      })),
    [unlocked]
  );

  const goNext = () => {
    if (activeTab === "anthropometric" && isAnthropometricValid) {
      setUnlocked((prev) => ({ ...prev, clinical: true }));
      setActiveTab("clinical");
      return;
    }

    if (activeTab === "clinical" && isClinicalValid) {
      setUnlocked((prev) => ({ ...prev, historical: true }));
      setActiveTab("historical");
    }
  };

  const goBack = () => {
    if (activeTab === "clinical") {
      setActiveTab("anthropometric");
      return;
    }

    if (activeTab === "historical") {
      setActiveTab("clinical");
    }
  };

  const showBack = activeTab === "clinical" || activeTab === "historical";
  const showNext =
    (activeTab === "anthropometric" && isAnthropometricValid) ||
    (activeTab === "clinical" && isClinicalValid);

  return (
    <section className="w-full">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tab) => canAccessTab(tab) && setActiveTab(tab)} />

      <div className="mt-6">
        {activeTab === "anthropometric" && <AnthropometricForm />}
        {activeTab === "clinical" && <ClinicalForm />}
        {activeTab === "historical" && (
          <section className="space-y-6 rounded-xl bg-nutri-white p-6">
            <h3 className="text-lg font-semibold text-nutri-primary">Datos Historicos</h3>
            <p className="text-sm text-[var(--color-nutri-dark-grey)]">
              Pendiente: formulario de datos historicos.
            </p>
          </section>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div>
          {showBack && (
            <Button variant="outline" onClick={goBack}>
              Atras
            </Button>
          )}
        </div>

        <div>
          {showNext && (
            <Button variant="primary" onClick={goNext}>
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
