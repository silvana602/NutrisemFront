import { DiagnosisDocumentContent } from "@/components/organisms/clinician/diagnosis/DiagnosisDocumentContent";

type DiagnosisPatientPageProps = {
  params: Promise<{
    patientId: string;
  }>;
  searchParams: Promise<{
    tab?: string | string[];
    step?: string | string[];
  }>;
};

function toFirstParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function DiagnosisPatientPage({
  params,
  searchParams,
}: DiagnosisPatientPageProps) {
  const [{ patientId }, query] = await Promise.all([params, searchParams]);

  return (
    <DiagnosisDocumentContent
      highlightedPatientId={patientId}
      highlightedTab={toFirstParamValue(query.tab)}
      highlightedStep={toFirstParamValue(query.step)}
    />
  );
}
