import React from "react";
import { UserRole } from "@/types/user";
import {
  isMenuHrefVisibleForRole,
  readRoleVisibilitySettings,
} from "@/features/settings/utils/roleVisibility.utils";
import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  HeartPulse,
  LifeBuoy,
  LayoutDashboard,
  Notebook,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";

export type MenuSubItem = {
  label: string;
  href: string;
  badge?: string | number;
  matchExact?: boolean;
};

export type MenuItem = MenuSubItem & {
  icon: React.ElementType;
  external?: boolean;
  children?: MenuSubItem[];
};

export const adminMenu: MenuItem[] = [
  {
    label: "Panel de control",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    label: "Gestión de usuarios",
    href: "/dashboard/admin/users",
    icon: Users,
    children: [
      {
        label: "Médicos",
        href: "/dashboard/admin/users/medicos",
      },
      {
        label: "Pacientes",
        href: "/dashboard/admin/users/pacientes",
      },
    ],
  },
  {
    label: "Configuración del sistema",
    href: "/dashboard/admin/settings",
    icon: Settings2,
  },
  {
    label: "Seguridad y auditoría",
    href: "/dashboard/admin/security-audit",
    icon: ShieldCheck,
  },
  {
    label: "Soporte técnico",
    href: "/dashboard/admin/support",
    icon: LifeBuoy,
  },
];

export const clinicianMenu: MenuItem[] = [
  {
    label: "Inicio",
    href: "/dashboard/clinician",
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    label: "Mis Pacientes",
    href: "/dashboard/clinician/patients",
    icon: BookOpen,
  },
  {
    label: "Nueva Consulta",
    href: "/dashboard/clinician/consultation",
    icon: Notebook,
  },
  {
    label: "Diagnósticos",
    href: "/dashboard/clinician/diagnosis",
    icon: Activity,
  },
  {
    label: "Reportes",
    href: "/dashboard/clinician/reports",
    icon: BarChart3,
  },
];

export const patientMenu: MenuItem[] = [
  {
    label: "Inicio",
    href: "/dashboard/patient",
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    label: "Diagnósticos",
    href: "/dashboard/patient/diagnosis",
    icon: Activity,
  },
  {
    label: "Recomendaciones",
    href: "/dashboard/patient/recommendations",
    icon: ClipboardList,
  },
  {
    label: "Mi Progreso",
    href: "/dashboard/patient/progress",
    icon: HeartPulse,
  },
  {
    label: "Educación",
    href: "/dashboard/patient/education",
    icon: BookOpen,
  },
];

function applyRoleVisibility(role: UserRole, menu: MenuItem[]): MenuItem[] {
  const visibilitySettings = readRoleVisibilitySettings();

  return menu
    .filter((item) => isMenuHrefVisibleForRole(role, item.href, visibilitySettings))
    .map((item) => {
      if (!item.children?.length) return item;

      const visibleChildren = item.children.filter((child) =>
        isMenuHrefVisibleForRole(role, child.href, visibilitySettings)
      );

      if (visibleChildren.length === item.children.length) return item;
      return { ...item, children: visibleChildren };
    });
}

export function getMenuByRole(role: UserRole): MenuItem[] {
  switch (role) {
    case UserRole.admin:
      return applyRoleVisibility(role, adminMenu);
    case UserRole.clinician:
      return applyRoleVisibility(role, clinicianMenu);
    case UserRole.patient:
      return applyRoleVisibility(role, patientMenu);
    default:
      return [];
  }
}
