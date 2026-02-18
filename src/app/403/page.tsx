"use client";

import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { resolveHomePathFromSession } from "@/lib/auth/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const FORBIDDEN_MESSAGE =
  "Acceso Denegado. Tu perfil actual no tiene los permisos necesarios para consultar este expediente.";

export default function ForbiddenPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(resolveHomePathFromSession({ user, accessToken }));
  };

  const handleGoHome = () => {
    router.push(resolveHomePathFromSession({ user, accessToken }));
  };

  return (
    <ErrorPageTemplate
      code="403"
      title="ACCESO RESTRINGIDO"
      message={FORBIDDEN_MESSAGE}
      imagePath="/images/errors/403.png"
      imageAlt="Error 403 Nutrisem"
      actions={[
        {
          label: "Volver Atras",
          onClick: handleBack,
          icon: ArrowLeft,
          variant: "outline",
        },
        {
          label: "Ir a Inicio",
          onClick: handleGoHome,
          icon: Home,
          variant: "solid",
        },
      ]}
    />
  );
}
