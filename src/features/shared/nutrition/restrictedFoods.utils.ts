import type { RestrictedFoodGroup } from "./types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildUniqueItems(items: Array<{ food: string; healthySubstitute: string }>) {
  const map = new Map<string, { food: string; healthySubstitute: string }>();

  items.forEach((item) => {
    const key = item.food.trim().toLowerCase();
    if (!key || map.has(key)) return;
    map.set(key, {
      food: item.food.trim(),
      healthySubstitute: item.healthySubstitute.trim(),
    });
  });

  return Array.from(map.values());
}

export function buildRestrictedFoodGroupsByNutritionalStatus(
  nutritionalStatus: string
): RestrictedFoodGroup[] {
  const status = normalizeText(nutritionalStatus);

  if (status.includes("sobrepeso") || status.includes("obesidad")) {
    return [
      {
        title: "Zona Roja (Evitar)",
        subtitle: "Prioridad alta para proteger el plan nutricional.",
        tone: "red",
        items: buildUniqueItems([
          {
            food: "Bebidas azucaradas (gaseosas, refrescos, jugos envasados).",
            healthySubstitute: "Agua con rodajas de fruta natural.",
          },
          {
            food: "Golosinas y caramelos de consumo diario.",
            healthySubstitute: "Fruta fresca en porcion pequena.",
          },
          {
            food: "Snacks ultraprocesados con alto sodio y grasas trans.",
            healthySubstitute: "Palitos de zanahoria con yogurt natural.",
          },
          {
            food: "Comida rapida frita de forma habitual.",
            healthySubstitute: "Preparaciones al horno con vegetales.",
          },
        ]),
      },
      {
        title: "Zona Amarilla (Ocasional)",
        subtitle: "Consumir maximo una vez por semana y en porciones pequenas.",
        tone: "amber",
        items: buildUniqueItems([
          {
            food: "Harinas refinadas (pan blanco, masitas, galletas dulces).",
            healthySubstitute: "Pan integral o avena cocida.",
          },
          {
            food: "Postres y azucares anadidos.",
            healthySubstitute: "Yogurt natural con fruta picada.",
          },
          {
            food: "Embutidos y productos muy salados.",
            healthySubstitute: "Pollo cocido o huevo sancochado.",
          },
          {
            food: "Porciones altas de frituras caseras.",
            healthySubstitute: "Papas cocidas u horneadas.",
          },
        ]),
      },
    ];
  }

  if (status.includes("desnutricion") || status.includes("riesgo")) {
    return [
      {
        title: "Zona Roja (Evitar)",
        subtitle: "Evitar alimentos que desplazan opciones nutritivas.",
        tone: "red",
        items: buildUniqueItems([
          {
            food: "Bebidas azucaradas y gaseosas.",
            healthySubstitute: "Leche o agua segura.",
          },
          {
            food: "Snacks ultraprocesados sin aporte nutricional.",
            healthySubstitute: "Fruta con mani triturado.",
          },
          {
            food: "Golosinas como reemplazo de comidas principales.",
            healthySubstitute: "Colaciones de fruta y cereal.",
          },
          {
            food: "Alimentos con grasas trans.",
            healthySubstitute: "Aceites vegetales en baja cantidad.",
          },
        ]),
      },
      {
        title: "Zona Amarilla (Ocasional)",
        subtitle: "Consumir maximo una vez por semana para priorizar alimentos nutritivos.",
        tone: "amber",
        items: buildUniqueItems([
          {
            food: "Frituras frecuentes.",
            healthySubstitute: "Preparaciones al vapor o al horno.",
          },
          {
            food: "Productos de panaderia con exceso de azucar.",
            healthySubstitute: "Pan integral con queso fresco.",
          },
          {
            food: "Bebidas con cafeina.",
            healthySubstitute: "Infusiones suaves sin azucar.",
          },
          {
            food: "Salsas comerciales altas en sodio.",
            healthySubstitute: "Salsa casera de tomate natural.",
          },
        ]),
      },
    ];
  }

  return [
    {
      title: "Zona Roja (Evitar)",
      subtitle: "Restricciones base para cuidado preventivo.",
      tone: "red",
      items: buildUniqueItems([
        {
          food: "Bebidas alcoholicas.",
          healthySubstitute: "Agua natural o agua saborizada casera.",
        },
        {
          food: "Bebidas energeticas.",
          healthySubstitute: "Jugo natural sin azucar anadida.",
        },
        {
          food: "Snacks ultraprocesados con grasas trans.",
          healthySubstitute: "Frutos secos en porcion controlada.",
        },
      ]),
    },
    {
      title: "Zona Amarilla (Ocasional)",
      subtitle: "Consumir maximo una vez por semana para mantener el equilibrio nutricional.",
      tone: "amber",
      items: buildUniqueItems([
        {
          food: "Azucares anadidos.",
          healthySubstitute: "Fruta madura triturada para endulzar.",
        },
        {
          food: "Frituras y comida rapida.",
          healthySubstitute: "Versiones caseras al horno.",
        },
        {
          food: "Embutidos y productos con alto sodio.",
          healthySubstitute: "Carnes frescas cocidas en casa.",
        },
      ]),
    },
  ];
}
