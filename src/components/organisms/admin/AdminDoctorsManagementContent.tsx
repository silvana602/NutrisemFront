"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import AlertDialog from "@/components/ui/AlertDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { db, seedOnce } from "@/mocks/db";
import {
  DoctorActionsToolbar,
  DoctorsSummaryCards,
  DoctorsTable,
} from "@/features/admin/user-management/components";
import {
  buildDoctorManagementRows,
  buildDoctorPerformanceSummary,
  buildInitialDoctorAccessStatus,
} from "@/features/admin/user-management/utils";
import type { DoctorManagementRow } from "@/features/admin/user-management/types";

seedOnce();

type DoctorActionState =
  | { type: "reset-password"; row: DoctorManagementRow }
  | { type: "suspend-access"; row: DoctorManagementRow }
  | { type: "activate-access"; row: DoctorManagementRow }
  | null;

function resolveActionDialogCopy(action: DoctorActionState): {
  title: string;
  message: string;
  confirmLabel: string;
} {
  if (!action) {
    return {
      title: "",
      message: "",
      confirmLabel: "Confirmar",
    };
  }

  if (action.type === "reset-password") {
    return {
      title: "Resetear contraseña",
      message: `¿Deseas resetear la contraseña del médico ${action.row.nombreCompleto}?`,
      confirmLabel: "Resetear",
    };
  }

  if (action.type === "suspend-access") {
    return {
      title: "Suspender acceso",
      message: `¿Deseas suspender temporalmente el acceso de ${action.row.nombreCompleto}?`,
      confirmLabel: "Suspender",
    };
  }

  return {
    title: "Reactivar acceso",
    message: `¿Deseas reactivar el acceso de ${action.row.nombreCompleto}?`,
    confirmLabel: "Reactivar",
  };
}

export default function AdminDoctorsManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRows = useMemo(
    () =>
      buildDoctorManagementRows({
        clinicians: db.clinicians,
        users: db.users,
        consultations: db.consultations,
      }),
    []
  );

  const [accessStatusByClinicianId, setAccessStatusByClinicianId] = useState(() =>
    buildInitialDoctorAccessStatus(initialRows)
  );
  const [pendingAction, setPendingAction] = useState<DoctorActionState>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      buildDoctorManagementRows({
        clinicians: db.clinicians,
        users: db.users,
        consultations: db.consultations,
        accessStatusByClinicianId,
      }),
    [accessStatusByClinicianId]
  );

  const summary = useMemo(() => buildDoctorPerformanceSummary(rows), [rows]);
  const actionDialogCopy = resolveActionDialogCopy(pendingAction);
  const newClinicianId = searchParams.get("newClinicianId");
  const updatedClinicianId = searchParams.get("updatedClinicianId");
  const highlightedDoctorId = newClinicianId || updatedClinicianId;
  const highlightedDoctor = highlightedDoctorId
    ? rows.find((row) => row.clinicianId === highlightedDoctorId) ?? null
    : null;

  const handleResetPassword = (row: DoctorManagementRow) => {
    setPendingAction({ type: "reset-password", row });
  };

  const handleToggleAccess = (row: DoctorManagementRow) => {
    setPendingAction({
      type: row.estadoAcceso === "activo" ? "suspend-access" : "activate-access",
      row,
    });
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === "reset-password") {
      setFeedbackMessage(
        `Se generó un restablecimiento de contraseña para ${pendingAction.row.nombreCompleto}.`
      );
      setPendingAction(null);
      return;
    }

    const nextStatus =
      pendingAction.type === "suspend-access" ? "inactivo" : "activo";

    setAccessStatusByClinicianId((previous) => ({
      ...previous,
      [pendingAction.row.clinicianId]: nextStatus,
    }));
    setFeedbackMessage(
      nextStatus === "activo"
        ? `Acceso reactivado para ${pendingAction.row.nombreCompleto}.`
        : `Acceso suspendido para ${pendingAction.row.nombreCompleto}.`
    );
    setPendingAction(null);
  };

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Valida médicos activos, controla accesos y revisa métricas de desempeño por atención."
        >
          Gestión de médicos
        </Heading>
      </div>

      {highlightedDoctor && (
        <div className="nutri-platform-surface-soft rounded-lg border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {newClinicianId
            ? `Médico ${highlightedDoctor.nombreCompleto} registrado correctamente.`
            : `Datos de ${highlightedDoctor.nombreCompleto} actualizados correctamente.`}
        </div>
      )}

      <DoctorActionsToolbar
        onCreateDoctor={() => router.push("/dashboard/admin/users/medicos/new")}
      />

      <DoctorsSummaryCards summary={summary} />

      <DoctorsTable
        rows={rows}
        onResetPassword={handleResetPassword}
        onToggleAccess={handleToggleAccess}
      />

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={actionDialogCopy.title}
        message={actionDialogCopy.message}
        confirmLabel={actionDialogCopy.confirmLabel}
        cancelLabel="Cancelar"
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
      />

      <AlertDialog
        open={Boolean(feedbackMessage)}
        title="Acción completada"
        message={feedbackMessage ?? ""}
        onClose={() => setFeedbackMessage(null)}
      />
    </div>
  );
}
