import { Card } from "@/components/ui/Card";

export function PatientProgressEmptyState() {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Sin datos de progreso todavia</h2>
      <p className="mt-2 text-sm text-nutri-dark-grey">
        Cuando tengas controles registrados, aqui podras ver tus curvas de crecimiento y tu tabla
        comparativa de evolucion.
      </p>
    </Card>
  );
}
