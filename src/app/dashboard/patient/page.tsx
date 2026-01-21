"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card"; // Ajusta según tu estructura
import { Button } from "@/components/ui/Button";

export default function PacienteDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido(a)</h1>

      <p className="text-gray-600 mb-8">
        Aquí puedes ver tu progreso, tus diagnósticos y las recomendaciones
        asignadas por tu nutricionista.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Diagnósticos */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-2">Diagnósticos</h2>
          <p className="text-sm text-gray-500 mb-4">
            Consulta los diagnósticos que te han realizado.
          </p>
          <Link href="/dashboard/patient/diagnosis">
            <Button>Ver Diagnósticos</Button>
          </Link>
        </Card>

        {/* Recomendaciones */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-2">Recomendaciones</h2>
          <p className="text-sm text-gray-500 mb-4">
            Revisa las recomendaciones nutricionales personalizadas.
          </p>
          <Link href="/dashboard/patient/recomendations">
            <Button>Ver Recomendaciones</Button>
          </Link>
        </Card>

        {/* Progreso */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-2">Progreso</h2>
          <p className="text-sm text-gray-500 mb-4">
            Observa cómo has mejorado mediante gráficos y métricas.
          </p>
          <Link href="/dashboard/patient/progress">
            <Button>Ver Progreso</Button>
          </Link>
        </Card>

        {/* Historial */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-2">Historial</h2>
          <p className="text-sm text-gray-500 mb-4">
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
