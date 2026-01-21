import { create } from "zustand";

import type { User } from "@/types/user";
import type { UserRole } from "@/types/user";
import type { Clinician } from "@/types/clinician";

type AuthState = {
  hydrated: boolean;

  accessToken: string | null;
  user: User | null;
  clinician: Clinician | null;

  /** NUEVO */
  activeRole: UserRole | null;

  setHydrated: (v: boolean) => void;

  setSession: (data: {
    accessToken: string | null;
    user: User;
    clinician?: Clinician | null;
  }) => void;

  setActiveRole: (role: UserRole) => void;

  clearSession: () => void;

  /** Helpers */
  isAdmin: () => boolean;
  isClinician: () => boolean;
  isPatient: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,

  accessToken: null,
  user: null,
  clinician: null,
  activeRole: null,

  setHydrated: (v) => set({ hydrated: v }),

  setSession: ({ accessToken, user, clinician }) =>
    set({
      accessToken,
      user,
      clinician: clinician ?? null,
      activeRole: user.role, // 🔑 rol inicial
    }),

  setActiveRole: (role) =>
    set({
      activeRole: role,
    }),

  clearSession: () =>
    set({
      accessToken: null,
      user: null,
      clinician: null,
      activeRole: null,
    }),

  // Helpers
  isAdmin: () => get().activeRole === "admin",
  isClinician: () => get().activeRole === "clinician",
  isPatient: () => get().activeRole === "patient",
}));
