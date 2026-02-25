import { Droplets, Dumbbell, Ruler } from "lucide-react";

import { Card } from "@/components/ui/Card";

import type { PatientProgressAchievement } from "../types";

type PatientProgressAchievementsProps = {
  achievements: PatientProgressAchievement[];
};

function AchievementIcon({ id }: { id: PatientProgressAchievement["id"] }) {
  if (id === "growth-spurt") return <Ruler size={18} aria-hidden />;
  if (id === "weight-stable") return <Dumbbell size={18} aria-hidden />;
  return <Droplets size={18} aria-hidden />;
}

export function PatientProgressAchievements({ achievements }: PatientProgressAchievementsProps) {
  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <Card className="p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-nutri-primary">Resumen de logros</h2>
        <span className="nutri-platform-surface-soft rounded-full px-3 py-1 text-xs font-semibold text-nutri-primary">
          {unlockedCount}/{achievements.length} desbloqueados
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {achievements.map((achievement) => (
          <article
            key={achievement.id}
            className={`rounded-xl border px-3 py-3 ${
              achievement.unlocked
                ? "border-emerald-200 bg-emerald-50/70"
                : "nutri-platform-surface border-nutri-light-grey"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                  achievement.unlocked
                    ? "bg-emerald-100 text-emerald-700"
                    : "nutri-platform-surface-soft text-nutri-dark-grey/70"
                }`}
              >
                <AchievementIcon id={achievement.id} />
              </span>
              <h3 className="text-sm font-semibold text-nutri-primary">{achievement.title}</h3>
            </div>
            <p className="text-sm text-nutri-dark-grey">{achievement.description}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}
