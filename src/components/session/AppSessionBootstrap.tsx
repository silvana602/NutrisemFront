"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types/user";
import type { Clinician } from "@/types/clinician";

export default function AppSessionBootstrap() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const triedRef = useRef(false);

  useEffect(() => {
    if (hydrated || triedRef.current) return;
    triedRef.current = true;

    (async () => {
      try {
        const rawSession = localStorage.getItem("session");

        if (rawSession) {
          const session = JSON.parse(rawSession) as {
            accessToken: string | null;
            user: User;
            clinician?: Clinician | null;
          };

          setSession({
            accessToken: session.accessToken,
            user: session.user,
            clinician: session.clinician ?? null,
          });
        } else {
          clearSession();
        }
      } catch (e) {
        console.warn("Error en AppSessionBootstrap:", e);
        clearSession();
      } finally {
        setHydrated(true);
      }
    })();
  }, [hydrated, setHydrated, setSession, clearSession]);

  return null;
}
