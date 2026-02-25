export const PEDIATRIC_MIN_AGE_MONTHS = 6;
export const PEDIATRIC_MAX_AGE_MONTHS = 60;

export function calculateAgeInMonths(
  birthdate: string | Date,
  atDate?: string | Date
): number {
  const birth = new Date(birthdate);
  const current = atDate ? new Date(atDate) : new Date();

  let months =
    (current.getFullYear() - birth.getFullYear()) * 12 +
    (current.getMonth() - birth.getMonth());

  if (current.getDate() < birth.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

export function isTargetPediatricAge(months: number): boolean {
  return months >= PEDIATRIC_MIN_AGE_MONTHS && months <= PEDIATRIC_MAX_AGE_MONTHS;
}

export function formatPediatricAge(months: number): string {
  if (months < 12) return `${months} meses`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "año" : "años"}`;
  }

  return `${years} ${years === 1 ? "año" : "años"} ${remainingMonths} meses`;
}
