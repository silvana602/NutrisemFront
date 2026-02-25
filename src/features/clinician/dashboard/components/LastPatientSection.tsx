import {
  LastPatientCard,
  type LastPatientCardData,
} from "@/components/molecules/LastPatientCard";

type LastPatientSectionProps = {
  patient: LastPatientCardData | null;
};

export function LastPatientSection({ patient }: LastPatientSectionProps) {
  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-lg font-semibold text-nutri-dark-grey">Ultimo paciente</h2>
      </header>

      {patient ? (
        <LastPatientCard patient={patient} />
      ) : (
        <article className="nutri-clinician-surface p-4">
          <p className="text-sm text-nutri-dark-grey">
            No hay consultas registradas para los pacientes asignados.
          </p>
        </article>
      )}
    </section>
  );
}
