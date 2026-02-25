"use client";

import { Home, RotateCcw } from "lucide-react";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";
import { useErrorPageActions } from "@/hooks/useErrorPageActions";

const CONNECTION_ERROR_MESSAGE =
  "Error de Conexión. El puente de comunicación entre nuestros servidores se ha cortado. Estamos restableciendo la señal.";

export default function BadGatewayPage() {
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
      code="502"
      title="ERROR DE CONEXION"
      message={CONNECTION_ERROR_MESSAGE}
      imagePath="/images/errors/502.png"
      imageAlt="Error 502 Nutrisem"
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
