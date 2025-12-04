import { useAuthStore } from "@/store/useAuthStore";

/** Retorna el rol del usuario logueado (no reactivo) */
export const getCurrentUserRole = (): "admin" | "clinician" | "patient" | null => {
  const user = useAuthStore.getState().user; // estado actual
  if (!user) return null;

  if (user.role === "admin") return "admin";
  if (user.role === "clinician") return "clinician";
  return "patient";
};

/** Helpers rápidos */
export const isAdmin = () => getCurrentUserRole() === "admin";
export const isclinician = () => getCurrentUserRole() === "clinician";
export const isPatient = () => getCurrentUserRole() === "patient";
