"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ClinicianDashboardContent } from "@/components/organisms/clinician/ClinicianDashboardContent";

export default function ClinicianDashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return <ClinicianDashboardContent user={user} />;
}
