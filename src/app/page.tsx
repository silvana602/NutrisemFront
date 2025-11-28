"use client";
import { useRouter } from "next/navigation";
import { Activity, BarChart3, Users, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors } from '../lib/colors';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.offWhite }}>
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colors.darkGrey }}>
              Sistema de Monitoreo Nutricional en Bolivia
            </h1>
            <p className="text-lg mb-8" style={{ color: colors.darkGrey }}>
              Plataforma integral para el seguimiento y diagnóstico del estado nutricional de la población boliviana,
              facilitando la detección temprana de malnutrición y promoviendo intervenciones oportunas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => router.push("/login")}>
                Comenzar Ahora
              </Button>
              <Button variant="outline">
                Ver Tutorial
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-6 text-center shadow-lg" style={{ backgroundColor: 'white' }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}>
                <Activity className="text-white" size={32} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: colors.darkGrey }}>Seguimiento Continuo</h3>
              <p className="text-sm" style={{ color: colors.darkGrey }}>Monitoreo constante del estado nutricional</p>
            </div>

            <div className="rounded-xl p-6 text-center shadow-lg" style={{ backgroundColor: 'white' }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.secondary }}>
                <BarChart3 className="text-white" size={32} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: colors.darkGrey }}>Estadísticas</h3>
              <p className="text-sm" style={{ color: colors.darkGrey }}>Datos actualizados sobre nutrición</p>
            </div>

            <div className="rounded-xl p-6 text-center shadow-lg" style={{ backgroundColor: 'white' }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.secondary }}>
                <Users className="text-white" size={32} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: colors.darkGrey }}>Profesionales</h3>
              <p className="text-sm" style={{ color: colors.darkGrey }}>Red de médicos especializados</p>
            </div>

            <div className="rounded-xl p-6 text-center shadow-lg" style={{ backgroundColor: 'white' }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}>
                <FileText className="text-white" size={32} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: colors.darkGrey }}>Historial y Reportes</h3>
              <p className="text-sm" style={{ color: colors.darkGrey }}>Informes detallados y descargables</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 rounded-t-2xl" style={{ backgroundColor: colors.primary }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Estadísticas sobre Nutrición en Bolivia
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.darkGrey }}>
                Desnutrición por Edad (Últimos 5 años)
              </h3>
              <div className="h-48 flex items-end justify-around gap-2">
                {[18, 22, 20, 17, 15].map((value, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full rounded-t-lg transition-all hover:opacity-80"
                      style={{
                        backgroundColor: colors.secondary,
                        height: `${value * 8}px`
                      }}
                    />
                    <span className="text-xs mt-2" style={{ color: colors.darkGrey }}>
                      {2020 + i}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.darkGrey }}>
                Sobrepeso por Edad (Últimos 5 años)
              </h3>
              <div className="h-48 flex items-end justify-around gap-2">
                {[12, 15, 17, 19, 21].map((value, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full rounded-t-lg transition-all hover:opacity-80"
                      style={{
                        backgroundColor: colors.primary,
                        height: `${value * 8}px`
                      }}
                    />
                    <span className="text-xs mt-2" style={{ color: colors.darkGrey }}>
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
};