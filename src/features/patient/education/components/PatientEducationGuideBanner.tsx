import { ArrowRight, BookOpenCheck, HeartPulse, Notebook } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { PatientEducationGuide } from "../types";

type PatientEducationGuideBannerProps = {
  guide: PatientEducationGuide;
  onReadNow: () => void;
};

function getGuideVisualConfig(ageGroup: PatientEducationGuide["ageGroup"]) {
  if (ageGroup === "complementary") {
    return {
      wrapperClassName:
        "bg-gradient-to-br from-nutri-secondary/15 via-nutri-off-white to-nutri-white text-nutri-primary",
      icon: <BookOpenCheck size={34} aria-hidden />,
      badge: "6-12 meses",
    };
  }

  if (ageGroup === "early-childhood") {
    return {
      wrapperClassName:
        "bg-gradient-to-br from-nutri-primary/15 via-nutri-off-white to-nutri-white text-nutri-primary",
      icon: <HeartPulse size={34} aria-hidden />,
      badge: "2-5 anos",
    };
  }

  return {
    wrapperClassName:
      "bg-gradient-to-br from-nutri-light-grey/70 via-nutri-off-white to-nutri-white text-nutri-primary",
    icon: <Notebook size={34} aria-hidden />,
    badge: "Guia general",
  };
}

export function PatientEducationGuideBanner({
  guide,
  onReadNow,
}: PatientEducationGuideBannerProps) {
  const visual = getGuideVisualConfig(guide.ageGroup);

  return (
    <Card className="overflow-hidden p-0">
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-nutri-secondary">
            La Guia del Mes
          </p>
          <h2 className="text-2xl font-bold leading-tight text-nutri-primary sm:text-3xl">
            {guide.title}
          </h2>
          <p className="text-sm text-nutri-dark-grey sm:text-base">{guide.description}</p>
          <Button variant="primary" className="px-4 py-2 text-sm" onClick={onReadNow}>
            {guide.ctaLabel}
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>

        <div className={cn("border-l border-nutri-light-grey p-5 sm:p-6", visual.wrapperClassName)}>
          <div className="flex h-full flex-col justify-between rounded-2xl border border-nutri-primary/10 bg-nutri-white/60 p-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-nutri-primary/15 bg-nutri-white">
              {visual.icon}
            </div>

            <div className="space-y-1">
              <p className="inline-flex rounded-full border border-nutri-primary/20 bg-nutri-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-nutri-primary">
                {visual.badge}
              </p>
              <p className="text-base font-semibold text-nutri-primary">{guide.imageTitle}</p>
              <p className="text-sm text-nutri-dark-grey/85">{guide.imageCaption}</p>
            </div>
          </div>
        </div>
      </section>
    </Card>
  );
}
