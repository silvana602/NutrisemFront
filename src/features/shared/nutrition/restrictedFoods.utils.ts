import type { RestrictedFoodGroup, RestrictedFoodItem } from "./types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildUniqueItems(items: RestrictedFoodItem[]) {
  const map = new Map<string, RestrictedFoodItem>();

  items.forEach((item) => {
    const food = item.food.trim();
    const key = normalizeText(food);
    if (!key || map.has(key)) return;

    map.set(key, {
      food,
      healthySubstitute:
        item.healthySubstitute.trim() || "Sustituir por una opcion natural.",
    });
  });

  return Array.from(map.values());
}

function mergeCustomRestrictedItems(
  groups: RestrictedFoodGroup[],
  customRestrictedItems: RestrictedFoodItem[]
): RestrictedFoodGroup[] {
  const sanitizedCustomItems = buildUniqueItems(customRestrictedItems);
  if (!sanitizedCustomItems.length) return groups;

  const redGroupIndex = groups.findIndex((group) => group.tone === "red");
  if (redGroupIndex === -1) {
    return [
      {
        title: "Zona Roja (Evitar)",
        subtitle: "Restricciones configuradas desde administracion del sistema.",
        tone: "red",
        items: sanitizedCustomItems,
      },
      ...groups,
    ];
  }

  return groups.map((group, index) => {
    if (index !== redGroupIndex) return group;
    return {
      ...group,
      items: buildUniqueItems([...group.items, ...sanitizedCustomItems]),
    };
  });
}

export function buildRestrictedFoodGroupsByNutritionalStatus(
  nutritionalStatus: string,
  customRestrictedItems: RestrictedFoodItem[] = []
): RestrictedFoodGroup[] {
  const status = normalizeText(nutritionalStatus);

  if (status.includes("sobrepeso") || status.includes("obesidad")) {
    const groups: RestrictedFoodGroup[] = [
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
        subtitle: "Consumir maximo una vez por semana y en porciones pequeñas.",
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

    return mergeCustomRestrictedItems(groups, customRestrictedItems);
  }

  if (status.includes("desnutricion") || status.includes("riesgo")) {
    const groups: RestrictedFoodGroup[] = [
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

    return mergeCustomRestrictedItems(groups, customRestrictedItems);
  }

  const groups: RestrictedFoodGroup[] = [
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
          healthySubstitute: "Jugo natural sin azucar añadida.",
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

  return mergeCustomRestrictedItems(groups, customRestrictedItems);
}
