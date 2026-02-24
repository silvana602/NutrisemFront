import { cn } from "@/lib/utils";

import type { PatientDiagnosisStatusTone } from "../types";
import { getStatusDotClassName, getStatusTagClassName } from "../utils";

type PatientDiagnosisStatusIndicatorProps = {
  status: string;
  tone: PatientDiagnosisStatusTone;
  className?: string;
};

export function PatientDiagnosisStatusIndicator({
  status,
  tone,
  className,
}: PatientDiagnosisStatusIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold",
        getStatusTagClassName(tone),
        className
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", getStatusDotClassName(tone))} aria-hidden />
      <span>{status}</span>
    </span>
  );
}
