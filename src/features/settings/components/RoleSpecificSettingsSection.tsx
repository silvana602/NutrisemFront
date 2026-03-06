import React from "react";
import Image from "next/image";
import { FileSignature, ShieldCheck, Stethoscope, UserRound, Wrench } from "lucide-react";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { SettingsSectionCard } from "./SettingsSectionCard";
import { SettingsToggleField } from "./SettingsToggleField";
import type {
  ClinicianAssetField,
  ClinicianAssetsErrors,
  ClinicianAssetsSettings,
  TutorLegalData,
  TutorLegalDataErrors,
} from "../types/settings.types";
import {
  getManagedRoleLabel,
  getRoleVisibilityRoutes,
  type ManagedVisibilityRole,
  type RoleVisibilitySettings,
} from "../utils/roleVisibility.utils";
import type { PlatformMaintenanceState } from "../utils/platformMaintenance.utils";

type RoleSpecificSettingsSectionProps = {
  role: UserRole;
  clinicianAssets: ClinicianAssetsSettings;
  clinicianAssetErrors: ClinicianAssetsErrors;
  clinicianAssetsMessage: string;
  onSelectClinicianAsset: (field: ClinicianAssetField, file: File | null) => void;
  onSaveClinicianAssets: () => void;
  tutorData: TutorLegalData;
  tutorErrors: TutorLegalDataErrors;
  tutorMessage: string;
  onTutorFieldChange: <K extends keyof TutorLegalData>(field: K, value: TutorLegalData[K]) => void;
  onSaveTutorData: () => void;
  roleVisibilitySettings: RoleVisibilitySettings;
  roleVisibilityMessage: string;
  maintenanceState: PlatformMaintenanceState;
  maintenanceMessage: string;
  onRoleVisibilityToggle: (role: ManagedVisibilityRole, href: string, checked: boolean) => void;
  onSaveRoleVisibility: () => void;
  onToggleMaintenance: () => void;
};

