import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/user";
import type { Clinician } from "@/types/clinician";

type SessionState = {
    token: string | null;
    isAuthenticated: boolean;

    user: User | null;                // Admin o clinician
    clinician: Clinician | null;    // Solo si es clinician

    // Login Admin / clinician
    loginUser: (data: {
        token: string;
        user: User;
        clinician?: Clinician | null;
    }) => void;

    // Login tutor (cuando lo implementes)
    loginTutor: (data: { token: string }) => void;

    logout: () => void;

    // Helpers
    isAdmin: () => boolean;
    isclinician: () => boolean;
};

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            token: null,
            isAuthenticated: false,

            user: null,
            clinician: null,

            // === LOGIN ===
            loginUser: ({ token, user, clinician }) =>
                set({
                    token,
                    user,
                    clinician: clinician ?? null,
                    isAuthenticated: true,
                }),

            // Login tutor → solo token
            loginTutor: ({ token }) =>
                set({
                    token,
                    isAuthenticated: true,
                }),

            // === LOGOUT ===
            logout: () =>
                set({
                    token: null,
                    isAuthenticated: false,
                    user: null,
                    clinician: null,
                }),

            // === HELPERS ===
            isAdmin: () => get().user?.role === "admin",

            isclinician: () => !!get().clinician,
        }),
        {
            name: "nutrisem-session",
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                clinician: state.clinician,
            }),
        }
    )
);
