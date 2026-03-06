import { UserRole } from "@/types/user";

export type SupportManagedRole = UserRole.clinician | UserRole.patient;

export type SharedSupportShortcut = {
  role: SupportManagedRole;
  roleLabel: string;
  href: string;
  description: string;
};

export type AdminSupportTicket = {
  ticketId: string;
  role: SupportManagedRole;
  solicitante: string;
  asunto: string;
  fechaEtiqueta: string;
  estado: "Pendiente" | "En revisión" | "Resuelto";
};

export const SHARED_SUPPORT_EMAIL = "soporte@nutrisem.app";
export const SHARED_SUPPORT_MAILTO =
  "mailto:soporte@nutrisem.app?subject=Ayuda%20en%20Nutrisem";

export const SHARED_SUPPORT_TITLE = "Ayuda / Centro de soporte";
export const SHARED_SUPPORT_DESCRIPTION =
  "Contacta al equipo técnico para dudas funcionales o problemas de acceso.";

export const SHARED_LEGAL_TERMS_TITLE = "Términos y condiciones";
export const SHARED_LEGAL_TERMS_TEXT =
  "El uso de esta plataforma implica el manejo responsable y confidencial de datos sensibles de menores, conforme a normativa vigente.";

export const SHARED_SUPPORT_SHORTCUTS: SharedSupportShortcut[] = [
  {
    role: UserRole.clinician,
    roleLabel: "Médico",
    href: "/dashboard/clinician/settings",
    description:
      "Canal de soporte que usa el rol clínico desde su configuración de cuenta.",
  },
  {
    role: UserRole.patient,
    roleLabel: "Paciente / Padre",
    href: "/dashboard/patient/settings",
    description:
      "Canal de soporte disponible para cuentas familiares y pacientes.",
  },
];

export const ADMIN_SUPPORT_TICKETS: AdminSupportTicket[] = [
  {
    ticketId: "SUP-001",
    role: UserRole.clinician,
    solicitante: "Dr. Juan Méndez",
    asunto: "No puedo generar PDF de diagnóstico",
    fechaEtiqueta: "6 mar 2026, 10:40 a. m.",
    estado: "Pendiente",
  },
  {
    ticketId: "SUP-002",
    role: UserRole.patient,
    solicitante: "Rita Meneses",
    asunto: "No encuentro las recomendaciones de mi hijo",
    fechaEtiqueta: "6 mar 2026, 09:15 a. m.",
    estado: "En revisión",
  },
  {
    ticketId: "SUP-003",
    role: UserRole.clinician,
    solicitante: "Dra. Carla Paredes",
    asunto: "Error al actualizar contraseña",
    fechaEtiqueta: "5 mar 2026, 06:50 p. m.",
    estado: "Resuelto",
  },
];

export function getSupportRoleLabel(role: SupportManagedRole): string {
  if (role === UserRole.clinician) return "Médico";
  return "Paciente / Padre";
}
