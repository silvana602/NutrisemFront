export type PatientEducationTagId = "lactancia" | "recetas" | "vitaminas" | "sueno";

export type PatientEducationTag = {
  id: PatientEducationTagId;
  label: string;
};

export type PatientEducationGuideAgeGroup = "complementary" | "early-childhood" | "general";

export type PatientEducationGuide = {
  ageGroup: PatientEducationGuideAgeGroup;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageTitle: string;
  imageCaption: string;
};

export type PatientEducationArticle = {
  articleId: string;
  title: string;
  summary: string;
  tags: PatientEducationTagId[];
  readMinutes: number;
};

export type PatientEducationCategoryIcon = "food" | "development" | "prevention";

export type PatientEducationCategory = {
  categoryId: string;
  title: string;
  icon: PatientEducationCategoryIcon;
  articles: PatientEducationArticle[];
};

export type PatientNutriTipVideo = {
  videoId: string;
  title: string;
  description: string;
  durationLabel: string;
  tags: PatientEducationTagId[];
};
