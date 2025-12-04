import { adminMenu, clinicianMenu, pacienteMenu } from "@/config/menus";
import { Role } from "@/types/user";

export function useMenuByRole(role: Role) {
  if (role === "admin") return adminMenu;
  if (role === "clinician") return clinicianMenu;
  return pacienteMenu; // default PACIENTE
}
