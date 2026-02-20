import { useAuthStore } from "@/store/useAuthStore";

export function useSession() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  return {
    user,
    hydrated,
    isAuthenticated: Boolean(user),
  };
}
