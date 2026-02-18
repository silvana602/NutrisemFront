type SessionLike = {
  user: unknown;
  accessToken: string | null;
};

export function hasStoredSession() {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem("session");
    if (!raw) return false;

    const parsed = JSON.parse(raw) as {
      accessToken?: string | null;
      user?: unknown;
    };

    return Boolean(parsed.accessToken && parsed.user);
  } catch {
    return false;
  }
}

export function resolveHomePathFromSession({ user, accessToken }: SessionLike) {
  if (user && accessToken) return "/dashboard";
  return hasStoredSession() ? "/dashboard" : "/";
}
