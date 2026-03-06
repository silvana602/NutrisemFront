import { cn } from "@/lib/utils";
import type { DoctorAccessStatus } from "../types";

type DoctorStatusBadgeProps = {
  status: DoctorAccessStatus;
};

export function DoctorStatusBadge({ status }: DoctorStatusBadgeProps) {
  const isActive = status === "activo";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", isActive ? "bg-emerald-500" : "bg-red-500")}
      />
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
