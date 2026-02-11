"use client";

import { useRouter } from "next/navigation";
import { Activity, BarChart3, Users, FileText } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-nutri-off-white">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="mb-6 text-4xl font-bold text-nutri-dark-grey md:text-5xl">
              Sistema de Monitoreo Nutricional en Bolivia
            </h1>
            <p className="mb-8 text-lg text-nutri-dark-grey">
              Plataforma integral para el seguimiento y diagnostico del estado
              nutricional de la poblacion boliviana, facilitando la deteccion
              temprana de malnutricion y promoviendo intervenciones oportunas.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button onClick={() => router.push("/login")}>Comenzar Ahora</Button>
              <Button variant="outline">Ver Tutorial</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-nutri-white p-6 text-center shadow-lg">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-nutri-primary">
                <Activity className="text-nutri-white" size={32} />
              </div>
              <h3 className="mb-2 font-semibold text-nutri-dark-grey">
                Seguimiento Continuo
              </h3>
              <p className="text-sm text-nutri-dark-grey">
                Monitoreo constante del estado nutricional
              </p>
            </div>

            <div className="rounded-xl bg-nutri-white p-6 text-center shadow-lg">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-nutri-secondary">
                <BarChart3 className="text-nutri-white" size={32} />
              </div>
              <h3 className="mb-2 font-semibold text-nutri-dark-grey">
                Estadisticas
              </h3>
              <p className="text-sm text-nutri-dark-grey">
                Datos actualizados sobre nutricion
              </p>
            </div>

            <div className="rounded-xl bg-nutri-white p-6 text-center shadow-lg">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-nutri-secondary">
                <Users className="text-nutri-white" size={32} />
              </div>
              <h3 className="mb-2 font-semibold text-nutri-dark-grey">
                Profesionales
              </h3>
              <p className="text-sm text-nutri-dark-grey">
                Red de medicos especializados
              </p>
            </div>

            <div className="rounded-xl bg-nutri-white p-6 text-center shadow-lg">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-nutri-primary">
                <FileText className="text-nutri-white" size={32} />
              </div>
              <h3 className="mb-2 font-semibold text-nutri-dark-grey">
                Historial y Reportes
              </h3>
              <p className="text-sm text-nutri-dark-grey">
                Informes detallados y descargables
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-t-2xl bg-nutri-primary py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-nutri-white">
            Estadisticas sobre Nutricion en Bolivia
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-nutri-dark-grey">
                Desnutricion por Edad (Ultimos 5 anos)
              </h3>
              <div className="flex h-48 items-end justify-around gap-2">
                {[18, 22, 20, 17, 15].map((value, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t-lg bg-nutri-secondary transition-all hover:opacity-80"
                      style={{ height: `${value * 8}px` }}
                    />
                    <span className="mt-2 text-xs text-nutri-dark-grey">
                      {2020 + i}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-lg font-semibold text-nutri-dark-grey">
                Sobrepeso por Edad (Ultimos 5 anos)
              </h3>
              <div className="flex h-48 items-end justify-around gap-2">
                {[12, 15, 17, 19, 21].map((value, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t-lg bg-nutri-primary transition-all hover:opacity-80"
                      style={{ height: `${value * 8}px` }}
                    />
                    <span className="mt-2 text-xs text-nutri-dark-grey">
                      {2020 + i}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
