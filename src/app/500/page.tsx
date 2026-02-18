"use client";

import { Home, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { resolveHomePathFromSession } from "@/lib/auth/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const SERVER_ERROR_MESSAGE =
  "Error de Laboratorio. Algo salio mal con la mezcla de datos. Por favor, intenta recargar el sistema m\u00E1s tarde";

export default function InternalServerErrorPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push(resolveHomePathFromSession({ user, accessToken }));
  };

  return (
    <ErrorPageTemplate
      code="500"
      title="ERROR INTERNO DEL SISTEMA"
      message={SERVER_ERROR_MESSAGE}
      imagePath="/images/errors/500.png"
      imageAlt="Error 500 Nutrisem"
      actions={[
        {
          label: "Recargar",
          onClick: handleReload,
          icon: RotateCcw,
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