function formatMaintenanceDate(isoDate: string | null): string {
  if (!isoDate) return "Sin registros";
  try {
    return new Intl.DateTimeFormat("es-BO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function AssetUploadCard({
  title,
  description,
  preview,
  error,
  onSelect,
}: {
  title: string;
  description: string;
  preview: string | null;
  error?: string;
  onSelect: (file: File | null) => void;
}) {
  return (
    <div className="rounded-xl border border-nutri-light-grey bg-white/80 p-3">
      <p className="text-sm font-semibold text-nutri-primary">{title}</p>
      <p className="mt-1 text-xs text-nutri-dark-grey/85">{description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex h-16 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-nutri-secondary/45 bg-nutri-off-white">
          {preview ? (
            <div className="relative h-full w-full">
              <Image src={preview} alt={title} fill unoptimized className="object-contain" />
            </div>
          ) : (
            <span className="px-2 text-center text-[11px] text-nutri-dark-grey/75">
              Sin imagen cargada
            </span>
          )}
        </div>

        <label className="inline-flex cursor-pointer items-center rounded-lg border border-nutri-primary/20 bg-white px-3 py-2 text-xs font-semibold text-nutri-primary transition-colors hover:bg-nutri-off-white">
          Subir archivo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onSelect(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}

function ClinicianClinicalSettings({
  clinicianAssets,
  clinicianAssetErrors,
  clinicianAssetsMessage,
  onSelectClinicianAsset,
  onSaveClinicianAssets,
}: Pick<
  RoleSpecificSettingsSectionProps,
  | "clinicianAssets"
  | "clinicianAssetErrors"
  | "clinicianAssetsMessage"
  | "onSelectClinicianAsset"
  | "onSaveClinicianAssets"
>) {
  return (
    <SettingsSectionCard
      title="Atención clínica"
      description="Configura tu firma y sello para que aparezcan automáticamente en los PDF de diagnóstico."
      icon={<Stethoscope size={16} />}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AssetUploadCard
          title="Firma digital"
          description="Imagen de tu firma profesional para documentos clínicos."
          preview={clinicianAssets.firmaDigitalMedico}
          error={clinicianAssetErrors.firmaDigitalMedico}
          onSelect={(file) => onSelectClinicianAsset("firmaDigitalMedico", file)}
        />

        <AssetUploadCard
          title="Sello médico"
          description="Sello institucional o personal que acompañará el informe."
          preview={clinicianAssets.selloMedico}
          error={clinicianAssetErrors.selloMedico}
          onSelect={(file) => onSelectClinicianAsset("selloMedico", file)}
        />
      </div>

      <div>
        <Button type="button" onClick={onSaveClinicianAssets}>
          Guardar firma y sello
        </Button>
        {clinicianAssetsMessage ? (
          <p className="mt-2 text-xs font-medium text-nutri-secondary">{clinicianAssetsMessage}</p>
        ) : null}
      </div>
    </SettingsSectionCard>
  );
}

function PatientFamilySettings({
  tutorData,
  tutorErrors,
  tutorMessage,
  onTutorFieldChange,
  onSaveTutorData,
}: Pick<
  RoleSpecificSettingsSectionProps,
  "tutorData" | "tutorErrors" | "tutorMessage" | "onTutorFieldChange" | "onSaveTutorData"
>) {
  return (
    <SettingsSectionCard
      title="Gestión familiar"
      description="Completa la información legal del padre o tutor responsable."
      icon={<UserRound size={16} />}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="nutri-label" htmlFor="settings-tutor-full-name">
            Nombre completo del tutor
          </label>
          <input
            id="settings-tutor-full-name"
            className="nutri-input"
            value={tutorData.nombreTutor}
            onChange={(event) => onTutorFieldChange("nombreTutor", event.target.value)}
            placeholder="Ejemplo: Juana Pérez Mamani"
          />
          {tutorErrors.nombreTutor ? (
            <p className="mt-1 text-xs text-rose-700">{tutorErrors.nombreTutor}</p>
          ) : null}
        </div>

        <div>
          <label className="nutri-label" htmlFor="settings-tutor-ci">
            Cédula de identidad
          </label>
          <input
            id="settings-tutor-ci"
            className="nutri-input"
            value={tutorData.cedulaTutor}
            onChange={(event) => onTutorFieldChange("cedulaTutor", event.target.value)}
            placeholder="Ejemplo: 4567890 LP"
          />
          {tutorErrors.cedulaTutor ? (
            <p className="mt-1 text-xs text-rose-700">{tutorErrors.cedulaTutor}</p>
          ) : null}
        </div>

        <div>
          <label className="nutri-label" htmlFor="settings-tutor-relationship">
            Parentesco o vínculo legal
          </label>
          <input
            id="settings-tutor-relationship"
            className="nutri-input"
            value={tutorData.parentescoTutor}
            onChange={(event) => onTutorFieldChange("parentescoTutor", event.target.value)}
            placeholder="Ejemplo: Madre"
          />
          {tutorErrors.parentescoTutor ? (
            <p className="mt-1 text-xs text-rose-700">{tutorErrors.parentescoTutor}</p>
          ) : null}
        </div>

        <div>
          <label className="nutri-label" htmlFor="settings-tutor-phone">
            Teléfono de contacto
          </label>
          <input
            id="settings-tutor-phone"
            className="nutri-input"
            value={tutorData.telefonoTutor}
            onChange={(event) => onTutorFieldChange("telefonoTutor", event.target.value)}
            placeholder="Ejemplo: +591 70000000"
          />
          {tutorErrors.telefonoTutor ? (
            <p className="mt-1 text-xs text-rose-700">{tutorErrors.telefonoTutor}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className="nutri-label" htmlFor="settings-tutor-address">
            Dirección
          </label>
          <textarea
            id="settings-tutor-address"
            className="nutri-input min-h-20 resize-y"
            value={tutorData.direccionTutor}
            onChange={(event) => onTutorFieldChange("direccionTutor", event.target.value)}
            placeholder="Dirección legal del tutor"
          />
          {tutorErrors.direccionTutor ? (
            <p className="mt-1 text-xs text-rose-700">{tutorErrors.direccionTutor}</p>
          ) : null}
        </div>
      </div>

      <div>
        <Button type="button" onClick={onSaveTutorData}>
          Guardar datos del tutor
        </Button>
        {tutorMessage ? (
          <p className="mt-2 text-xs font-medium text-nutri-secondary">{tutorMessage}</p>
        ) : null}
      </div>
    </SettingsSectionCard>
  );
}

function AdminControlSettings({
  roleVisibilitySettings,
  roleVisibilityMessage,
  maintenanceState,
  maintenanceMessage,
  onRoleVisibilityToggle,
  onSaveRoleVisibility,
  onToggleMaintenance,
}: Pick<
  RoleSpecificSettingsSectionProps,
  | "roleVisibilitySettings"
  | "roleVisibilityMessage"
  | "maintenanceState"
  | "maintenanceMessage"
  | "onRoleVisibilityToggle"
  | "onSaveRoleVisibility"
  | "onToggleMaintenance"
>) {
  const managedRoles: ManagedVisibilityRole[] = [UserRole.clinician, UserRole.patient];
  const maintenanceStateLabel = maintenanceState.enabled ? "Activo" : "Inactivo";

  return (
    <SettingsSectionCard
      title="Control total"
      description="Gestiona permisos de visualización por rol y activa el modo mantenimiento cuando sea necesario."
      icon={<ShieldCheck size={16} />}
    >
      <div className="space-y-4">
        <div className="space-y-3 rounded-xl border border-nutri-light-grey bg-white/80 p-3">
          <div className="flex items-center gap-2 text-nutri-primary">
            <FileSignature size={16} />
            <h3 className="text-sm font-semibold">Gestión de roles</h3>
          </div>

          <p className="text-xs text-nutri-dark-grey/80">
            El rol administrador mantiene acceso total al sistema. Aquí controlas qué paneles ven
            los demás roles.
          </p>

          {managedRoles.map((managedRole) => (
            <div key={managedRole} className="rounded-lg border border-nutri-light-grey/70 bg-nutri-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-nutri-primary">
                {getManagedRoleLabel(managedRole)}
              </p>

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {getRoleVisibilityRoutes(managedRole).map((route) => (
                  <SettingsToggleField
                    key={route.href}
                    label={route.label}
                    description={`Controla si este panel aparece y puede abrirse para ${getManagedRoleLabel(
                      managedRole
                    )}.`}
                    checked={roleVisibilitySettings[managedRole][route.href] ?? true}
                    onChange={(checked) => onRoleVisibilityToggle(managedRole, route.href, checked)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div>
            <Button type="button" onClick={onSaveRoleVisibility}>
              Guardar permisos
            </Button>
            {roleVisibilityMessage ? (
              <p className="mt-2 text-xs font-medium text-nutri-secondary">{roleVisibilityMessage}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-nutri-primary/20 bg-nutri-primary/5 p-3">
          <div className="flex items-center gap-2 text-nutri-primary">
            <Wrench size={16} />
            <h3 className="text-sm font-semibold">Mantenimiento</h3>
          </div>

          <p className="text-xs text-nutri-dark-grey/85">
            Estado actual del modo mantenimiento:{" "}
            <span className="font-semibold text-nutri-primary">{maintenanceStateLabel}</span>
          </p>

          <p className="text-xs text-nutri-dark-grey/80">
            Última actualización: {formatMaintenanceDate(maintenanceState.updatedAt)}
            {maintenanceState.updatedBy ? ` por ${maintenanceState.updatedBy}.` : "."}
          </p>

          <Button
            type="button"
            variant={maintenanceState.enabled ? "outline" : "primary"}
            onClick={onToggleMaintenance}
          >
            {maintenanceState.enabled
              ? "Desactivar modo mantenimiento"
              : "Activar modo mantenimiento"}
          </Button>

          {maintenanceMessage ? (
            <p className="text-xs font-medium text-nutri-secondary">{maintenanceMessage}</p>
          ) : null}
        </div>
      </div>
    </SettingsSectionCard>
  );
}

export function RoleSpecificSettingsSection(props: RoleSpecificSettingsSectionProps) {
  if (props.role === UserRole.clinician) {
    return (
      <ClinicianClinicalSettings
        clinicianAssets={props.clinicianAssets}
        clinicianAssetErrors={props.clinicianAssetErrors}
        clinicianAssetsMessage={props.clinicianAssetsMessage}
        onSelectClinicianAsset={props.onSelectClinicianAsset}
        onSaveClinicianAssets={props.onSaveClinicianAssets}
      />
    );
  }

  if (props.role === UserRole.patient) {
    return (
      <PatientFamilySettings
        tutorData={props.tutorData}
        tutorErrors={props.tutorErrors}
        tutorMessage={props.tutorMessage}
        onTutorFieldChange={props.onTutorFieldChange}
        onSaveTutorData={props.onSaveTutorData}
      />
    );
  }

  if (props.role === UserRole.admin) {
    return (
      <AdminControlSettings
        roleVisibilitySettings={props.roleVisibilitySettings}
        roleVisibilityMessage={props.roleVisibilityMessage}
        maintenanceState={props.maintenanceState}
        maintenanceMessage={props.maintenanceMessage}
        onRoleVisibilityToggle={props.onRoleVisibilityToggle}
        onSaveRoleVisibility={props.onSaveRoleVisibility}
        onToggleMaintenance={props.onToggleMaintenance}
      />
    );
  }

  return null;
}
