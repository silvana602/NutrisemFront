import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/user";
import type { Healthcare } from "@/types/healthcare";

type SessionState = {
    token: string | null;
    isAuthenticated: boolean;

    user: User | null;                // Admin o Healthcare
    healthcare: Healthcare | null;    // Solo si es healthcare

    // Login Admin / Healthcare
    loginUser: (data: {
        token: string;
        user: User;
        healthcare?: Healthcare | null;
    }) => void;

    // Login tutor (cuando lo implementes)
    loginTutor: (data: { token: string }) => void;

    logout: () => void;

    // Helpers
    isAdmin: () => boolean;
    isHealthcare: () => boolean;
};

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            token: null,
            isAuthenticated: false,

            user: null,
            healthcare: null,

            // === LOGIN ===
            loginUser: ({ token, user, healthcare }) =>
                set({
                    token,
                    user,
                    healthcare: healthcare ?? null,
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
                    healthcare: null,
                }),

            // === HELPERS ===
            isAdmin: () => get().user?.role === "admin",

            isHealthcare: () => !!get().healthcare,
        }),
        {
            name: "nutrisem-session",
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                healthcare: state.healthcare,
            }),
        }
    )
);
