"use client";

import { useEffect, useMemo, useState } from "react";

import { db, seedOnce } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PatientDiagnosisChartModal,
  PatientDiagnosisEmptyState,
  PatientDiagnosisHero,
  PatientDiagnosisHistoryTable,
  PatientDiagnosisSummaryCard,
} from "@/features/patient/diagnosis/components";
import { buildPatientDiagnosisViewModel, generatePatientDiagnosisReportPdf } from "@/features/patient/diagnosis/utils";

seedOnce();

export default function PatientDiagnosisPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);
  const [expandedDiagnosisId, setExpandedDiagnosisId] = useState<string | null>(null);
  const [downloadingDiagnosisId, setDownloadingDiagnosisId] = useState<string | null>(null);

  const viewModel = useMemo(() => {
    if (!user) return null;

    return buildPatientDiagnosisViewModel({
      userId: user.userId,
      users: db.users,
      patients: db.patients,
      clinicians: db.clinicians,
      consultations: db.consultations,
      diagnoses: db.diagnoses,
      clinicalData: db.clinicalData,
      anthropometricData: db.anthropometricData,
      recommendations: db.recommendations,
    });
  }, [user]);

  useEffect(() => {
    if (!viewModel?.rows.length) {
      setSelectedDiagnosisId(null);
      return;
    }

    setSelectedDiagnosisId((current) => {
      if (current && viewModel.rows.some((row) => row.diagnosisId === current)) {
        return current;
      }
      return viewModel.rows[0].diagnosisId;
    });
  }, [viewModel]);

  const selectedRow = useMemo(() => {
    if (!viewModel) return null;
    if (!viewModel.rows.length) return null;

    if (!selectedDiagnosisId) return viewModel.rows[0];

    return viewModel.rows.find((row) => row.diagnosisId === selectedDiagnosisId) ?? viewModel.rows[0];
  }, [viewModel, selectedDiagnosisId]);

  const expandedRow = useMemo(() => {
    if (!viewModel || !expandedDiagnosisId) return null;
    return viewModel.rows.find((row) => row.diagnosisId === expandedDiagnosisId) ?? null;
  }, [viewModel, expandedDiagnosisId]);

  if (!user) return null;

  const handleDownloadReport = async (diagnosisId: string) => {
    if (!viewModel) return;

    const row = viewModel.rows.find((item) => item.diagnosisId === diagnosisId) ?? null;
    if (!row) return;

    setDownloadingDiagnosisId(diagnosisId);
    try {
      await generatePatientDiagnosisReportPdf({
        patient: viewModel,
        row,
      });
    } catch (error) {
      console.error("Error generando informe PDF del paciente:", error);
      window.alert("No se pudo generar el informe. Intenta nuevamente.");
    } finally {
      setDownloadingDiagnosisId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PatientDiagnosisHero firstName={user.firstName} />

      {!viewModel || viewModel.rows.length === 0 ? (
        <PatientDiagnosisEmptyState />
      ) : (
        <>
          <PatientDiagnosisHistoryTable
            rows={viewModel.rows}
            selectedDiagnosisId={selectedDiagnosisId}
            downloadingDiagnosisId={downloadingDiagnosisId}
            onViewSummary={setSelectedDiagnosisId}
            onDownloadPdf={handleDownloadReport}
          />

          {selectedRow ? (
            <PatientDiagnosisSummaryCard
              row={selectedRow}
              isDownloading={downloadingDiagnosisId === selectedRow.diagnosisId}
              onDownloadReport={() => handleDownloadReport(selectedRow.diagnosisId)}
              onExpandChart={() => setExpandedDiagnosisId(selectedRow.diagnosisId)}
            />
          ) : null}
        </>
      )}

      <PatientDiagnosisChartModal row={expandedRow} onClose={() => setExpandedDiagnosisId(null)} />
    </div>
  );
}
