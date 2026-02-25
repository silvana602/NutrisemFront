import { UserRole } from "@/types/user";
import type {
  IdiomaInterfaz,
  ModoVisual,
  RoleSettingsCopy,
} from "../types/settings.types";

export const MODO_VISUAL_OPTIONS: ReadonlyArray<{ value: ModoVisual; label: string }> = [
  { value: "claro", label: "Modo claro" },
  { value: "oscuro", label: "Modo oscuro" },
  { value: "sistema", label: "Seguir sistema" },
];

export const IDIOMA_OPTIONS: ReadonlyArray<{ value: IdiomaInterfaz; label: string }> = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
];

export function getRoleSettingsCopy(role: UserRole): RoleSettingsCopy {
  if (role === UserRole.admin) {
    return {
      ceja: "Panel de administración",
      titulo: "Configuración de la cuenta",
      descripcion:
        "Gestiona tus datos personales, preferencias de interfaz y opciones de soporte desde un solo lugar.",
    };
  }

  if (role === UserRole.clinician) {
    return {
      ceja: "Panel clínico",
      titulo: "Configuración profesional",
      descripcion:
        "Actualiza tu perfil de atención, ajusta la interfaz de trabajo y revisa opciones de soporte y seguridad.",
    };
  }

  return {
    ceja: "Panel del paciente",
    titulo: "Configuración personal",
    descripcion:
      "Personaliza tu perfil, ajusta la interfaz y consulta la información legal de la plataforma.",
  };
}
