"use client";

import { useParams } from "next/navigation";
import { AdminDoctorFormContent } from "@/features/admin/user-management/components";

function resolveClinicianId(
  rawValue: string | string[] | undefined
): string | null {
  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    return trimmed ? decodeURIComponent(trimmed) : null;
  }

  if (Array.isArray(rawValue)) {
    const firstValue = rawValue[0]?.trim();
    return firstValue ? decodeURIComponent(firstValue) : null;
  }

  return null;
}

export default function AdminDoctorDetailPage() {
  const params = useParams<{ clinicianId: string | string[] }>();
  const clinicianId = resolveClinicianId(params?.clinicianId);

  return <AdminDoctorFormContent mode="edit" clinicianId={clinicianId} />;
}
