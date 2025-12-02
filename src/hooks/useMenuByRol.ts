import { adminMenu, medicoMenu, pacienteMenu, Role } from "@/config/menus";

export function useMenuByRole(role: Role) {
  if (role === "ADMIN") return adminMenu;
  if (role === "MEDICO") return medicoMenu;
  return pacienteMenu; // default PACIENTE
}
