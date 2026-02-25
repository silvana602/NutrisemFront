"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { db, seedOnce } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutClient } from "@/lib/auth/client";
import { ProfileSettingsSection } from "./ProfileSettingsSection";
import { InterfacePreferencesSection } from "./InterfacePreferencesSection";
import { SupportAndLegalSection } from "./SupportAndLegalSection";
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
} from "../utils/settingsValidation.utils";
import type {
  PasswordFormData,
  PasswordFormErrors,
  ProfileFormData,
  ProfileFormErrors,
  SettingsPageProps,
  UserSettingsStorage,
} from "../types/settings.types";

seedOnce();

const INITIAL_PASSWORD_FORM: PasswordFormData = {
  contrasenaActual: "",
  nuevaContrasena: "",
  confirmarNuevaContrasena: "",
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

  const copy = useMemo(() => getRoleSettingsCopy(role), [role]);
  const nombreVisual = useMemo(() => {
    const fallback = user ? `${user.firstName} ${user.lastName}` : "";
    return normalizeSpaces(profileForm.nombreCompleto) || fallback;
  }, [profileForm.nombreCompleto, user]);

  useEffect(() => {
    if (!user) return;

    const stored = readUserSettings(user.userId);
    setProfileForm({
      nombreCompleto: normalizeSpaces(`${user.firstName} ${user.lastName}`),
      fotoPerfil: stored.fotoPerfil,
    });
    setPreferences(stored.preferencias);
    setSavedPreferences(stored.preferencias);
  }, [user]);

  const persistCurrentSettings = (next: Partial<UserSettingsStorage>) => {
    if (!user) return false;

    const merged: UserSettingsStorage = {
      fotoPerfil: next.fotoPerfil ?? profileForm.fotoPerfil,
      preferencias: next.preferencias ?? savedPreferences,
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

    const savedSettings = persistCurrentSettings({
      fotoPerfil: profileForm.fotoPerfil,
    });
    setSession({ user: updatedUser, clinician });

    if (!savedSettings) {
      setProfileMessage(
        "Perfil actualizado, pero no se pudo guardar la foto. Intenta con una imagen más ligera."
      );
      return;
    }

    setProfileMessage("Perfil actualizado correctamente.");
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

      <InterfacePreferencesSection
        preferences={preferences}
        message={preferencesMessage}
        onChange={setPreferenceField}
        onSave={handleSavePreferences}
      />

      <SupportAndLegalSection onLogout={handleLogout} />
    </div>
  );
}
