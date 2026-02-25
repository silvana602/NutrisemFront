import { Card } from "@/components/ui/Card";

export function PatientDiagnosisEmptyState() {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Sin diagnósticos registrados</h2>
      <p className="mt-2 text-sm text-nutri-dark-grey">
        Cuando tu médico cierre una consulta, aquí aparecera el historial de diagnósticos y el
        acceso al informe en PDF.
      </p>
    </Card>
  );
}
