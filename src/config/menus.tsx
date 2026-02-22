import React from "react";
import { UserRole } from "@/types/user";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileChartColumn,
  ClipboardList,
  Activity,
  BarChart3,
  Notebook,
  HeartPulse,
} from "lucide-react";

/* ======================================================
    TIPOS
   ====================================================== */

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  external?: boolean;
  matchExact?: boolean;
}

/* ======================================================
    MENÚ ADMIN
   ====================================================== */

export const adminMenu: MenuItem[] = [
  {
    label: "Dashboard",
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

/* ======================================================
    MENÚ CLINICIAN
   ====================================================== */

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

/* ======================================================
    MENÚ PATIENT
   ====================================================== */

export const patientMenu: MenuItem[] = [
  {
    label: "Inicio",
    href: "/dashboard/patient",
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    label: "Educacion",
    href: "/dashboard/patient/education",
    icon: BookOpen,
  },
  {
    label: "Mi Progreso",
    href: "/dashboard/patient/progress",
    icon: HeartPulse,
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
];

/* ======================================================
    SELECTOR DE MENÚ POR ROL
   ====================================================== */

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
