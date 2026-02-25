import { Heading } from "@/components/atoms/Heading";

type PatientEducationHeroProps = {
  firstName: string;
};

export function PatientEducationHero({ firstName }: PatientEducationHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Educacion nutricional"
      description="Encuentra respuestas rapidas para dudas diarias y contenido recomendado para cada etapa."
    >
      Biblioteca educativa de {firstName}
    </Heading>
  );
}
