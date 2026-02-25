import { Heading } from "@/components/atoms/Heading";

type ClinicianDashboardHeroProps = {
  firstName: string;
  lastName: string;
};

export function ClinicianDashboardHero({
  firstName,
  lastName,
}: ClinicianDashboardHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Inicio del profesional"
      description="Aquí tienes un resumen rápido de alertas, consultas recientes y el ultimo paciente atendido."
    >
      Bienvenid@, Dr(a) {firstName} {lastName}
    </Heading>
  );
}
