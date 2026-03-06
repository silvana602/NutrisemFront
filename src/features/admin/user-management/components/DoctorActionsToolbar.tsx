"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

type DoctorActionsToolbarProps = {
  onCreateDoctor: () => void;
};

export function DoctorActionsToolbar({ onCreateDoctor }: DoctorActionsToolbarProps) {
  return (
    <div className="nutri-platform-surface-soft flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <p className="text-sm text-nutri-dark-grey/85">
        Gestiona altas de profesionales y controla su acceso al sistema.
      </p>
      <Button className="w-full sm:w-auto" onClick={onCreateDoctor}>
        <UserPlus size={16} />
        Dar de alta nuevo médico
      </Button>
    </div>
  );
}
