import React from "react";
import { Camera, KeyRound, UserRound } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SettingsSectionCard } from "./SettingsSectionCard";
import type {
  PasswordFormData,
  PasswordFormErrors,
  ProfileFormData,
  ProfileFormErrors,
} from "../types/settings.types";

type ProfileSettingsSectionProps = {
  nombreVisual: string;
  profileForm: ProfileFormData;
  profileErrors: ProfileFormErrors;
  profileMessage: string;
  onProfileFieldChange: <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => void;
  onProfilePhotoSelect: (file: File | null) => Promise<void>;
  onSaveProfile: () => void;
  passwordForm: PasswordFormData;
  passwordErrors: PasswordFormErrors;
  passwordMessage: string;
  onPasswordFieldChange: <K extends keyof PasswordFormData>(
    field: K,
    value: PasswordFormData[K]
  ) => void;
  onChangePassword: () => void;
};

export function ProfileSettingsSection({
  nombreVisual,
  profileForm,
  profileErrors,
  profileMessage,
  onProfileFieldChange,
  onProfilePhotoSelect,
  onSaveProfile,
  passwordForm,
  passwordErrors,
  passwordMessage,
  onPasswordFieldChange,
  onChangePassword,
}: ProfileSettingsSectionProps) {
  return (
    <SettingsSectionCard
      title="Perfil personal"
      description="Gestiona tu identidad dentro de la plataforma y protege tu acceso."
      icon={<UserRound size={16} />}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[auto,1fr]">
        <div className="nutri-platform-surface-soft flex flex-col items-center gap-3 rounded-xl border border-nutri-light-grey px-4 py-4">
          <Avatar name={nombreVisual} src={profileForm.fotoPerfil} size={88} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-nutri-primary/20 bg-white px-3 py-2 text-xs font-semibold text-nutri-primary transition-colors hover:bg-nutri-off-white">
            <Camera size={14} />
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                void onProfilePhotoSelect(file);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="nutri-label" htmlFor="settings-full-name">
              Nombre completo
            </label>
            <input
              id="settings-full-name"
              className="nutri-input"
              value={profileForm.nombreCompleto}
              onChange={(event) => onProfileFieldChange("nombreCompleto", event.target.value)}
              placeholder="Ejemplo: Ana María Flores"
            />
            {profileErrors.nombreCompleto ? (
              <p className="mt-1 text-xs text-rose-700">{profileErrors.nombreCompleto}</p>
            ) : null}
          </div>

          <div>
            <Button type="button" onClick={onSaveProfile}>
              Guardar perfil
            </Button>
            {profileMessage ? (
              <p className="mt-2 text-xs font-medium text-nutri-secondary">{profileMessage}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="nutri-platform-divider" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-nutri-primary">
          <KeyRound size={16} />
          <h3 className="text-sm font-semibold">Cambio de contraseña</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="nutri-label" htmlFor="settings-current-password">
              Contraseña actual
            </label>
            <input
              id="settings-current-password"
              type="password"
              className="nutri-input"
              value={passwordForm.contrasenaActual}
              onChange={(event) => onPasswordFieldChange("contrasenaActual", event.target.value)}
            />
            {passwordErrors.contrasenaActual ? (
              <p className="mt-1 text-xs text-rose-700">{passwordErrors.contrasenaActual}</p>
            ) : null}
          </div>

          <div>
            <label className="nutri-label" htmlFor="settings-new-password">
              Nueva contraseña
            </label>
            <input
              id="settings-new-password"
              type="password"
              className="nutri-input"
              value={passwordForm.nuevaContrasena}
              onChange={(event) => onPasswordFieldChange("nuevaContrasena", event.target.value)}
            />
            {passwordErrors.nuevaContrasena ? (
              <p className="mt-1 text-xs text-rose-700">{passwordErrors.nuevaContrasena}</p>
            ) : null}
          </div>

          <div>
            <label className="nutri-label" htmlFor="settings-confirm-password">
              Confirmar nueva contraseña
            </label>
            <input
              id="settings-confirm-password"
              type="password"
              className="nutri-input"
              value={passwordForm.confirmarNuevaContrasena}
              onChange={(event) =>
                onPasswordFieldChange("confirmarNuevaContrasena", event.target.value)
              }
            />
            {passwordErrors.confirmarNuevaContrasena ? (
              <p className="mt-1 text-xs text-rose-700">{passwordErrors.confirmarNuevaContrasena}</p>
            ) : null}
          </div>
        </div>

        <div>
          <Button type="button" variant="outline" onClick={onChangePassword}>
            Actualizar contraseña
          </Button>
          {passwordMessage ? (
            <p className="mt-2 text-xs font-medium text-nutri-secondary">{passwordMessage}</p>
          ) : null}
        </div>
      </div>
    </SettingsSectionCard>
  );
}
