import { useAuthStore } from "@/store/useAuthStore";

/** Retorna el rol del usuario logueado (no reactivo) */
export const getCurrentUserRole = (): "admin" | "healthcare" | "patient" | null => {
  const user = useAuthStore.getState().user; // estado actual
  if (!user) return null;

  if (user.role === "admin") return "admin";
  if (user.role === "healthcare") return "healthcare";
  return "patient";
};

/** Helpers rápidos */
export const isAdmin = () => getCurrentUserRole() === "admin";
export const isHealthcare = () => getCurrentUserRole() === "healthcare";
export const isPatient = () => getCurrentUserRole() === "patient";
