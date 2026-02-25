import { Activity, BarChart3, FileText, Users } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { LandingCapability } from "../types";

type LandingCapabilitiesSectionProps = {
  capabilities: LandingCapability[];
};

function getCapabilityIcon(capabilityId: LandingCapability["capabilityId"]) {
  if (capabilityId === "continuous-monitoring") {
    return <Activity size={22} aria-hidden />;
  }

  if (capabilityId === "smart-alerts") {
    return <BarChart3 size={22} aria-hidden />;
  }

  if (capabilityId === "clinical-network") {
    return <Users size={22} aria-hidden />;
  }

  return <FileText size={22} aria-hidden />;
}

export function LandingCapabilitiesSection({
  capabilities,
}: LandingCapabilitiesSectionProps) {
  return (
    <section id="landing-capabilities" className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-nutri-secondary">
          Capacidades clave
        </p>
        <h2 className="text-2xl font-bold text-nutri-primary sm:text-3xl">
          Todo el flujo nutricional pediátrico en una interfaz clara
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {capabilities.map((item) => (
          <Card
            key={item.capabilityId}
            className="group h-full p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(23,42,58,0.18)]"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-nutri-primary/15 bg-nutri-off-white text-nutri-primary">
              {getCapabilityIcon(item.capabilityId)}
            </div>

            <h3 className="text-lg font-semibold text-nutri-primary">{item.title}</h3>
            <p className="mt-2 text-sm text-nutri-dark-grey">{item.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-nutri-secondary">
              {item.badge}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
