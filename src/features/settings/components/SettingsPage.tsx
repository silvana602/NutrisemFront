"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { db, seedOnce } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutClient } from "@/lib/auth/client";
import { UserRole } from "@/types/user";
import { ProfileSettingsSection } from "./ProfileSettingsSection";
import { InterfacePreferencesSection } from "./InterfacePreferencesSection";
import { SupportAndLegalSection } from "./SupportAndLegalSection";
import { RoleSpecificSettingsSection } from "./RoleSpecificSettingsSection";
import { fileToDataUrl, isDataUrlSizeAllowed } from "../utils/settingsMedia.utils";
import { getRoleSettingsCopy } from "../utils/settingsOptions.utils";
import {
  DEFAULT_USER_SETTINGS,
  persistUserSettings,
  readUserSettings,
} from "../utils/settingsStorage.utils";
import { applyInterfaceSettings } from "../utils/settingsRuntime.utils";
import {
  normalizeSpaces,
  splitFullName,
  validatePasswordForm,
  validateProfileForm,
  validateTutorLegalData,
} from "../utils/settingsValidation.utils";
import {
  createDefaultRoleVisibilitySettings,
  persistRoleVisibilitySettings,
  readRoleVisibilitySettings,
  type ManagedVisibilityRole,
} from "../utils/roleVisibility.utils";
import {
  DEFAULT_PLATFORM_MAINTENANCE_STATE,
  persistPlatformMaintenanceState,
  readPlatformMaintenanceState,
  togglePlatformMaintenance,
} from "../utils/platformMaintenance.utils";
import type {
  ClinicianAssetField,
  ClinicianAssetsErrors,
  ClinicianAssetsSettings,
  PasswordFormData,
  PasswordFormErrors,
  ProfileFormData,
  ProfileFormErrors,
  SettingsPageProps,
  TutorLegalData,
  TutorLegalDataErrors,
  UserSettingsStorage,
} from "../types/settings.types";

seedOnce();

const INITIAL_PASSWORD_FORM: PasswordFormData = {
  contrasenaActual: "",
  nuevaContrasena: "",
  confirmarNuevaContrasena: "",
};

const INITIAL_CLINICIAN_ASSETS: ClinicianAssetsSettings = {
  firmaDigitalMedico: null,
  selloMedico: null,
};

