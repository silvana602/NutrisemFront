export type AntecedentFoodFrequency =
  | "DIARIO"
  | "3-4 VECES/SEMANA"
  | "1-2 VECES/SEMANA"
  | "RARA VEZ / NUNCA";

export type AntecedentFoodGroupId =
  | "cerealsTubers"
  | "fruits"
  | "vegetables"
  | "dairy"
  | "meatsProteins"
  | "legumes"
  | "ultraProcessed"
  | "eggs"
  | "fishSeafood"
  | "water"
  | "sugaryDrinks"
  | "fastFoodFried";

export type AntecedentMealSlotId =
  | "breakfast"
  | "midMorningSnack"
  | "lunch"
  | "afternoonSnack"
  | "dinner"
  | "nightSnack";

export type AntecedentRecallSlotId = "breakfast" | "lunch" | "dinner" | "snacks";

export type AntecedentMealsPerDay = "1-2" | "3" | "4 O MAS";

export type AntecedentAppetiteLevel = "BAJO" | "NORMAL" | "ALTO";

export type AntecedentYesNo = "SI" | "NO";

export type AntecedentVaccinationStatus =
  | "COMPLETO"
  | "INCOMPLETO"
  | "DESCONOCIDO";

export type AntecedentPrimaryCaregiver =
  | "MADRE"
  | "PADRE"
  | "ABUELOS"
  | "OTRO FAMILIAR"
  | "CUIDADOR";

export type AntecedentSleepQuality =
  | "BUENA (DESCANSA BIEN, SIN DESPERTARES FRECUENTES)"
  | "REGULAR (SE DESPIERTA VARIAS VECES)"
  | "MALA (DIFICULTAD PARA DORMIR O SUENO INTERRUMPIDO)";

type LegacyOrMultiValue = string | string[];

export interface Antecedents {
  antecedentsId: string;
  consultationId: string;

  // Alimentacion
  breastfeeding?: string;
  bottleFeeding?: string;
  feedingFrequency?: string;
  complementaryFeedingStartMonths?: number;
  foodFrequencyByGroup?: Partial<
    Record<AntecedentFoodGroupId, AntecedentFoodFrequency>
  >;
  mealsPerDay?: AntecedentMealsPerDay | string;
  mealSchedule?: Partial<Record<AntecedentMealSlotId, string>>;
  habitualSchedule?: string;
  recall24h?: Partial<Record<AntecedentRecallSlotId, string>>;
  addedSugarSalt?: AntecedentYesNo | string;
  addedSugarSaltFrequency?: string;
  appetiteLevel?: AntecedentAppetiteLevel | string;
  waterGlassesPerDay?: number;
  foodAllergiesOrIntolerances?: string;

  // Salud y antecedentes
  currentSupplementation?: string[];
  currentSupplementationOther?: string;
  dewormingLastDate?: string;
  currentMedications?: string;
  recentIllnesses?: LegacyOrMultiValue;
  recentIllnessesOther?: string;
  vaccinationStatus?: AntecedentVaccinationStatus | string;

  // Determinantes sociales
  safeWaterAccess?: AntecedentYesNo | string;
  basicSanitation?: AntecedentYesNo | string;
  foodInsecurityConcern?: AntecedentYesNo | string;
  foodInsecurityMealSkip?: AntecedentYesNo | string;
  primaryCaregiver?: AntecedentPrimaryCaregiver | string;
  daycareAttendance?: AntecedentYesNo | string;

  // Sueno
  sleepAverageHours?: number;
  sleepQuality?: AntecedentSleepQuality | string;
  bedtime?: string;
  wakeupTime?: string;

  // Campos legacy
  complementaryFeedingStart?: string;
  consumedFoods?: string;
  dailyFoodQuantity?: string;
  averageSleepHours?: number;
  sleepRoutine?: string;
  observations?: string;
}
