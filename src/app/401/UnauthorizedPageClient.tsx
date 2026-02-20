"use client";

import { Home, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { useErrorPageActions } from "@/hooks/useErrorPageActions";

const UNAUTHORIZED_MESSAGE =
  "Olvidaste tu identificacion? Para entrar a consulta, primero debes iniciar sesion.";

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) return null;
  if (nextPath.startsWith("//")) return null;
  return nextPath;
}

export default function UnauthorizedPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { goHome } = useErrorPageActions();

  const handleGoLogin = () => {
    const nextPath = getSafeNextPath(searchParams.get("next"));
    if (!nextPath) {
      router.push("/login");
      return;
    }

    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  const handleGoHome = () => {
    goHome();
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
