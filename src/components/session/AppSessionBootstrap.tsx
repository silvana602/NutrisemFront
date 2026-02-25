"use client";

import { useEffect, useRef } from "react";
import type { Clinician } from "@/types/clinician";
import type { User } from "@/types/user";
import { useAuthStore } from "@/store/useAuthStore";
import { applyInterfaceSettings } from "@/features/settings/utils/settingsRuntime.utils";
import { readUserSettings } from "@/features/settings/utils/settingsStorage.utils";

type SessionResponse = {
  user: User;
  clinician?: Clinician | null;
};

async function fetchCurrentSession() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as SessionResponse;
  if (!payload.user) return null;

  return payload;
}

export default function AppSessionBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const triedRef = useRef(false);

  useEffect(() => {
    if (hydrated || triedRef.current) return;
    triedRef.current = true;

    (async () => {
      try {
        const session = await fetchCurrentSession();

        if (session) {
          setSession({
            user: session.user,
            clinician: session.clinician ?? null,
          });
        } else {
          clearSession();
        }
      } catch (error: unknown) {
        console.warn("Error en AppSessionBootstrap:", error);
        clearSession();
      } finally {
        setHydrated(true);
      }
    })();
  }, [hydrated, setHydrated, setSession, clearSession]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      const root = window.document.documentElement;
      root.removeAttribute("data-nutri-modo");
      root.removeAttribute("data-nutri-modo-preferencia");
      root.setAttribute("lang", "es");
      return;
    }

    applyInterfaceSettings(readUserSettings(user.userId));
  }, [hydrated, user?.userId]);

  return null;
}
