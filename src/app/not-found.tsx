"use client";

import { ArrowLeft, Home } from "lucide-react";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { useErrorPageActions } from "@/hooks/useErrorPageActions";

const NOT_FOUND_MESSAGE =
  "\u00A1Emergencia! La ambulancia tom\u00F3 un camino equivocado y no encontramos el destino.";

export default function NotFound() {
  const { goBackOrHome, goHome } = useErrorPageActions();

  const handleBack = () => {
    goBackOrHome();
  };

  const handleGoHome = () => {
    goHome();
  };

  return (
    <ErrorPageTemplate
      code="404"
      title="RUTA DE EMERGENCIA EXTRAVIADA"
      message={NOT_FOUND_MESSAGE}
      imagePath="/images/errors/404.png"
      imageAlt="Error 404 Nutrisem"
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
