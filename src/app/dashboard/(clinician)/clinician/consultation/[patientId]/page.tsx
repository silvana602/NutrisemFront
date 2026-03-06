import { NewConsultationContent } from "@/components/organisms/clinician/new-consultation/NewConsultationContent";

type ConsultationPatientPageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function ConsultationPatientPage({
  params,
}: ConsultationPatientPageProps) {
  const { patientId } = await params;

  return <NewConsultationContent initialPatientId={patientId} />;
}
