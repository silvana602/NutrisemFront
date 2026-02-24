import { Card } from "@/components/ui/Card";

export function PatientDiagnosisEmptyState() {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Sin diagnosticos registrados</h2>
      <p className="mt-2 text-sm text-nutri-dark-grey">
        Cuando tu medico cierre una consulta, aqui aparecera el historial de diagnosticos y el
        acceso al informe en PDF.
      </p>
    </Card>
  );
}
