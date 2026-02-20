"use client";

import { Home, RotateCcw } from "lucide-react";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { useErrorPageActions } from "@/hooks/useErrorPageActions";

const SERVER_ERROR_MESSAGE =
  "Error de Laboratorio. Algo salio mal con la mezcla de datos. Por favor, intenta recargar el sistema m\u00E1s tarde";

export default function InternalServerErrorPage() {
  const { goHome } = useErrorPageActions();

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    goHome();
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
