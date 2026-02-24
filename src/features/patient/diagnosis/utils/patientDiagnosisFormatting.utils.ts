const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
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

export function formatDateTime(value: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "Sin fecha";
  return dateTimeFormatter.format(value);
}

export function formatMetric(
  value: number | null | undefined,
  unit: string,
  decimals = 2
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Sin dato";
  const rounded = value.toFixed(decimals);
  return unit ? `${rounded} ${unit}` : rounded;
}

export function buildQuickReason(
  note: string | null | undefined,
  fallback = "Control nutricional"
): string {
  const raw = (note ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return fallback;

  const firstSentence =
    raw
      .split(".")
      .map((item) => item.trim())
      .find((item) => item.length > 0) ?? raw;

  if (firstSentence.length <= 64) return firstSentence;
  return `${firstSentence.slice(0, 61).trimEnd()}...`;
}

export function inferConsultationNumberFromId(consultationId: string): string | null {
  const explicitConsultationMatch = consultationId.match(/^con_(\d+)$/i);
  if (explicitConsultationMatch) return explicitConsultationMatch[1];

  if (consultationId.startsWith("snapshot-")) return null;

  const trailingDigitsMatch = consultationId.match(/(\d+)$/);
  return trailingDigitsMatch ? trailingDigitsMatch[1] : null;
}

export function toSafeFileToken(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "SinDato";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
