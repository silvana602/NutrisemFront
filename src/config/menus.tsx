import React from "react";
import { Role } from "@/types/user";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  BookOpen,
  FileChartColumn,
  ClipboardList,
  Activity,
  BarChart3,
  Notebook,
  HeartPulse
} from "lucide-react";

/**
 * Tipos
 */

export interface MenuItem {
  label: string;
  href: string;
  // guardamos el componente del icono (no la instancia JSX)
  icon: React.ElementType;
  badge?: string | number;
  external?: boolean;
}

/**
 * Menús por rol
 * Nota: icon es el componente; se renderiza como <item.icon />
 */
export const adminMenu: MenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Médicos", href: "/admin/clinicians", icon: Stethoscope },
  { label: "Reportes", href: "/admin/reportes", icon: FileChartColumn },
  { label: "Historiales", href: "/admin/historiales", icon: ClipboardList },
];

export const clinicianMenu: MenuItem[] = [
  { label: "Inicio", href: "/dashboard/clinician", icon: LayoutDashboard },
  { label: "Mis Pacientes", href: "/clinician/pacientes", icon: BookOpen },
  { label: "Consultas", href: "/clinician/consultas", icon: Notebook },
  { label: "Diagnósticos", href: "/clinician/diagnosticos", icon: Activity },
  { label: "Reportes", href: "/clinician/reportes", icon: BarChart3 },
];

export const pacienteMenu: MenuItem[] = [
  { label: "Inicio", href: "/dashboard/paciente", icon: LayoutDashboard },
  { label: "Mi Progreso", href: "/paciente/progreso", icon: HeartPulse },
  { label: "Mis Diagnósticos", href: "/paciente/diagnosticos", icon: Activity },
  { label: "Recomendaciones", href: "/paciente/recomendaciones", icon: ClipboardList },
];

export function getMenuByRole(role: Role) {
  if (role === "admin") return adminMenu;
  if (role === "clinician") return clinicianMenu;
  return pacienteMenu;
}
