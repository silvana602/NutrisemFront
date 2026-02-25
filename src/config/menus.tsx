import React from "react";
import { UserRole } from "@/types/user";
import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileChartColumn,
  HeartPulse,
  LayoutDashboard,
  Notebook,
  Users,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  external?: boolean;
  matchExact?: boolean;
}

export const adminMenu: MenuItem[] = [
  {
    label: "Inicio",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    label: "Usuarios",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "Reportes",
    href: "/dashboard/admin/reports",
    icon: FileChartColumn,
  },
  {
    label: "Historiales",
    href: "/dashboard/admin/histories",
    icon: ClipboardList,
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

export function getMenuByRole(role: UserRole): MenuItem[] {
  switch (role) {
    case UserRole.admin:
      return adminMenu;
    case UserRole.clinician:
      return clinicianMenu;
    case UserRole.patient:
      return patientMenu;
    default:
      return [];
  }
}
