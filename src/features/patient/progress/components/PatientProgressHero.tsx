import { Heading } from "@/components/atoms/Heading";

type PatientProgressHeroProps = {
  firstName: string;
};

export function PatientProgressHero({ firstName }: PatientProgressHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Mi progreso"
      description="Visualiza tu evolucion en curvas de crecimiento OMS, revisa tu comparativa por controles y desbloquea logros."
    >
      Progreso de {firstName}
    </Heading>
  );
}
