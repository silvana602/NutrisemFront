type SessionLike = {
  user: unknown | null;
};

export function resolveHomePathFromSession({ user }: SessionLike) {
  if (user) return "/dashboard";
  return "/";
}
