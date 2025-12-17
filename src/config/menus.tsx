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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Médicos", href: "/admin/clinicians", icon: Stethoscope },
  { label: "Reportes", href: "/admin/reportes", icon: FileChartColumn },
  { label: "Historiales", href: "/admin/historiales", icon: ClipboardList },
];

export const clinicianMenu: MenuItem[] = [
  { label: "Inicio", href: "/dashboard/clinician", icon: LayoutDashboard },
  { label: "Mis Pacientes", href: "/dashboard/clinician/patients", icon: BookOpen },
  { label: "Consultas", href: "/dashboard/clinician/consultas", icon: Notebook },
  { label: "Diagnósticos", href: "/dashboard/clinician/diagnosticos", icon: Activity },
  { label: "Historiales y Reportes", href: "/dashboard/clinician/reports", icon: BarChart3 },
];

export const pacienteMenu: MenuItem[] = [
  { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mi Progreso", href: "/paciente/progreso", icon: HeartPulse },
  { label: "Mis Diagnósticos", href: "/paciente/diagnosticos", icon: Activity },
  { label: "Recomendaciones", href: "/paciente/recomendaciones", icon: ClipboardList },
];

export function getMenuByRole(role: Role) {
  if (role === "admin") return adminMenu;
  if (role === "clinician") return clinicianMenu;
  return pacienteMenu;
}
