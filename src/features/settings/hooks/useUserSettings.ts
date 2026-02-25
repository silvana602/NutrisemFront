"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_USER_SETTINGS,
  SETTINGS_UPDATED_EVENT,
  readUserSettings,
} from "../utils/settingsStorage.utils";
import type { UserSettingsStorage } from "../types/settings.types";

export function useUserSettings(userId: string | null | undefined): UserSettingsStorage {
  const [settings, setSettings] = useState<UserSettingsStorage>(DEFAULT_USER_SETTINGS);

  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULT_USER_SETTINGS);
      return;
    }

    const load = () => {
      setSettings(readUserSettings(userId));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && !event.key.includes(userId)) return;
      load();
    };

    const onSettingsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== userId) return;
      load();
    };

    load();
    window.addEventListener("storage", onStorage);
    window.addEventListener(SETTINGS_UPDATED_EVENT, onSettingsUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, onSettingsUpdated);
    };
  }, [userId]);

  return settings;
}
