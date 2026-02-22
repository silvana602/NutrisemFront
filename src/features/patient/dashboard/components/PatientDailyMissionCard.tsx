import { MessageCircle } from "lucide-react";

import { Card } from "@/components/ui/Card";

type PatientDailyMissionCardProps = {
  missionText: string;
};

export function PatientDailyMissionCard({ missionText }: PatientDailyMissionCardProps) {
  return (
    <Card className="p-5">
      <header className="mb-3 flex items-center gap-2">
        <MessageCircle size={18} className="text-nutri-primary" aria-hidden />
        <h2 className="text-lg font-semibold text-nutri-primary">Mision del dia</h2>
      </header>

      <div className="relative rounded-2xl border border-nutri-secondary/25 bg-nutri-off-white p-4 pl-5 shadow-sm">
        <span className="absolute -left-1 top-5 h-3.5 w-3.5 rotate-45 border-b border-l border-nutri-secondary/25 bg-nutri-off-white" />
        <p className="text-sm text-nutri-dark-grey">{missionText}</p>
      </div>
    </Card>
  );
}
