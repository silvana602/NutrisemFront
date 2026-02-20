"use client";

import { ArrowLeft, Home } from "lucide-react";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { useErrorPageActions } from "@/hooks/useErrorPageActions";

const FORBIDDEN_MESSAGE =
  "Acceso Denegado. Tu perfil actual no tiene los permisos necesarios para consultar este expediente.";

export default function ForbiddenPage() {
  const { goBackOrHome, goHome } = useErrorPageActions();

  const handleBack = () => {
    goBackOrHome();
  };

  const handleGoHome = () => {
    goHome();
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
