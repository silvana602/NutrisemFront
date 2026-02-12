import { useAuthStore } from "@/store/useAuthStore";

export function useSession() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);

  return {
    user,
    accessToken,
    hydrated,
    isAuthenticated: Boolean(user && accessToken),
  };
}
