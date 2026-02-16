"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import AdminDashboard from "./admin/page";
import ClinicianDashboardContent from "./clinician/page";
import PatientDashboard from "./patient/page";
import { LoadingButton } from "@/components/ui/Spinner";
import AlertDialog from "@/components/ui/AlertDialog";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  if (!user || !activeRole) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingButton loading={true}>Cargando...</LoadingButton>
      </div>
    );
  }

  switch (activeRole) {
    case "admin":
      return <AdminDashboard />;
    case "clinician":
      return <ClinicianDashboardContent />;
    case "patient":
      return <PatientDashboard />;
    default:
      // Si el rol no coincide con nada, mostrar modal de alerta
      setTimeout(() => {
        if (!showAlert) {
          setAlertMessage("Rol desconocido. Contacte con soporte.");
          setShowAlert(true);
        }
      }, 0);

      return (
        <>
          <AlertDialog
            open={showAlert}
            title="Rol desconocido"
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
          <div className="flex h-full items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl border border-nutri-secondary/35 bg-nutri-white p-5 text-center shadow-sm">
              <p className="text-base font-semibold text-nutri-primary">
                No se pudo cargar el panel
              </p>
              <p className="mt-1 text-sm text-nutri-dark-grey">
                Rol desconocido. Contacte con soporte.
              </p>
              <div className="mt-4 flex justify-center">
                <LoadingButton loading={true}>Cargando...</LoadingButton>
              </div>
            </div>
          </div>
        </>
      );
  }
}
