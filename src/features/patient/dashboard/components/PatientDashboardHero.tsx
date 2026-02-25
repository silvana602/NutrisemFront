import { Heading } from "@/components/atoms/Heading";

type PatientDashboardHeroProps = {
  firstName: string;
};

export function PatientDashboardHero({ firstName }: PatientDashboardHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Inicio del paciente"
      description="Aquí tienes un resumen rápido de tu última consulta, tu evolucion y la acción mas importante para hoy."
    >
      Bienvenid@, {firstName}
    </Heading>
  );
}
