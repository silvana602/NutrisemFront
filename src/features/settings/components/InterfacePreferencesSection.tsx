import React from "react";
import { Languages, MonitorCog } from "lucide-react";
import { SettingsSectionCard } from "./SettingsSectionCard";
import { Button } from "@/components/ui/Button";
import {
  IDIOMA_OPTIONS,
  MODO_VISUAL_OPTIONS,
} from "../utils/settingsOptions.utils";
import type { InterfacePreferences } from "../types/settings.types";

type InterfacePreferencesSectionProps = {
  preferences: InterfacePreferences;
  message: string;
  onChange: <K extends keyof InterfacePreferences>(
    field: K,
    value: InterfacePreferences[K]
  ) => void;
  onSave: () => void;
};

export function InterfacePreferencesSection({
  preferences,
  message,
  onChange,
  onSave,
}: InterfacePreferencesSectionProps) {
  return (
    <SettingsSectionCard
      title="Preferencias de interfaz"
      description="Personaliza la visualización de la plataforma según tu flujo de trabajo."
      icon={<MonitorCog size={16} />}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-nutri-light-grey bg-white/80 p-3">
          <label className="nutri-label flex items-center gap-2" htmlFor="settings-visual-mode">
            <MonitorCog size={14} />
            Modo visual
          </label>
          <select
            id="settings-visual-mode"
            className="nutri-input"
            value={preferences.modoVisual}
            onChange={(event) => onChange("modoVisual", event.target.value as InterfacePreferences["modoVisual"])}
          >
            {MODO_VISUAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-nutri-light-grey bg-white/80 p-3">
          <label className="nutri-label flex items-center gap-2" htmlFor="settings-language">
            <Languages size={14} />
            Idioma
          </label>
          <select
            id="settings-language"
            className="nutri-input"
            value={preferences.idioma}
            onChange={(event) => onChange("idioma", event.target.value as InterfacePreferences["idioma"])}
          >
            {IDIOMA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Button type="button" onClick={onSave}>
          Guardar preferencias
        </Button>
        {message ? <p className="mt-2 text-xs font-medium text-nutri-secondary">{message}</p> : null}
      </div>
    </SettingsSectionCard>
  );
}
