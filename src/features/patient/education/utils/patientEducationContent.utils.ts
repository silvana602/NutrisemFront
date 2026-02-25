import type {
  PatientEducationCategory,
  PatientEducationGuide,
  PatientEducationTag,
  PatientEducationTagId,
  PatientNutriTipVideo,
} from "../types";

export const PATIENT_EDUCATION_TAGS: PatientEducationTag[] = [
  { id: "lactancia", label: "#Lactancia" },
  { id: "recetas", label: "#Recetas" },
  { id: "vitaminas", label: "#Vitaminas" },
  { id: "sueno", label: "#Sueno" },
];

export const PATIENT_EDUCATION_CATEGORIES: PatientEducationCategory[] = [
  {
    categoryId: "healthy-eating",
    title: "Alimentacion Saludable",
    icon: "food",
    articles: [
      {
        articleId: "rainbow-plate",
        title: "El plato arcoiris: Por que variar los colores?",
        summary:
          "Aprende como introducir verduras y combinar colores para ampliar micronutrientes como hierro.",
        tags: ["recetas", "vitaminas"],
        readMinutes: 4,
      },
      {
        articleId: "natural-sugar-substitutes",
        title: "Sustitutos naturales del azucar para ninos",
        summary: "Opciones practicas para reducir azucares anadidos sin perder sabor en casa.",
        tags: ["recetas", "vitaminas"],
        readMinutes: 5,
      },
    ],
  },
  {
    categoryId: "growth-development",
    title: "Crecimiento y Desarrollo",
    icon: "development",
    articles: [
      {
        articleId: "development-milestones-3yo",
        title: "Hitos del desarrollo: Que debe hacer mi hijo a los 3 anos?",
        summary: "Senales esperadas en lenguaje, motricidad y autonomia para detectar avances.",
        tags: ["sueno", "lactancia"],
        readMinutes: 6,
      },
      {
        articleId: "play-motor-development",
        title: "La importancia del juego en el desarrollo motor",
        summary: "Ideas de juego activo para fortalecer coordinacion y confianza en cada etapa.",
        tags: ["sueno", "recetas"],
        readMinutes: 4,
      },
    ],
  },
  {
    categoryId: "preventive-health",
    title: "Salud Preventiva",
    icon: "prevention",
    articles: [
      {
        articleId: "oral-hygiene-first-tooth",
        title: "Higiene bucal desde el primer diente",
        summary:
          "Rutina sencilla para proteger encias y dientes desde los primeros meses de vida.",
        tags: ["lactancia", "vitaminas"],
        readMinutes: 3,
      },
      {
        articleId: "vaccination-calendar",
        title: "Calendario de vacunas: Todo lo que debes saber",
        summary: "Que vacunas corresponden por edad y como prepararte antes de cada control.",
        tags: ["vitaminas", "sueno"],
        readMinutes: 5,
      },
    ],
  },
];

export const PATIENT_NUTRI_TIPS_VIDEOS: PatientNutriTipVideo[] = [
  {
    videoId: "broccoli-3-ways",
    title: "3 formas de preparar brocoli",
    description: "Texturas y cocciones rapidas para aceptar mejor verduras en casa.",
    durationLabel: "01:20",
    tags: ["recetas", "vitaminas"],
  },
  {
    videoId: "protein-portion-hand",
    title: "Como medir la porcion de proteina con la mano",
    description: "Regla visual simple para ajustar porciones por edad sin balanza.",
    durationLabel: "00:55",
    tags: ["recetas", "lactancia"],
  },
  {
    videoId: "smart-lunchbox",
    title: "Lonchera equilibrada en 5 minutos",
    description: "Combinaciones practicas de fruta, proteina y cereal para media manana.",
    durationLabel: "01:10",
    tags: ["recetas", "vitaminas"],
  },
  {
    videoId: "sleep-dinner-routine",
    title: "Cena ligera para mejorar el sueno",
    description: "Orden de comidas y horarios para evitar despertares por hambre.",
    durationLabel: "01:05",
    tags: ["sueno", "recetas"],
  },
];

export function getTagLabelById(tagId: PatientEducationTagId): string {
  return PATIENT_EDUCATION_TAGS.find((tag) => tag.id === tagId)?.label ?? tagId;
}

export function parsePatientEducationTagId(value: string | null): PatientEducationTagId | null {
  if (!value) return null;
  return PATIENT_EDUCATION_TAGS.some((tag) => tag.id === value)
    ? (value as PatientEducationTagId)
    : null;
}

export function resolveGuideOfMonthByAge(ageMonths: number | null): PatientEducationGuide {
  if (ageMonths !== null && ageMonths >= 6 && ageMonths <= 12) {
    return {
      ageGroup: "complementary",
      title: "Guia completa de Alimentacion Complementaria: Pasando de la leche a los solidos",
      description:
        "Pasos seguros para introducir texturas, alergenos y nuevos sabores de forma progresiva.",
      ctaLabel: "Leer ahora",
      ctaHref: "#biblioteca-educativa",
      imageTitle: "6 a 12 meses",
      imageCaption: "Texturas suaves, porciones pequenas y variedad gradual.",
    };
  }

  if (ageMonths !== null && ageMonths >= 24 && ageMonths <= 60) {
    return {
      ageGroup: "early-childhood",
      title: "Como manejar los berrinches a la hora de la comida",
      description:
        "Estrategias practicas para mantener limites claros, reducir presion y construir habitos.",
      ctaLabel: "Leer ahora",
      ctaHref: "#biblioteca-educativa",
      imageTitle: "2 a 5 anos",
      imageCaption: "Rutinas, ejemplo familiar y juego para comer mejor.",
    };
  }

  return {
    ageGroup: "general",
    title: "Habitos familiares para una alimentacion saludable sostenible",
    description:
      "Claves para planificar comidas, hidratarse mejor y mantener consistencia durante la semana.",
    ctaLabel: "Leer ahora",
    ctaHref: "#biblioteca-educativa",
    imageTitle: "Guia general",
    imageCaption: "Pequenos cambios diarios que mantienen el progreso.",
  };
}
