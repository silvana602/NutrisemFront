"use client";

import { useRouter } from "next/navigation";
import { resolveHomePathFromSession } from "@/lib/auth/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function useErrorPageActions() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const goHome = () => {
    router.push(resolveHomePathFromSession({ user }));
  };

  const goBackOrHome = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    goHome();
  };

  return {
    goHome,
    goBackOrHome,
  };
}
