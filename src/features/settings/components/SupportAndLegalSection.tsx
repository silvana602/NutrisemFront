import React from "react";
import { CircleHelp, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SettingsSectionCard } from "./SettingsSectionCard";

type SupportAndLegalSectionProps = {
  onLogout: () => void;
};

export function SupportAndLegalSection({ onLogout }: SupportAndLegalSectionProps) {
  return (
    <SettingsSectionCard
      title="Soporte y legal"
      description="Accede a ayuda técnica, revisa condiciones de uso y protege tu sesión en equipos compartidos."
      icon={<CircleHelp size={16} />}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <a
          href="mailto:soporte@nutrisem.app?subject=Ayuda%20en%20Nutrisem"
          className="rounded-xl border border-nutri-light-grey bg-white/80 px-4 py-3 text-sm text-nutri-dark-grey transition-colors hover:bg-nutri-off-white"
        >
          <p className="font-semibold text-nutri-primary">Ayuda / Centro de soporte</p>
          <p className="mt-1 text-xs text-nutri-dark-grey/80">
            Contacta al equipo técnico para dudas funcionales o problemas de acceso.
          </p>
        </a>

        <div className="rounded-xl border border-nutri-light-grey bg-white/80 px-4 py-3 text-sm text-nutri-dark-grey">
          <p className="flex items-center gap-2 font-semibold text-nutri-primary">
            <FileText size={14} />
            Términos y condiciones
          </p>
          <p className="mt-1 text-xs text-nutri-dark-grey/80">
            El uso de esta plataforma implica el manejo responsable y confidencial de datos sensibles
            de menores, conforme a normativa vigente.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-nutri-primary/20 bg-nutri-primary/5 p-3">
        <p className="text-xs text-nutri-dark-grey/85">
          Si utilizas una computadora compartida, cierra sesión al finalizar para proteger la
          información clínica y personal.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onLogout}
          className="mt-3 border-nutri-primary/25"
        >
          <LogOut size={15} />
          Cerrar sesión
        </Button>
      </div>
    </SettingsSectionCard>
  );
}
