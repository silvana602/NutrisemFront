"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { db, seedOnce } from "@/mocks/db";
import { calculateAgeInMonths } from "@/lib/pediatricAge";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PatientEducationArticleLibrary,
  PatientEducationGuideBanner,
  PatientEducationHero,
  PatientEducationNutriTipsSection,
  PatientEducationSearchPanel,
} from "@/features/patient/education/components";
import {
  countVisibleArticles,
  filterEducationCategories,
  filterNutriTipVideos,
  PATIENT_EDUCATION_CATEGORIES,
  PATIENT_EDUCATION_TAGS,
  PATIENT_NUTRI_TIPS_VIDEOS,
  parsePatientEducationTagId,
  resolveGuideOfMonthByAge,
} from "@/features/patient/education/utils";
import type { PatientEducationTagId } from "@/features/patient/education/types";

seedOnce();

export default function PatientEducationPage() {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const queryParam = (searchParams.get("q") ?? "").trim();
  const tagParam = parsePatientEducationTagId(searchParams.get("tag"));
  const focusSectionId = (searchParams.get("focusSection") ?? "").trim();
  const focusedArticleId = (searchParams.get("focusArticle") ?? "").trim();
  const [query, setQuery] = useState(queryParam);
  const [selectedTagId, setSelectedTagId] = useState<PatientEducationTagId | null>(tagParam);
  const autoScrolledRef = useRef(false);

  const patient = useMemo(() => {
    if (!user) return null;
    return db.patients.find((item) => item.userId === user.userId) ?? null;
  }, [user]);

  const ageMonths = patient ? calculateAgeInMonths(patient.birthDate) : null;
  const guideOfMonth = useMemo(() => resolveGuideOfMonthByAge(ageMonths), [ageMonths]);

  const filteredCategories = useMemo(
    () =>
      filterEducationCategories(PATIENT_EDUCATION_CATEGORIES, {
        query,
        selectedTagId,
      }),
    [query, selectedTagId]
  );

  const filteredVideos = useMemo(
    () =>
      filterNutriTipVideos(PATIENT_NUTRI_TIPS_VIDEOS, {
        query,
        selectedTagId,
      }),
    [query, selectedTagId]
  );

  const visibleArticles = useMemo(
    () => countVisibleArticles(filteredCategories),
    [filteredCategories]
  );

  const handleToggleTag = (tagId: PatientEducationTagId) => {
    setSelectedTagId((currentTagId) => (currentTagId === tagId ? null : tagId));
  };

  const handleClearFilters = () => {
    setQuery("");
    setSelectedTagId(null);
  };

  const handleReadGuideNow = () => {
    const targetSection = document.getElementById("biblioteca-educativa");
    if (!targetSection) return;
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (autoScrolledRef.current) return;

    const hashTargetId =
      typeof window !== "undefined" ? window.location.hash.replace("#", "").trim() : "";
    const targetElement =
      (focusedArticleId ? document.getElementById(focusedArticleId) : null) ??
      (hashTargetId ? document.getElementById(hashTargetId) : null) ??
      (focusSectionId ? document.getElementById(focusSectionId) : null);

    if (!targetElement) return;

    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    autoScrolledRef.current = true;
  }, [focusedArticleId, focusSectionId, filteredCategories]);

  if (!user) return null;

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <PatientEducationHero firstName={user.firstName} />

      <PatientEducationSearchPanel
        query={query}
        selectedTagId={selectedTagId}
        tags={PATIENT_EDUCATION_TAGS}
        visibleArticles={visibleArticles}
        visibleVideos={filteredVideos.length}
        onQueryChange={setQuery}
        onToggleTag={handleToggleTag}
        onClearFilters={handleClearFilters}
      />

      <PatientEducationGuideBanner guide={guideOfMonth} onReadNow={handleReadGuideNow} />

      <PatientEducationArticleLibrary
        categories={filteredCategories}
        focusedArticleId={focusedArticleId || null}
      />

      <PatientEducationNutriTipsSection videos={filteredVideos} />
    </div>
  );
}
