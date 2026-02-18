"use client";

import { Home, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { resolveHomePathFromSession } from "@/lib/auth/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const UNAUTHORIZED_MESSAGE =
  "¿Olvidaste tu identificación? Para entrar a consulta, primero debes iniciar sesión,";

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) return null;
  if (nextPath.startsWith("//")) return null;
  return nextPath;
}

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleGoLogin = () => {
    const nextPath = getSafeNextPath(searchParams.get("next"));
    if (!nextPath) {
      router.push("/login");
      return;
    }

    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  const handleGoHome = () => {
    router.push(resolveHomePathFromSession({ user, accessToken }));
  };

  return (
    <ErrorPageTemplate
      code="401"
      title="ACCESO NO AUTORIZADO"
      message={UNAUTHORIZED_MESSAGE}
      imagePath="/images/errors/401.png"
      imageAlt="Error 401 Nutrisem"
      actions={[
        {
          label: "Iniciar Sesion",
          onClick: handleGoLogin,
          icon: LogIn,
          variant: "solid",
        },
        {
          label: "Ir a Inicio",
          onClick: handleGoHome,
          icon: Home,
          variant: "outline",
        },
      ]}
    />
  );
}
