import { Heading } from "@/components/atoms/Heading";

type PatientDiagnosisHeroProps = {
  firstName: string;
};

export function PatientDiagnosisHero({ firstName }: PatientDiagnosisHeroProps) {
  return (
    <Heading
      variant="panel"
      eyebrow="Diagnósticos del paciente"
      description="Revisa el historial de consultas cargadas por el médico, consulta tu estado nutricional y descarga tu informe completo en PDF."
    >
      Diagnósticos de {firstName}
    </Heading>
  );
}
