import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { buildScaledBarHeights, getTrendDeltaLabel } from "../utils";
import type { LandingTrendSeries } from "../types";

type LandingTrendsSectionProps = {
  years: string[];
  series: LandingTrendSeries[];
};

function getSeriesToneClassName(tone: LandingTrendSeries["tone"]): string {
  if (tone === "secondary") return "from-nutri-secondary to-[#77a2b5]";
  return "from-nutri-primary to-[#30506a]";
}

export function LandingTrendsSection({ years, series }: LandingTrendsSectionProps) {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-nutri-secondary">
          Panorama nacional
        </p>
        <h2 className="text-2xl font-bold text-nutri-primary sm:text-3xl">
          Tendencias para vigilancia y planificacion nutricional
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {series.map((item) => {
          const bars = buildScaledBarHeights(item.values);
          const deltaLabel = getTrendDeltaLabel(item.values);
          const isImproved = Number(deltaLabel.replace(/[^\d.-]/g, "")) < 0;

          return (
            <Card key={item.seriesId} className="p-5">
              <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-nutri-primary">{item.title}</h3>
                  <p className="text-sm text-nutri-dark-grey/80">{item.subtitle}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
                    isImproved
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  {isImproved ? <TrendingDown size={14} aria-hidden /> : <TrendingUp size={14} aria-hidden />}
                  {deltaLabel}
                </span>
              </header>

              <div className="grid grid-cols-5 gap-2">
                {bars.map((height, index) => (
                  <div key={`${item.seriesId}-${years[index]}`} className="flex flex-col items-center gap-2">
                    <div className="flex h-[190px] items-end">
                      <div
                        className={cn(
                          "w-10 rounded-t-xl bg-gradient-to-b transition-all duration-300 hover:opacity-80 sm:w-12",
                          getSeriesToneClassName(item.tone)
                        )}
                        style={{ height }}
                        aria-label={`${item.title} ${years[index]} ${item.values[index]} por ciento`}
                      />
                    </div>
                    <p className="text-xs font-semibold text-nutri-dark-grey/85">{years[index]}</p>
                    <p className="text-[11px] text-nutri-dark-grey/70">{item.values[index]}%</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
