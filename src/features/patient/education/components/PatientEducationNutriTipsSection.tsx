import { BookOpenCheck } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { getTagLabelById } from "../utils";
import type { PatientNutriTipVideo } from "../types";

type PatientEducationNutriTipsSectionProps = {
  videos: PatientNutriTipVideo[];
};

export function PatientEducationNutriTipsSection({
  videos,
}: PatientEducationNutriTipsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-nutri-primary">Nutri-Tips en Videos Cortos</h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Formato rápido estilo reels educativos para aplicar ideas en minutos.
        </p>
      </div>

      <Card className="p-5">
        <details open className="group space-y-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-nutri-primary">
            Mostrar/Ocultar videos
          </summary>

          {videos.length === 0 ? (
            <p className="text-sm text-nutri-dark-grey">
              No hay videos que coincidan con los filtros actuales.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {videos.map((video) => (
                <article
                  key={video.videoId}
                  className="nutri-platform-surface overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[9/14] bg-gradient-to-b from-nutri-secondary/20 via-nutri-off-white to-nutri-white p-3">
                    <p className="absolute right-3 top-3 rounded-full bg-nutri-primary px-2 py-1 text-[11px] font-semibold text-nutri-white">
                      {video.durationLabel}
                    </p>

                    <div className="flex h-full flex-col justify-between">
                      <div className="nutri-platform-surface-soft inline-flex h-10 w-10 items-center justify-center rounded-xl text-nutri-primary">
                        <BookOpenCheck size={18} aria-hidden />
                      </div>
                      <p className="text-sm font-semibold text-nutri-primary">{video.title}</p>
                    </div>
                  </div>

                  <div className="space-y-2 p-3">
                    <p className="text-xs text-nutri-dark-grey/80">{video.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {video.tags.map((tag) => (
                        <span
                          key={`${video.videoId}-${tag}`}
                          className="nutri-platform-surface-soft rounded-full px-2 py-0.5 text-[11px] font-semibold text-nutri-primary"
                        >
                          {getTagLabelById(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </details>
      </Card>
    </section>
  );
}
