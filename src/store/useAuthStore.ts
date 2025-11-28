import { create } from "zustand";

import type { User } from "@/types/user";
import type { Healthcare } from "@/types/healthcare";

type AuthState = {
  hydrated: boolean;

  accessToken: string | null;
  user: User | null;      // admin o healthcare
  healthcare: Healthcare | null; // si rol === healthcare

  /** Marcar hidratado */
  setHydrated: (v: boolean) => void;

  /** Guardar sesión */
  setSession: (data: {
    accessToken: string | null;
    user: User;
    healthcare?: Healthcare | null;
  }) => void;

  /** Cerrar sesión */
  clearSession: () => void;

  /** Helpers */
  isAdmin: () => boolean;
  ishealthcare: () => boolean;
  isPatient: () => boolean; // depende de implementación futura
};

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,

  accessToken: null,
  user: null,
  healthcare: null,

  setHydrated: (v) => set({ hydrated: v }),

  setSession: ({ accessToken, user, healthcare }) =>
    set({
      accessToken,
      user,
      healthcare: healthcare ?? null,
    }),

  clearSession: () =>
    set({
      accessToken: null,
      user: null,
      healthcare: null,
    }),

  // Helpers
  isAdmin: () => get().user?.role === "admin",
  ishealthcare: () => !!get().healthcare,
  isPatient: () => false, // se habilitará cuando implementemos login tutor
}));
