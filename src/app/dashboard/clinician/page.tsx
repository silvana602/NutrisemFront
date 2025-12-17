"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ClinicianDashboardContent } from "@/components/organisms/clinician/ClinicianDashboardContent";

export default function ClinicianDashboardPage() {
  const user = useAuthStore();

  if (!user) return null;

  return <ClinicianDashboardContent user={user} />;
}
