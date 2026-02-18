"use client";

import React, { useState } from "react";
import { CONSULTATION_TABS, ConsultationTabId } from "./tabs.constants";
import { AnthropometricForm } from "../forms/AnthropometricForm";
import { ClinicalForm } from "../forms/ClinicalForm";
import { HistoricalForm } from "../forms/HistoricalForm";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useConsultationStore } from "@/store/useConsultationStore";

export const ConsultationTabs: React.FC = () => {
  const selectedPatientId = useConsultationStore((s) => s.selectedPatientId);
  const isAnthropometricValid = useConsultationStore((s) => s.isAnthropometricValid);
  const isClinicalValid = useConsultationStore((s) => s.isClinicalValid);
  const isHistoricalValid = useConsultationStore((s) => s.isHistoricalValid);

  const [activeTab, setActiveTab] = useState<ConsultationTabId>("anthropometric");
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const isClinicalUnlocked = Boolean(selectedPatientId && isAnthropometricValid);
  const isHistoricalUnlocked = Boolean(isClinicalUnlocked && isClinicalValid);

  const canAccessTab = (tabId: ConsultationTabId) => {
    if (tabId === "anthropometric") return true;
    if (tabId === "clinical") return isClinicalUnlocked;
    return isHistoricalUnlocked;
  };

  const tabs = CONSULTATION_TABS.map((tab) => ({
    ...tab,
    disabled: !canAccessTab(tab.id),
  }));

  const safeActiveTab: ConsultationTabId = (() => {
    if (!selectedPatientId) return "anthropometric";
    if (activeTab === "historical" && !isHistoricalUnlocked) {
      return isClinicalUnlocked ? "clinical" : "anthropometric";
    }
    if (activeTab === "clinical" && !isClinicalUnlocked) return "anthropometric";
    return activeTab;
  })();

  const goNext = () => {
    if (safeActiveTab === "anthropometric" && isAnthropometricValid) {
      setActiveTab("clinical");
      return;
    }

    if (safeActiveTab === "clinical" && isClinicalValid) {
      setActiveTab("historical");
    }
  };

  const goBack = () => {
    if (safeActiveTab === "clinical") {
      setActiveTab("anthropometric");
      return;
    }

    if (safeActiveTab === "historical") {
      setActiveTab("clinical");
    }
  };

  const showBack = safeActiveTab === "clinical" || safeActiveTab === "historical";
  const showNext =
    (safeActiveTab === "anthropometric" && isAnthropometricValid) ||
    (safeActiveTab === "clinical" && isClinicalValid);
  const showSave = safeActiveTab === "historical" && isHistoricalValid;

  const handleConfirmSave = () => {
    setIsSaveConfirmOpen(false);
  };

  return (
    <section className="w-full">
      <Tabs
        tabs={tabs}
        activeTab={safeActiveTab}
        onTabChange={(tab) => canAccessTab(tab) && setActiveTab(tab)}
      />

      <div className="mt-6">
        {safeActiveTab === "anthropometric" && <AnthropometricForm />}
        {safeActiveTab === "clinical" && <ClinicalForm />}
        {safeActiveTab === "historical" && <HistoricalForm />}
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

          {showSave && (
            <Button variant="primary" onClick={() => setIsSaveConfirmOpen(true)}>
              Guardar consulta
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isSaveConfirmOpen}
        title="Advertencia de seguridad"
        message="Se guardaran los cambios de todo el formulario. Verifica que la informacion sea correcta antes de confirmar."
        onCancel={() => setIsSaveConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        confirmLabel="Guardar"
        cancelLabel="Cancelar"
      />
    </section>
  );
};
