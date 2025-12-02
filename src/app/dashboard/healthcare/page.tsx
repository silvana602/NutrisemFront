// src/app/(dashboard)/medico/page.tsx
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card"; // Ajusta según tus componentes UI
import { Button } from "@/components/ui/Button";

export default function MedicoDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido, Médico</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Pacientes */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-2">Pacientes</h2>
          <p className="text-sm text-gray-500 mb-4">
            Gestiona la lista de pacientes, consulta su historial y progreso.
          </p>
          <Link href="/dashboard/medico/pacientes">
            <Button>Ir a Pacientes</Button>
          </Link>
        </Card>

        {/* Card: Reportes */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-2">Reportes</h2>
          <p className="text-sm text-gray-500 mb-4">
            Visualiza reportes de consultas y diagnósticos.
          </p>
          <Link href="/dashboard/medico/reportes">
            <Button>Ver Reportes</Button>
          </Link>
        </Card>

        {/* Card: Historial */}
        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-2">Historial</h2>
          <p className="text-sm text-gray-500 mb-4">
            Accede al historial de consultas de todos tus pacientes.
          </p>
          <Link href="/dashboard/medico/historial">
            <Button>Ver Historial</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
