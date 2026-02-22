import { Heading } from "@/components/atoms/Heading";

type PatientDashboardHeroProps = {
  firstName: string;
};

export function PatientDashboardHero({ firstName }: PatientDashboardHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Inicio del paciente"
      description="Aqui tienes un resumen rapido de tu ultima consulta, tu evolucion y la accion mas importante para hoy."
    >
      Bienvenid@, {firstName}
    </Heading>
  );
}
