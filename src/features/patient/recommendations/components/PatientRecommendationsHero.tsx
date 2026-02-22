import { Heading } from "@/components/atoms/Heading";

type PatientRecommendationsHeroProps = {
  firstName: string;
};

export function PatientRecommendationsHero({
  firstName,
}: PatientRecommendationsHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Recomendaciones del paciente"
      description="Revisa tus alimentos sugeridos y los alimentos restringidos para mantener tu plan nutricional."
    >
      Recomendaciones de {firstName}
    </Heading>
  );
}
