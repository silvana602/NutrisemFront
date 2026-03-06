import { UserRole } from "@/types/user";

export type ModoVisual = "claro" | "oscuro" | "sistema";
export type IdiomaInterfaz = "es" | "en";

export type ProfileFormData = {
  nombreCompleto: string;
  fotoPerfil: string | null;
};

export type ProfileFormErrors = Partial<Record<keyof ProfileFormData, string>>;

export type PasswordFormData = {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarNuevaContrasena: string;
};

export type PasswordFormErrors = Partial<Record<keyof PasswordFormData, string>>;

export type InterfacePreferences = {
  modoVisual: ModoVisual;
  idioma: IdiomaInterfaz;
};

export type ClinicianAssetField = "firmaDigitalMedico" | "selloMedico";

export type ClinicianAssetsSettings = {
  firmaDigitalMedico: string | null;
  selloMedico: string | null;
};

export type ClinicianAssetsErrors = Partial<Record<ClinicianAssetField, string>>;

export type TutorLegalData = {
  nombreTutor: string;
  cedulaTutor: string;
  parentescoTutor: string;
  telefonoTutor: string;
  direccionTutor: string;
};

export type TutorLegalDataErrors = Partial<Record<keyof TutorLegalData, string>>;

export type UserSettingsStorage = {
  fotoPerfil: string | null;
  preferencias: InterfacePreferences;
  firmaDigitalMedico: string | null;
  selloMedico: string | null;
  datosTutor: TutorLegalData;
};

export type RoleSettingsCopy = {
  ceja: string;
  titulo: string;
  descripcion: string;
};

export type SettingsPageProps = {
  role: UserRole;
};
