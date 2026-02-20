"use client";

const SESSION_STORAGE_KEY = "session";
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const LEGACY_SESSION_STORE_KEY = "nutrisem-session";

function clearClientSessionStorage() {
  if (typeof window === "undefined") return;

  // Limpia llaves legacy del esquema anterior basado en localStorage.
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_SESSION_STORE_KEY);
}

async function clearServerSessionCookies() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Si falla la limpieza server-side, igual dejamos limpia la sesión local.
  }
}

export async function logoutClient(clearSession: () => void) {
  clearSession();
  clearClientSessionStorage();
  await clearServerSessionCookies();
}
