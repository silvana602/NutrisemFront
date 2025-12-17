// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases condicionales de forma limpia usando clsx + tailwind-merge.
 * Ejemplo:
 *   cn("px-4", isActive && "bg-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(
  birthdate: string | Date, 
  atDate?: string | Date
): number {
  const birth = new Date(birthdate);
  const today = atDate ? new Date(atDate) : new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  // Restamos 1 si aún no ha cumplido años en el año de referencia
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

