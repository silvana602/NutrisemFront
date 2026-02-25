"use client";

import { useAuthStore } from "@/store/useAuthStore";
import AdminDashboard from "./admin/page";
import ClinicianDashboardContent from "./clinician/page";
import PatientDashboard from "./patient/page";
import { LoadingButton } from "@/components/ui/Spinner";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingButton loading={true}>Cargando...</LoadingButton>
      </div>
    );
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "clinician":
      return <ClinicianDashboardContent />;
    case "patient":
      return <PatientDashboard />;
    default:
      return (
        <div className="flex h-full items-center justify-center px-4">
          <div className="nutri-platform-surface w-full max-w-md p-5 text-center">
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
      );
  }
}
