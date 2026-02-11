"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card"; // Ajusta según tu estructura
import { Button } from "@/components/ui/Button";

export default function PacienteDashboard() {
  return (
    <div className="bg-nutri-off-white p-6">
      <h1 className="mb-6 text-3xl font-bold text-nutri-dark-grey">Bienvenido(a)</h1>

      <p className="mb-8 text-nutri-dark-grey">
        Aquí puedes ver tu progreso, tus diagnósticos y las recomendaciones
        asignadas por tu nutricionista.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Diagnósticos */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="mb-2 text-xl font-semibold text-nutri-dark-grey">Diagnósticos</h2>
          <p className="mb-4 text-sm text-nutri-dark-grey">
            Consulta los diagnósticos que te han realizado.
          </p>
          <Link href="/dashboard/patient/diagnosis">
            <Button>Ver Diagnósticos</Button>
          </Link>
        </Card>

        {/* Recomendaciones */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="mb-2 text-xl font-semibold text-nutri-dark-grey">Recomendaciones</h2>
          <p className="mb-4 text-sm text-nutri-dark-grey">
            Revisa las recomendaciones nutricionales personalizadas.
          </p>
          <Link href="/dashboard/patient/recomendations">
            <Button>Ver Recomendaciones</Button>
          </Link>
        </Card>

        {/* Progreso */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="mb-2 text-xl font-semibold text-nutri-dark-grey">Progreso</h2>
          <p className="mb-4 text-sm text-nutri-dark-grey">
            Observa cómo has mejorado mediante gráficos y métricas.
          </p>
          <Link href="/dashboard/patient/progress">
            <Button>Ver Progreso</Button>
          </Link>
        </Card>

        {/* Historial */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="mb-2 text-xl font-semibold text-nutri-dark-grey">Historial</h2>
          <p className="mb-4 text-sm text-nutri-dark-grey">
            Accede a tu historial completo de consultas y evaluaciones.
          </p>
          <Link href="/dashboard/patient/history">
            <Button>Ver Historial</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

