import { create } from "zustand";
import type { Clinician } from "@/types/clinician";
import type { User, UserRole } from "@/types/user";

type AuthState = {
  hydrated: boolean;
  user: User | null;
  clinician: Clinician | null;
  activeRole: UserRole | null;
  setHydrated: (value: boolean) => void;
  setSession: (data: { user: User; clinician?: Clinician | null }) => void;
  setActiveRole: (role: UserRole) => void;
  clearSession: () => void;
  isAdmin: () => boolean;
  isClinician: () => boolean;
  isPatient: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  user: null,
  clinician: null,
  activeRole: null,
  setHydrated: (value) => set({ hydrated: value }),
  setSession: ({ user, clinician }) =>
    set({
      user,
      clinician: clinician ?? null,
      activeRole: user.role,
    }),
  setActiveRole: (role) => set({ activeRole: role }),
  clearSession: () =>
    set({
      user: null,
      clinician: null,
      activeRole: null,
    }),
  isAdmin: () => get().activeRole === "admin",
  isClinician: () => get().activeRole === "clinician",
  isPatient: () => get().activeRole === "patient",
}));
