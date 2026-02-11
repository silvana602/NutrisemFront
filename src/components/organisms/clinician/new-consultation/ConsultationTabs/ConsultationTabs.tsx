"use client";

import React, { useState } from "react";
import { CONSULTATION_TABS, ConsultationTabId } from "./tabs.constants";
import { AnthropometricForm } from "../forms/AnthropometricForm";

export const ConsultationTabs: React.FC = () => {
    const [activeTab, setActiveTab] =
        useState<ConsultationTabId>("anthropometric");

    return (
        <section className="w-full">
            {/* Tabs header */}
            <div className="flex gap-2 border-b border-[var(--color-nutri-light-grey)]">
                {CONSULTATION_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                px-4 py-2 text-sm font-medium rounded-t-md
                transition-colors
                ${activeTab === tab.id
                                ? "bg-[var(--color-nutri-secondary)] text-nutri-white"
                                : "bg-transparent text-[var(--color-nutri-dark-grey)] hover:bg-[var(--color-nutri-light-grey)]"
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="mt-6">
                {activeTab === "anthropometric" && <AnthropometricForm />}
                {activeTab === "clinical" && (
                    <p className="text-sm text-[var(--color-nutri-dark-grey)]">
                        Pendiente: Datos Clínicos
                    </p>
                )}
                {activeTab === "historical" && (
                    <p className="text-sm text-[var(--color-nutri-dark-grey)]">
                        Pendiente: Datos Históricos
                    </p>
                )}
            </div>
        </section>
    );
};
