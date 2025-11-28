import "server-only";
import { cookies } from "next/headers";

// Ajusta si tu backend usa otro nombre de cookie para refresh
export const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Devuelve true si detectamos una sesión (ej. por refresh token en cookie HttpOnly).
 * En Next 15, cookies() es async en Server Components → hay que await.
 */
export async function isAuthenticatedServer(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.has(REFRESH_COOKIE_NAME);
}

/** Lee el refresh token (útil si quieres validarlo/propagarlo a llamadas server-side). */
export async function getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

/** Lee cualquier cookie por nombre. */
export async function getCookie(name: string): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value ?? null;
}