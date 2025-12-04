import { create } from "zustand";

import type { User } from "@/types/user";
import type { Clinician } from "@/types/clinician";

type AuthState = {
  hydrated: boolean;

  accessToken: string | null;
  user: User | null;      // admin o clinician
  clinician: Clinician | null; // si rol === clinician

  /** Marcar hidratado */
  setHydrated: (v: boolean) => void;

  /** Guardar sesión */
  setSession: (data: {
    accessToken: string | null;
    user: User;
    clinician?: Clinician | null;
  }) => void;

  /** Cerrar sesión */
  clearSession: () => void;

  setUser: (u: any) => void;

  /** Helpers */
  isAdmin: () => boolean;
  isclinician: () => boolean;
  isPatient: () => boolean; // depende de implementación futura
};

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,

  accessToken: null,
  user: null,
  clinician: null,

  setHydrated: (v) => set({ hydrated: v }),

  setSession: ({ accessToken, user, clinician }) =>
    set({
      accessToken,
      user,
      clinician: clinician ?? null,
    }),

  clearSession: () =>
    set({
      accessToken: null,
      user: null,
      clinician: null,
    }),

  setUser: (u) => set({ user: u }),

  logout: () => set({ user: null }),

  // Helpers
  isAdmin: () => get().user?.role === "admin",
  isclinician: () => !!get().clinician,
  isPatient: () => false, // se habilitará cuando implementemos login tutor
}));
