"use client";

import { useRouter } from "next/navigation";

import {
  LandingCapabilitiesSection,
  LandingFinalCtaSection,
  LandingHeroSection,
  LandingTrendsSection,
  LandingWorkflowSection,
} from "@/features/landing/components";
import {
  LANDING_CAPABILITIES,
  LANDING_PULSE_METRICS,
  LANDING_TREND_SERIES,
  LANDING_TREND_YEARS,
  LANDING_WORKFLOW_STEPS,
} from "@/features/landing/utils";

export default function LandingPage() {
  const router = useRouter();

  const handleStartNow = () => {
    router.push("/login");
  };

  const handleExplore = () => {
    const section = document.getElementById("landing-capabilities");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-0 bg-nutri-off-white">
      <div className="container mx-auto space-y-8 px-4 py-8 sm:space-y-10 sm:py-12 md:space-y-12 md:py-16">
        <LandingHeroSection
          pulseMetrics={LANDING_PULSE_METRICS}
          onStartNow={handleStartNow}
          onExplore={handleExplore}
        />

        <LandingCapabilitiesSection capabilities={LANDING_CAPABILITIES} />

        <LandingTrendsSection years={LANDING_TREND_YEARS} series={LANDING_TREND_SERIES} />

        <LandingWorkflowSection steps={LANDING_WORKFLOW_STEPS} />

        <LandingFinalCtaSection onStartNow={handleStartNow} />
      </div>
    </div>
  );
}
