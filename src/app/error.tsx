"use client";

import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorPageTemplate } from "@/components/ui/ErrorPageTemplate";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GLOBAL_ERROR_MESSAGE =
  "Error de Laboratorio. Algo salio mal con la mezcla de datos. Por favor, intenta recargar el sistema mas tarde";

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  const handleGo500 = () => {
    router.push("/500");
  };

  return (
    <ErrorPageTemplate
      code="500"
      title="ERROR INTERNO DEL SISTEMA"
      message={GLOBAL_ERROR_MESSAGE}
      imagePath="/images/errors/500.png"
      imageAlt="Error 500 Nutrisem"
      actions={[
        {
          label: "Reintentar",
          onClick: reset,
          icon: RotateCcw,
          variant: "outline",
        },
        {
          label: "Ir a /500",
          onClick: handleGo500,
          icon: Home,
          variant: "solid",
        },
      ]}
    />
  );
}
