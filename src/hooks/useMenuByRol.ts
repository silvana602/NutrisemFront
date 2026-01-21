import { adminMenu, clinicianMenu, patientMenu } from "@/config/menus";
import { UserRole } from "@/types/user";
import type { MenuItem } from "@/config/menus";

const menusByRole: Record<UserRole, MenuItem[]> = {
  [UserRole.admin]: adminMenu,
  [UserRole.clinician]: clinicianMenu,
  [UserRole.patient]: patientMenu,
};

export function getMenuByRole(role: UserRole): MenuItem[] {
  const menu = menusByRole[role];
  if (!menu) throw new Error(`Rol desconocido: ${role}`);
  return menu;
}

