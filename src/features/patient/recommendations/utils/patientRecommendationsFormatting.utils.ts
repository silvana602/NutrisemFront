import type { Food } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
});

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatDate(value: Date | null): string {
  if (!value) return "Sin fecha";
  if (Number.isNaN(value.getTime())) return "Sin fecha";
  return dateFormatter.format(value);
}

export function formatCategoryLabel(category: string): string {
  const normalized = normalizeText(category);
  if (normalized.includes("fruit")) return "Fruta";
  if (normalized.includes("vegetable")) return "Verdura";
  if (normalized.includes("protein")) return "Proteina";
  if (normalized.includes("grain")) return "Cereal";
  if (normalized.includes("dairy")) return "Lacteo";
  return category || "Sin categoria";
}

export function translatePortionText(rawPortion: string): string {
  const value = rawPortion.trim();
  if (!value) return "Porcion sugerida según tolerancia y edad";

  return value
    .replace(/pieces?/gi, "piezas")
    .replace(/servings?/gi, "porciones")
    .replace(/cups?/gi, "tazas")
    .replace(/spoons?/gi, "cucharadas")
    .replace(/units?/gi, "unidades")
    .replace(/per day/gi, "por dia")
    .replace(/daily/gi, "diario");
}

export function inferTimesPerDay(rawPortion: string): string {
  const normalized = normalizeText(rawPortion);
  const explicitMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(veces|x)\s*(al|por)?\s*dia/);
  if (explicitMatch) {
    return `${explicitMatch[1].replace(",", ".")} veces/dia`;
  }

  if (normalized.includes("cada comida")) return "3 veces/dia";
  if (normalized.includes("cada colacion")) return "2 veces/dia";
  if (/\d/.test(normalized)) return "1 vez/dia";

  return "1 vez/dia";
}

export function deriveFoodBenefits(food: Food, translatedCategory: string): string {
  const benefits: string[] = [];

  if (food.proteinG >= 5) {
    benefits.push("apoya el crecimiento y desarrollo muscular");
  }
  if (food.fiberG >= 2) {
    benefits.push("mejora la digestion y salud intestinal");
  }

  const vitamins = normalizeText(food.vitamins || "");
  const minerals = normalizeText(food.minerals || "");

  if (vitamins.includes("c") || vitamins.includes("a")) {
    benefits.push("fortalece defensas y salud visual");
  }
  if (minerals.includes("fe") || minerals.includes("iron")) {
    benefits.push("favorece energia y prevencion de anemia");
  }
  if (minerals.includes("k") || minerals.includes("ca")) {
    benefits.push("contribuye a huesos fuertes");
  }

  if (benefits.length > 0) {
    return benefits.slice(0, 2).join("; ");
  }

  if (translatedCategory === "Fruta") {
    return "aporta vitaminas y antioxidantes naturales";
  }
  if (translatedCategory === "Verdura") {
    return "aporta fibra y micronutrientes para crecimiento saludable";
  }
  if (translatedCategory === "Proteina") {
    return "favorece formacion de tejidos y recuperacion";
  }
  if (translatedCategory === "Lacteo") {
    return "aporta calcio y proteina para desarrollo oseo";
  }

  return "aporta nutrientes utiles para su plan alimentario";
}