export function SettingsPage({ role }: SettingsPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clinician = useAuthStore((state) => state.clinician);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    nombreCompleto: "",
    fotoPerfil: null,
  });
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [profileMessage, setProfileMessage] = useState("");

  const [preferences, setPreferences] = useState(DEFAULT_USER_SETTINGS.preferencias);
  const [savedPreferences, setSavedPreferences] = useState(DEFAULT_USER_SETTINGS.preferencias);
  const [preferencesMessage, setPreferencesMessage] = useState("");

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>(INITIAL_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [passwordMessage, setPasswordMessage] = useState("");

  const [clinicianAssets, setClinicianAssets] = useState<ClinicianAssetsSettings>(
    INITIAL_CLINICIAN_ASSETS
  );
  const [savedClinicianAssets, setSavedClinicianAssets] = useState<ClinicianAssetsSettings>(
    INITIAL_CLINICIAN_ASSETS
  );
  const [clinicianAssetErrors, setClinicianAssetErrors] = useState<ClinicianAssetsErrors>({});
  const [clinicianAssetsMessage, setClinicianAssetsMessage] = useState("");

  const [tutorData, setTutorData] = useState<TutorLegalData>(DEFAULT_USER_SETTINGS.datosTutor);
  const [savedTutorData, setSavedTutorData] = useState<TutorLegalData>(DEFAULT_USER_SETTINGS.datosTutor);
  const [tutorErrors, setTutorErrors] = useState<TutorLegalDataErrors>({});
  const [tutorMessage, setTutorMessage] = useState("");

  const [roleVisibilitySettings, setRoleVisibilitySettings] = useState(
    createDefaultRoleVisibilitySettings()
  );
  const [roleVisibilityMessage, setRoleVisibilityMessage] = useState("");

  const [maintenanceState, setMaintenanceState] = useState(DEFAULT_PLATFORM_MAINTENANCE_STATE);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const copy = useMemo(() => getRoleSettingsCopy(role), [role]);
  const nombreVisual = useMemo(() => {
    const fallback = user ? `${user.firstName} ${user.lastName}` : "";
    return normalizeSpaces(profileForm.nombreCompleto) || fallback;
  }, [profileForm.nombreCompleto, user]);

  useEffect(() => {
    if (!user) return;

    const stored = readUserSettings(user.userId);
    const nextProfileForm: ProfileFormData = {
      nombreCompleto: normalizeSpaces(`${user.firstName} ${user.lastName}`),
      fotoPerfil: stored.fotoPerfil,
    };
    const nextClinicianAssets: ClinicianAssetsSettings = {
      firmaDigitalMedico: stored.firmaDigitalMedico,
      selloMedico: stored.selloMedico,
    };

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      setProfileForm(nextProfileForm);
      setPreferences(stored.preferencias);
      setSavedPreferences(stored.preferencias);
      setClinicianAssets(nextClinicianAssets);
      setSavedClinicianAssets(nextClinicianAssets);
      setTutorData(stored.datosTutor);
      setSavedTutorData(stored.datosTutor);

      if (role === UserRole.admin) {
        setRoleVisibilitySettings(readRoleVisibilitySettings());
        setMaintenanceState(readPlatformMaintenanceState());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [role, user]);

  const persistCurrentSettings = (next: Partial<UserSettingsStorage>) => {
    if (!user) return false;

    const merged: UserSettingsStorage = {
      fotoPerfil: next.fotoPerfil ?? profileForm.fotoPerfil ?? null,
      preferencias: next.preferencias ?? savedPreferences,
      firmaDigitalMedico: next.firmaDigitalMedico ?? savedClinicianAssets.firmaDigitalMedico,
      selloMedico: next.selloMedico ?? savedClinicianAssets.selloMedico,
      datosTutor: next.datosTutor ?? savedTutorData,
    };

    return persistUserSettings(user.userId, merged);
  };

  const setProfileField = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
    setProfileMessage("");
  };

  const setClinicianAssetField = <K extends ClinicianAssetField>(
    field: K,
    value: ClinicianAssetsSettings[K]
  ) => {
    setClinicianAssets((current) => ({ ...current, [field]: value }));
    setClinicianAssetErrors((current) => ({ ...current, [field]: undefined }));
    setClinicianAssetsMessage("");
  };

  const setTutorField = <K extends keyof TutorLegalData>(field: K, value: TutorLegalData[K]) => {
    setTutorData((current) => ({ ...current, [field]: value }));
    setTutorErrors((current) => ({ ...current, [field]: undefined }));
    setTutorMessage("");
  };

  const setPasswordField = <K extends keyof PasswordFormData>(
    field: K,
    value: PasswordFormData[K]
  ) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordErrors((current) => ({ ...current, [field]: undefined }));
    setPasswordMessage("");
  };

  const handleProfilePhotoSelect = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileErrors((current) => ({
        ...current,
        fotoPerfil: "Selecciona un archivo de imagen válido.",
      }));
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setProfileErrors((current) => ({
        ...current,
        fotoPerfil: "La imagen debe pesar menos de 3 MB.",
      }));
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      if (!isDataUrlSizeAllowed(dataUrl)) {
        setProfileErrors((current) => ({
          ...current,
          fotoPerfil: "La imagen es demasiado pesada para guardarse. Usa una imagen más liviana.",
        }));
        return;
      }

      setProfileField("fotoPerfil", dataUrl);
    } catch (error) {
      console.error("Error leyendo imagen de perfil:", error);
      setProfileErrors((current) => ({
        ...current,
        fotoPerfil: "No se pudo procesar la imagen seleccionada.",
      }));
    }
  };

  const handleClinicianAssetSelect = async (field: ClinicianAssetField, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setClinicianAssetErrors((current) => ({
        ...current,
        [field]: "Selecciona un archivo de imagen válido.",
      }));
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setClinicianAssetErrors((current) => ({
        ...current,
        [field]: "La imagen debe pesar menos de 3 MB.",
      }));
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      if (!isDataUrlSizeAllowed(dataUrl)) {
        setClinicianAssetErrors((current) => ({
          ...current,
          [field]: "La imagen es demasiado pesada para guardarse. Usa una imagen más liviana.",
        }));
        return;
      }

      setClinicianAssetField(field, dataUrl);
    } catch (error) {
      console.error("Error leyendo imagen clínica:", error);
      setClinicianAssetErrors((current) => ({
        ...current,
        [field]: "No se pudo procesar la imagen seleccionada.",
      }));
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;

    const errors = validateProfileForm(profileForm);
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    const { firstName, lastName } = splitFullName(profileForm.nombreCompleto);
    const dbUser = db.users.find((item) => item.userId === user.userId) ?? null;
    if (dbUser) {
      dbUser.firstName = firstName;
      dbUser.lastName = lastName;
    }

    const updatedUser = {
      ...user,
      firstName,
      lastName,
    };

    const savedSettings = persistCurrentSettings({ fotoPerfil: profileForm.fotoPerfil });
    setSession({ user: updatedUser, clinician });

    if (!savedSettings) {
      setProfileMessage(
        "Perfil actualizado, pero no se pudo guardar la foto. Intenta con una imagen más ligera."
      );
      return;
    }

    setProfileMessage("Perfil actualizado correctamente.");
  };

  const handleSaveClinicianAssets = () => {
    if (!user) return;

    const saveOk = persistCurrentSettings({
      firmaDigitalMedico: clinicianAssets.firmaDigitalMedico,
      selloMedico: clinicianAssets.selloMedico,
    });

    if (!saveOk) {
      setClinicianAssetsMessage("No se pudo guardar la firma y el sello. Intenta nuevamente.");
      return;
    }

    setSavedClinicianAssets(clinicianAssets);
    setClinicianAssetsMessage("Firma y sello guardados correctamente.");
  };

  const handleSaveTutorData = () => {
    if (!user) return;

    const normalizedTutorData: TutorLegalData = {
      nombreTutor: normalizeSpaces(tutorData.nombreTutor),
      cedulaTutor: normalizeSpaces(tutorData.cedulaTutor),
      parentescoTutor: normalizeSpaces(tutorData.parentescoTutor),
      telefonoTutor: normalizeSpaces(tutorData.telefonoTutor),
      direccionTutor: normalizeSpaces(tutorData.direccionTutor),
    };

    const errors = validateTutorLegalData(normalizedTutorData);
    if (Object.keys(errors).length > 0) {
      setTutorErrors(errors);
      return;
    }

    const saveOk = persistCurrentSettings({ datosTutor: normalizedTutorData });
    if (!saveOk) {
      setTutorMessage("No se pudo guardar la información del tutor. Intenta nuevamente.");
      return;
    }

    setTutorData(normalizedTutorData);
    setSavedTutorData(normalizedTutorData);
    setTutorMessage("Datos del tutor guardados correctamente.");
  };

  const setPreferenceField = <K extends keyof UserSettingsStorage["preferencias"]>(
    field: K,
    value: UserSettingsStorage["preferencias"][K]
  ) => {
    setPreferences((current) => ({ ...current, [field]: value }));
    setPreferencesMessage("");
  };

  const handleSavePreferences = () => {
    if (!user) return;

    const saveOk = persistCurrentSettings({ preferencias: preferences });
    if (!saveOk) {
      setPreferencesMessage("No se pudieron guardar las preferencias. Intenta nuevamente.");
      return;
    }

    setSavedPreferences(preferences);
    applyInterfaceSettings({
      fotoPerfil: profileForm.fotoPerfil,
      preferencias: preferences,
      firmaDigitalMedico: savedClinicianAssets.firmaDigitalMedico,
      selloMedico: savedClinicianAssets.selloMedico,
      datosTutor: savedTutorData,
    });

    setPreferencesMessage("Preferencias guardadas correctamente.");
  };

  const handleChangePassword = () => {
    if (!user) return;

    const savedPassword = db.passwords.get(user.userId) ?? user.password;
    const errors = validatePasswordForm(passwordForm, savedPassword);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    db.passwords.set(user.userId, passwordForm.nuevaContrasena);
    const dbUser = db.users.find((item) => item.userId === user.userId) ?? null;
    if (dbUser) {
      dbUser.password = passwordForm.nuevaContrasena;
    }

    setSession({
      user: {
        ...user,
        password: passwordForm.nuevaContrasena,
      },
      clinician,
    });
    setPasswordForm(INITIAL_PASSWORD_FORM);
    setPasswordMessage("Contraseña actualizada correctamente.");
  };

  const handleRoleVisibilityToggle = (
    managedRole: ManagedVisibilityRole,
    href: string,
    checked: boolean
  ) => {
    setRoleVisibilitySettings((current) => ({
      ...current,
      [managedRole]: {
        ...current[managedRole],
        [href]: checked,
      },
    }));
    setRoleVisibilityMessage("");
  };

  const handleSaveRoleVisibility = () => {
    const managedRoles: ManagedVisibilityRole[] = [UserRole.clinician, UserRole.patient];
    const hasRoleWithoutVisibleRoute = managedRoles.some((managedRole) => {
      return !Object.values(roleVisibilitySettings[managedRole]).some(Boolean);
    });

    if (hasRoleWithoutVisibleRoute) {
      setRoleVisibilityMessage("Cada rol debe conservar al menos un panel visible.");
      return;
    }

    const saveOk = persistRoleVisibilitySettings(roleVisibilitySettings);
    if (!saveOk) {
      setRoleVisibilityMessage("No se pudieron guardar los permisos por rol.");
      return;
    }

    setRoleVisibilityMessage("Permisos por rol guardados correctamente.");
  };

  const handleToggleMaintenance = () => {
    if (!user) return;

    const adminName = normalizeSpaces(`${user.firstName} ${user.lastName}`) || "Administrador";
    const nextState = togglePlatformMaintenance(!maintenanceState.enabled, adminName);
    const saveOk = persistPlatformMaintenanceState(nextState);

    if (!saveOk) {
      setMaintenanceMessage("No se pudo actualizar el modo mantenimiento.");
      return;
    }

    setMaintenanceState(nextState);
    setMaintenanceMessage(
      nextState.enabled
        ? "Modo mantenimiento activado correctamente."
        : "Modo mantenimiento desactivado correctamente."
    );
  };

  const handleLogout = async () => {
    await logoutClient(clearSession);
    router.replace("/");
  };

  if (!user) return null;

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <Heading
        containerClassName="nutri-platform-page-header p-4 sm:p-5"
        eyebrow={copy.ceja}
        description={copy.descripcion}
      >
        {copy.titulo}
      </Heading>

      <ProfileSettingsSection
        nombreVisual={nombreVisual}
        profileForm={profileForm}
        profileErrors={profileErrors}
        profileMessage={profileMessage}
        onProfileFieldChange={setProfileField}
        onProfilePhotoSelect={handleProfilePhotoSelect}
        onSaveProfile={handleSaveProfile}
        passwordForm={passwordForm}
        passwordErrors={passwordErrors}
        passwordMessage={passwordMessage}
        onPasswordFieldChange={setPasswordField}
        onChangePassword={handleChangePassword}
      />

      <RoleSpecificSettingsSection
        role={role}
        clinicianAssets={clinicianAssets}
        clinicianAssetErrors={clinicianAssetErrors}
        clinicianAssetsMessage={clinicianAssetsMessage}
        onSelectClinicianAsset={(field, file) => {
          void handleClinicianAssetSelect(field, file);
        }}
        onSaveClinicianAssets={handleSaveClinicianAssets}
        tutorData={tutorData}
        tutorErrors={tutorErrors}
        tutorMessage={tutorMessage}
        onTutorFieldChange={setTutorField}
        onSaveTutorData={handleSaveTutorData}
        roleVisibilitySettings={roleVisibilitySettings}
        roleVisibilityMessage={roleVisibilityMessage}
        maintenanceState={maintenanceState}
        maintenanceMessage={maintenanceMessage}
        onRoleVisibilityToggle={handleRoleVisibilityToggle}
        onSaveRoleVisibility={handleSaveRoleVisibility}
        onToggleMaintenance={handleToggleMaintenance}
      />

      <InterfacePreferencesSection
        preferences={preferences}
        message={preferencesMessage}
        onChange={setPreferenceField}
        onSave={handleSavePreferences}
      />

      {role !== UserRole.admin ? <SupportAndLegalSection onLogout={handleLogout} /> : null}
    </div>
  );
}
