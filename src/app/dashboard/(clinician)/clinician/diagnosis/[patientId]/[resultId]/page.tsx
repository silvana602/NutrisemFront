import { DiagnosisDocumentContent } from "@/components/organisms/clinician/diagnosis/DiagnosisDocumentContent";

type DiagnosisPatientResultPageProps = {
  params: Promise<{
    patientId: string;
    resultId: string;
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

export default async function DiagnosisPatientResultPage({
  params,
  searchParams,
}: DiagnosisPatientResultPageProps) {
  const [{ patientId, resultId }, query] = await Promise.all([params, searchParams]);

  return (
    <DiagnosisDocumentContent
      highlightedPatientId={patientId}
      highlightedResultId={resultId}
      highlightedTab={toFirstParamValue(query.tab)}
      highlightedStep={toFirstParamValue(query.step)}
    />
  );
}
