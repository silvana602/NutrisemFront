import type { RestrictedFoodGroup } from "./types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueItems(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

export function buildRestrictedFoodGroupsByNutritionalStatus(
  nutritionalStatus: string
): RestrictedFoodGroup[] {
  const status = normalizeText(nutritionalStatus);

  if (status.includes("sobrepeso") || status.includes("obesidad")) {
    return [
      {
        title: "No consumir en absoluto",
        subtitle: "Prioridad alta para proteger el plan nutricional.",
        tone: "red",
        items: uniqueItems([
          "Bebidas azucaradas (gaseosas, refrescos, jugos envasados).",
          "Golosinas y caramelos de consumo diario.",
          "Snacks ultraprocesados con alto sodio y grasas trans.",
          "Comida rapida frita de forma habitual.",
        ]),
      },
      {
        title: "Reducir consumo",
        subtitle: "Consumir solo de forma ocasional y en porciones pequenas.",
        tone: "amber",
        items: uniqueItems([
          "Harinas refinadas (pan blanco, masitas, galletas dulces).",
          "Postres y azucares anadidos.",
          "Embutidos y productos muy salados.",
          "Porciones altas de frituras caseras.",
        ]),
      },
    ];
  }

  if (status.includes("desnutricion") || status.includes("riesgo")) {
    return [
      {
        title: "No consumir en absoluto",
        subtitle: "Evitar alimentos que desplazan opciones nutritivas.",
        tone: "red",
        items: uniqueItems([
          "Bebidas azucaradas y gaseosas.",
          "Snacks ultraprocesados sin aporte nutricional.",
          "Golosinas como reemplazo de comidas principales.",
          "Alimentos con grasas trans.",
        ]),
      },
      {
        title: "Reducir consumo",
        subtitle: "Mantener baja frecuencia para mejorar densidad nutricional.",
        tone: "amber",
        items: uniqueItems([
          "Frituras frecuentes.",
          "Productos de panaderia con exceso de azucar.",
          "Bebidas con cafeina.",
          "Salsas comerciales altas en sodio.",
        ]),
      },
    ];
  }

  return [
    {
      title: "No consumir en absoluto",
      subtitle: "Restricciones base para cuidado preventivo.",
      tone: "red",
      items: uniqueItems([
        "Bebidas alcoholicas.",
        "Bebidas energeticas.",
        "Snacks ultraprocesados con grasas trans.",
      ]),
    },
    {
      title: "Reducir consumo",
      subtitle: "Limitar para mantener el equilibrio nutricional.",
      tone: "amber",
      items: uniqueItems([
        "Azucares anadidos.",
        "Frituras y comida rapida.",
        "Embutidos y productos con alto sodio.",
      ]),
    },
  ];
}
