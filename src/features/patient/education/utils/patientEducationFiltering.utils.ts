import type {
  PatientEducationCategory,
  PatientEducationTagId,
  PatientNutriTipVideo,
} from "../types";
import { getTagLabelById } from "./patientEducationContent.utils";

type FilterEducationContentParams = {
  query: string;
  selectedTagId: PatientEducationTagId | null;
};

function normalizeEducationText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function includesQuery(haystack: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return normalizeEducationText(haystack).includes(normalizedQuery);
}

function matchesTag(
  tags: PatientEducationTagId[],
  selectedTagId: PatientEducationTagId | null
): boolean {
  if (!selectedTagId) return true;
  return tags.includes(selectedTagId);
}

export function filterEducationCategories(
  categories: PatientEducationCategory[],
  params: FilterEducationContentParams
): PatientEducationCategory[] {
  const normalizedQuery = normalizeEducationText(params.query);

  return categories
    .map((category) => {
      const filteredArticles = category.articles.filter((article) => {
        const querySources = [
          article.title,
          article.summary,
          category.title,
          ...article.tags.map((tag) => getTagLabelById(tag)),
        ];
        const matchesQuery = querySources.some((source) => includesQuery(source, normalizedQuery));
        const tagMatch = matchesTag(article.tags, params.selectedTagId);

        return matchesQuery && tagMatch;
      });

      return {
        ...category,
        articles: filteredArticles,
      };
    })
    .filter((category) => category.articles.length > 0);
}

export function filterNutriTipVideos(
  videos: PatientNutriTipVideo[],
  params: FilterEducationContentParams
): PatientNutriTipVideo[] {
  const normalizedQuery = normalizeEducationText(params.query);

  return videos.filter((video) => {
    const querySources = [
      video.title,
      video.description,
      ...video.tags.map((tag) => getTagLabelById(tag)),
    ];
    const matchesQuery = querySources.some((source) => includesQuery(source, normalizedQuery));
    const tagMatch = matchesTag(video.tags, params.selectedTagId);

    return matchesQuery && tagMatch;
  });
}

export function countVisibleArticles(categories: PatientEducationCategory[]): number {
  return categories.reduce((total, category) => total + category.articles.length, 0);
}
