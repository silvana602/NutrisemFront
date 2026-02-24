import { Heading } from "@/components/atoms/Heading";

type PatientDiagnosisHeroProps = {
  firstName: string;
};

export function PatientDiagnosisHero({ firstName }: PatientDiagnosisHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Diagnosticos del paciente"
      description="Revisa el historial de consultas cargadas por el medico, consulta tu estado nutricional y descarga tu informe completo en PDF."
    >
      Diagnosticos de {firstName}
    </Heading>
  );
}
