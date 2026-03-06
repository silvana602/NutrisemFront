"use client";

import { useParams } from "next/navigation";
import { AdminPatientFormContent } from "@/features/admin/user-management/components";

function resolvePatientId(rawValue: string | string[] | undefined): string | null {
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

export default function AdminPatientDetailPage() {
  const params = useParams<{ patientId: string | string[] }>();
  const patientId = resolvePatientId(params?.patientId);

  return <AdminPatientFormContent patientId={patientId} />;
}
