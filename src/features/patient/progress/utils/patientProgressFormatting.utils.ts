const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
});

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatDate(value: Date | null | undefined): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "Sin fecha";
  return dateFormatter.format(value);
}

export function formatDateKey(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatMetricValue(value: number, unit: "kg" | "cm"): string {
  if (unit === "kg") return `${value.toFixed(1)} kg`;
  return `${value.toFixed(1)} cm`;
}

export function formatWeightDeltaAsGrams(deltaKg: number): string {
  const grams = Math.round(deltaKg * 1000);
  const sign = grams > 0 ? "+" : "";
  return `${sign}${grams}g`;
}

export function formatSignedCentimeters(deltaCm: number): string {
  const sign = deltaCm > 0 ? "+" : "";
  return `${sign}${deltaCm.toFixed(1)} cm`;
}
