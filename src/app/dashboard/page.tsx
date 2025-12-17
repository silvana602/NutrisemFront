"use client";

import { useAuthStore } from "@/store/useAuthStore";
import AdminDashboard from "./admin/page";
import ClinicianDashboard from "./clinician/page";
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
      return <ClinicianDashboard />;
    case "patient":
      return <PatientDashboard />;
    default:
      return (
        <div className="p-4 text-center text-red-600">
          Unknown role. Contact support.
        </div>
      );
  }
}
