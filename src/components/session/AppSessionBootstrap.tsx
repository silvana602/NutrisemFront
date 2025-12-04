"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthService } from "@/services/auth.service";

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
        // Obtener token del localStorage
        const token = localStorage.getItem("accessToken") ?? null;

        const response = AuthService.me(token);

        if (response) {
          setSession({
            accessToken: response.accessToken,
            user: response.user,
            clinician: response.clinician, // ⚠ ojo: property name lowercase en store
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
